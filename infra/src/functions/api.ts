import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  ExecuteStatementCommand,
  RDSDataClient,
  type SqlParameter,
} from "@aws-sdk/client-rds-data";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  RAZORPAY_CURRENCY,
  cognitoGroupSchema,
  validateDonationOrderInput,
} from "@insips/contracts";
import {
  createRazorpayClient,
  createRazorpayOrder,
  safeRazorpayOrderDetails,
  verifyPaymentSignature,
} from "./razorpay-utils.js";

const logger = new Logger({ serviceName: "insips-api" });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const rds = new RDSDataClient({});
const secrets = new SecretsManagerClient({});
const appTableName = process.env.APP_TABLE_NAME ?? "";
const evidenceBucketName = process.env.EVIDENCE_BUCKET_NAME ?? "";
const databaseClusterArn = process.env.DATABASE_CLUSTER_ARN ?? "";
const databaseSecretArn = process.env.DATABASE_SECRET_ARN ?? "";
const databaseName = process.env.DATABASE_NAME ?? "insips";
const razorpaySecretArn = process.env.RAZORPAY_SECRET_ARN ?? "";
const uploadIntentSchema = z.object({
  displayName: z.string().min(1).max(160),
  declaredContentType: z.literal("application/pdf"),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});
const organizationIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
const donationOrderRequestSchema = z.object({
  causeId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  amountPaise: z.number().int().min(100).max(100_000_000),
  currency: z.literal(RAZORPAY_CURRENCY),
  donorCoversPlatformFee: z.boolean(),
});
const donationConfirmationSchema = z.object({
  donationId: z.string().uuid(),
  orderId: z.string().min(1).max(80),
  paymentId: z.string().min(1).max(80),
  signature: z.string().regex(/^[a-f0-9]{64}$/i),
});

type RazorpaySecret = {
  keyId: string;
  keySecret: string;
};

let cachedRazorpaySecret: RazorpaySecret | null = null;

function cognitoGroups(claim: unknown): string[] {
  if (Array.isArray(claim))
    return claim.filter((item): item is string => typeof item === "string");
  if (typeof claim !== "string") return [];
  try {
    const parsed = JSON.parse(claim) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return claim
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

async function activeOrganizationAdminMembership(subject: string) {
  const result = await rds.send(
    new ExecuteStatementCommand({
      resourceArn: databaseClusterArn,
      secretArn: databaseSecretArn,
      database: databaseName,
      sql: `SELECT tm.tenant_id::text, tm.permission::text
            FROM app_users u
            JOIN tenant_memberships tm ON tm.user_id = u.id
            JOIN tenants t ON t.id = tm.tenant_id
            WHERE u.cognito_sub = :subject
              AND u.archived_at IS NULL
              AND tm.status = 'ACTIVE'
              AND tm.permission = 'ADMIN'
              AND t.type = 'ORGANIZATION'
              AND t.archived_at IS NULL
              AND t.status <> 'SUSPENDED'
            ORDER BY tm.created_at ASC
            LIMIT 1`,
      parameters: [{ name: "subject", value: { stringValue: subject } }],
    }),
  );
  const record = result.records?.[0];
  return record?.[0]?.stringValue
    ? {
        organizationId: record[0].stringValue,
        permission: record[1]?.stringValue,
      }
    : null;
}

function safeDisplayName(name: string): string | null {
  const basename = name.split(/[\\/]/).pop()?.trim() ?? "";
  const withoutControls = Array.from(basename)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");
  const safe = withoutControls
    .replace(/[^a-zA-Z0-9._() -]/g, "_")
    .slice(0, 120);
  return safe && safe.toLowerCase().endsWith(".pdf") ? safe : null;
}

function response(
  statusCode: number,
  body: Record<string, unknown>,
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function text(name: string, value: string): SqlParameter {
  return { name, value: { stringValue: value } };
}

function integer(name: string, value: number): SqlParameter {
  return { name, value: { longValue: value } };
}

async function razorpayCredentials(): Promise<RazorpaySecret> {
  if (cachedRazorpaySecret) return cachedRazorpaySecret;
  if (!razorpaySecretArn) throw new Error("RAZORPAY_NOT_CONFIGURED");
  const result = await secrets.send(
    new GetSecretValueCommand({ SecretId: razorpaySecretArn }),
  );
  const parsed = z
    .object({
      keyId: z.string().min(1),
      keySecret: z.string().min(1),
    })
    .parse(JSON.parse(result.SecretString ?? "{}"));
  cachedRazorpaySecret = parsed;
  return parsed;
}

function donationCreator(groups: string[]) {
  return groups.some((group) =>
    ["INDIVIDUAL_DONOR", "CORPORATE_MEMBER", "CORPORATE_ADMIN"].includes(
      group,
    ),
  );
}

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyStructuredResultV2> {
  const requestId = event.requestContext.requestId;
  if (
    !appTableName ||
    !evidenceBucketName ||
    !databaseClusterArn ||
    !databaseSecretArn
  )
    throw new Error("REQUIRED_ENVIRONMENT_MISSING");
  logger.appendKeys({ requestId, routeKey: event.routeKey });

  if (event.rawPath === "/health") {
    return response(200, { status: "ok", service: "insips-api" });
  }

  const subjectClaim = event.requestContext.authorizer?.jwt?.claims?.sub;
  if (typeof subjectClaim !== "string" || !subjectClaim) {
    logger.warn("Request reached handler without an authenticated subject");
    return response(401, {
      code: "AUTH_REQUIRED",
      message: "Your session is missing or expired.",
    });
  }
  const subject = subjectClaim;
  const groups = cognitoGroups(
    event.requestContext.authorizer?.jwt?.claims?.["cognito:groups"],
  ).filter((group) => cognitoGroupSchema.safeParse(group).success);

  if (
    event.requestContext.http.method === "POST" &&
    event.rawPath === "/donations/orders"
  ) {
    if (!donationCreator(groups)) {
      return response(403, {
        code: "DONATION_FORBIDDEN",
        message: "Your account cannot create donations.",
      });
    }
    const idempotencyKey = event.headers["idempotency-key"];
    if (
      !idempotencyKey ||
      idempotencyKey.length < 16 ||
      idempotencyKey.length > 128
    ) {
      return response(400, {
        code: "IDEMPOTENCY_KEY_REQUIRED",
        message: "Start the donation again with a fresh request key.",
      });
    }

    let body: unknown;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return response(400, {
        code: "INVALID_REQUEST",
        message: "The donation request was not valid JSON.",
      });
    }
    const parsed = donationOrderRequestSchema.safeParse(body);
    if (!parsed.success) {
      return response(400, {
        code: "INVALID_DONATION",
        message: "Check the cause, amount, currency, and fee selection.",
      });
    }

    const causeResult = await rds.send(
      new ExecuteStatementCommand({
        resourceArn: databaseClusterArn,
        secretArn: databaseSecretArn,
        database: databaseName,
        sql: `SELECT c.id::text, c.tenant_id::text, c.status,
                     t.status, u.id::text
              FROM causes c
              JOIN tenants t ON t.id = c.tenant_id
              JOIN app_users u ON u.cognito_sub = :subject
              WHERE c.id = CAST(:cause_id AS uuid)
                AND u.archived_at IS NULL
                AND t.archived_at IS NULL
              LIMIT 1`,
        parameters: [
          text("cause_id", parsed.data.causeId),
          text("subject", subject),
        ],
      }),
    );
    const causeRecord = causeResult.records?.[0];
    const causeId = causeRecord?.[0]?.stringValue;
    const organizationId = causeRecord?.[1]?.stringValue;
    const causeStatus = causeRecord?.[2]?.stringValue;
    const organizationStatus = causeRecord?.[3]?.stringValue;
    const donorUserId = causeRecord?.[4]?.stringValue;
    if (
      !causeId ||
      !organizationId ||
      !donorUserId ||
      causeStatus !== "PUBLISHED" ||
      organizationStatus !== "APPROVED"
    ) {
      return response(404, {
        code: "CAUSE_UNAVAILABLE",
        message: "That cause is not currently accepting donations.",
      });
    }
    if (
      parsed.data.organizationId &&
      parsed.data.organizationId !== organizationId
    ) {
      return response(422, {
        code: "ORGANIZATION_MISMATCH",
        message: "The selected organization could not be verified.",
      });
    }

    let validated;
    try {
      validated = validateDonationOrderInput(
        { ...parsed.data, causeId, organizationId },
        {
          causeId,
          organizationId,
          currency: RAZORPAY_CURRENCY,
          acceptingDonations: true,
        },
      );
    } catch {
      return response(422, {
        code: "DONATION_VALIDATION_FAILED",
        message: "The donation details could not be verified.",
      });
    }

    const existingResult = await rds.send(
      new ExecuteStatementCommand({
        resourceArn: databaseClusterArn,
        secretArn: databaseSecretArn,
        database: databaseName,
        sql: `SELECT id::text, cause_id::text, tenant_id::text,
                     amount_paise, donor_covers_platform_fee,
                     platform_fee_paise, razorpay_order_id, status::text
              FROM donations
              WHERE donor_user_id = CAST(:donor_user_id AS uuid)
                AND idempotency_key = :idempotency_key
              LIMIT 1`,
        parameters: [
          text("donor_user_id", donorUserId),
          text("idempotency_key", idempotencyKey),
        ],
      }),
    );
    const existing = existingResult.records?.[0];
    if (existing) {
      const existingOrderId = existing[6]?.stringValue;
      const sameRequest =
        existing[1]?.stringValue === causeId &&
        existing[2]?.stringValue === organizationId &&
        Number(existing[3]?.longValue ?? 0) === validated.amountPaise &&
        (existing[4]?.booleanValue ?? false) ===
          validated.donorCoversPlatformFee;
      if (!sameRequest) {
        return response(409, {
          code: "IDEMPOTENCY_KEY_REUSED",
          message: "Use a new request key for different donation details.",
        });
      }
      if (!existingOrderId) {
        return response(409, {
          code: "DONATION_ORDER_UNAVAILABLE",
          message: "This donation needs to be started again with a new request key.",
        });
      }
      const credentials = await razorpayCredentials();
      const safeOrder = safeRazorpayOrderDetails(
        {
          id: existingOrderId,
          amount:
            validated.totalChargedPaise,
          currency: RAZORPAY_CURRENCY,
          status: "created",
        },
        credentials.keyId,
      );
      return response(200, {
        donationId: existing[0]?.stringValue,
        status: existing[7]?.stringValue ?? "PENDING",
        ...safeOrder,
      });
    }

    const credentials = await razorpayCredentials();
    const receipt = `don_${createHash("sha256")
      .update(`${subject}:${idempotencyKey}`)
      .digest("hex")
      .slice(0, 24)}`;
    const providerOrder = await createRazorpayOrder(
      {
        causeId,
        organizationId,
        amountPaise: validated.amountPaise,
        platformFeePaise: validated.platformFeePaise,
        totalChargedPaise: validated.totalChargedPaise,
        currency: RAZORPAY_CURRENCY,
      },
      receipt,
      credentials,
    );
    const donationInsert = await rds.send(
      new ExecuteStatementCommand({
        resourceArn: databaseClusterArn,
        secretArn: databaseSecretArn,
        database: databaseName,
        sql: `INSERT INTO donations
                (donor_user_id, tenant_id, cause_id, amount_paise,
                 fee_rate_bps, platform_fee_paise, razorpay_fee_paise,
                 net_organization_paise, donor_covers_platform_fee,
                 idempotency_key, status, razorpay_order_id)
              VALUES (CAST(:donor_user_id AS uuid), CAST(:tenant_id AS uuid),
                      CAST(:cause_id AS uuid), :amount_paise, 25,
                      :platform_fee_paise, 0, :net_organization_paise,
                      :donor_covers_platform_fee, :idempotency_key,
                      'PENDING', :razorpay_order_id)
              RETURNING id::text`,
        parameters: [
          text("donor_user_id", donorUserId),
          text("tenant_id", organizationId),
          text("cause_id", causeId),
          integer("amount_paise", validated.amountPaise),
          integer("platform_fee_paise", validated.platformFeePaise),
          integer("net_organization_paise", validated.netOrganizationPaise),
          {
            name: "donor_covers_platform_fee",
            value: { booleanValue: validated.donorCoversPlatformFee },
          },
          text("idempotency_key", idempotencyKey),
          text("razorpay_order_id", providerOrder.id),
        ],
      }),
    );
    const donationId = donationInsert.records?.[0]?.[0]?.stringValue;
    if (!donationId) throw new Error("DONATION_NOT_CREATED");
    const safeOrder = safeRazorpayOrderDetails(providerOrder, credentials.keyId);
    return response(201, {
      donationId,
      status: "PENDING",
      ...safeOrder,
    });
  }

  if (
    event.requestContext.http.method === "POST" &&
    event.rawPath === "/donations/confirm"
  ) {
    if (!donationCreator(groups)) {
      return response(403, {
        code: "DONATION_FORBIDDEN",
        message: "Your account cannot confirm donations.",
      });
    }
    let body: unknown;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return response(400, {
        code: "INVALID_REQUEST",
        message: "The payment confirmation was not valid JSON.",
      });
    }
    const parsed = donationConfirmationSchema.safeParse(body);
    if (!parsed.success) {
      return response(400, {
        code: "INVALID_PAYMENT_CONFIRMATION",
        message: "The payment confirmation could not be verified.",
      });
    }
    const donationResult = await rds.send(
      new ExecuteStatementCommand({
        resourceArn: databaseClusterArn,
        secretArn: databaseSecretArn,
        database: databaseName,
        sql: `SELECT d.id::text, d.razorpay_order_id, d.amount_paise,
                     d.platform_fee_paise, d.donor_covers_platform_fee,
                     d.status::text
              FROM donations d
              JOIN app_users u ON u.id = d.donor_user_id
              WHERE d.id = CAST(:donation_id AS uuid)
                AND u.cognito_sub = :subject
                AND u.archived_at IS NULL
              LIMIT 1`,
        parameters: [
          text("donation_id", parsed.data.donationId),
          text("subject", subject),
        ],
      }),
    );
    const donation = donationResult.records?.[0];
    if (!donation) {
      return response(404, {
        code: "DONATION_NOT_FOUND",
        message: "The donation could not be found.",
      });
    }
    const expectedOrderId = donation[1]?.stringValue ?? "";
    const amountPaise = Number(donation[2]?.longValue ?? 0);
    const platformFeePaise = Number(donation[3]?.longValue ?? 0);
    const totalChargedPaise =
      amountPaise +
      ((donation[4]?.booleanValue ?? false) ? platformFeePaise : 0);
    if (expectedOrderId !== parsed.data.orderId) {
      return response(422, {
        code: "PAYMENT_ORDER_MISMATCH",
        message: "The payment order could not be verified.",
      });
    }
    const credentials = await razorpayCredentials();
    if (
      !verifyPaymentSignature(
        parsed.data.orderId,
        parsed.data.paymentId,
        parsed.data.signature,
        credentials.keySecret,
      )
    ) {
      return response(422, {
        code: "INVALID_PAYMENT_SIGNATURE",
        message: "The payment signature could not be verified.",
      });
    }
    const providerPayment = await createRazorpayClient(credentials).payments.fetch(
      parsed.data.paymentId,
    );
    if (
      providerPayment.order_id !== parsed.data.orderId ||
      Number(providerPayment.amount) !== totalChargedPaise ||
      providerPayment.currency !== RAZORPAY_CURRENCY
    ) {
      return response(422, {
        code: "PAYMENT_DETAILS_MISMATCH",
        message: "The payment amount or order could not be verified.",
      });
    }
    const status =
      providerPayment.status === "failed"
        ? "FAILED"
        : providerPayment.status === "captured" ||
            providerPayment.status === "authorized"
          ? "AUTHORIZED"
          : "PENDING";
    await rds.send(
      new ExecuteStatementCommand({
        resourceArn: databaseClusterArn,
        secretArn: databaseSecretArn,
        database: databaseName,
        sql: `UPDATE donations
              SET razorpay_payment_id = COALESCE(razorpay_payment_id, :payment_id),
                  status = CASE
                    WHEN status IN ('CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED')
                      THEN status
                    ELSE :status::donation_status
                  END,
                  updated_at = now()
              WHERE id = CAST(:donation_id AS uuid)`,
        parameters: [
          text("payment_id", parsed.data.paymentId),
          text("status", status),
          text("donation_id", parsed.data.donationId),
        ],
      }),
    );
    return response(200, {
      donationId: parsed.data.donationId,
      status: status === "AUTHORIZED" ? "PENDING" : status,
      serverVerified: true,
      message:
        status === "AUTHORIZED"
          ? "Payment verified. Public progress will update after the provider confirmation webhook."
          : "Payment status verified.",
    });
  }

  if (
    event.requestContext.http.method === "DELETE" &&
    event.rawPath === "/account"
  ) {
    await rds.send(
      new ExecuteStatementCommand({
        resourceArn: databaseClusterArn,
        secretArn: databaseSecretArn,
        database: databaseName,
        sql: `WITH archived_user AS (
                UPDATE app_users
                SET archived_at = now(), deletion_requested_at = now(), updated_at = now()
                WHERE cognito_sub = :subject
                RETURNING id
              )
              UPDATE tenant_memberships
              SET status = 'ARCHIVED', updated_at = now()
              WHERE user_id IN (SELECT id FROM archived_user)`,
        parameters: [{ name: "subject", value: { stringValue: subject } }],
      }),
    );
    return response(202, {
      status: "ARCHIVED",
      message: "Account archived pending the production retention process.",
    });
  }

  if (
    event.requestContext.http.method === "POST" &&
    event.rawPath === "/account/restore"
  ) {
    await rds.send(
      new ExecuteStatementCommand({
        resourceArn: databaseClusterArn,
        secretArn: databaseSecretArn,
        database: databaseName,
        sql: `WITH restored_user AS (
                UPDATE app_users
                SET archived_at = NULL, deletion_requested_at = NULL, updated_at = now()
                WHERE cognito_sub = :subject
                RETURNING id
              )
              UPDATE tenant_memberships
              SET status = 'ACTIVE', updated_at = now()
              WHERE user_id IN (SELECT id FROM restored_user)
                AND status = 'ARCHIVED'`,
        parameters: [{ name: "subject", value: { stringValue: subject } }],
      }),
    );
    return response(200, { status: "ACTIVE" });
  }

  const previewMatch = event.rawPath.match(
    /^\/verification-documents\/([0-9a-f-]{36})\/preview$/i,
  );
  if (event.requestContext.http.method === "GET" && previewMatch) {
    if (!groups.includes("PLATFORM_ADMIN")) {
      return response(403, {
        code: "DOCUMENT_PREVIEW_FORBIDDEN",
        message: "You do not have permission to preview this document.",
      });
    }
    const documentResult = await rds.send(
      new ExecuteStatementCommand({
        resourceArn: databaseClusterArn,
        secretArn: databaseSecretArn,
        database: databaseName,
        sql: `SELECT object_key
              FROM private_documents
              WHERE id = CAST(:document_id AS uuid)
                AND archived_at IS NULL
                AND scan_status = 'CLEAN'
              LIMIT 1`,
        parameters: [
          {
            name: "document_id",
            value: { stringValue: previewMatch[1] },
          },
        ],
      }),
    );
    const objectKey = documentResult.records?.[0]?.[0]?.stringValue;
    if (!objectKey) {
      return response(404, {
        code: "DOCUMENT_PREVIEW_UNAVAILABLE",
        message: "The secure preview is unavailable.",
      });
    }
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: evidenceBucketName, Key: objectKey }),
      { expiresIn: 300 },
    );
    return response(200, { url, expiresInSeconds: 300 });
  }

  if (
    event.requestContext.http.method === "POST" &&
    event.rawPath === "/evidence/upload-intent"
  ) {
    const idempotencyKey = event.headers["idempotency-key"];
    if (
      !idempotencyKey ||
      idempotencyKey.length < 16 ||
      idempotencyKey.length > 128
    ) {
      return response(400, {
        code: "IDEMPOTENCY_KEY_REQUIRED",
        message: "Start the upload again from the evidence page.",
      });
    }

    let body: unknown;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return response(400, {
        code: "INVALID_REQUEST",
        message: "The upload request was not valid JSON.",
      });
    }
    const parsed = uploadIntentSchema.safeParse(body);
    const displayName = parsed.success
      ? safeDisplayName(parsed.data.displayName)
      : null;
    if (!parsed.success || !displayName) {
      return response(400, {
        code: "INVALID_PDF",
        message: "Choose a PDF no larger than 10 MB.",
      });
    }

    if (!groups.includes("ORGANIZATION_ADMIN")) {
      logger.warn("Upload intent denied by coarse role policy");
      return response(403, {
        code: "UPLOAD_FORBIDDEN",
        message: "You do not have permission to add evidence.",
      });
    }
    const membership = await activeOrganizationAdminMembership(subject);
    const organizationId = organizationIdSchema.safeParse(
      membership?.organizationId,
    );
    if (!organizationId.success || membership?.permission !== "ADMIN") {
      logger.warn("Upload intent denied by membership policy");
      return response(403, {
        code: "UPLOAD_FORBIDDEN",
        message: "You do not have permission to add evidence.",
      });
    }

    const evidenceId = createHash("sha256")
      .update(`${subject}:${idempotencyKey}`)
      .digest("hex")
      .slice(0, 32);
    const objectKey = `quarantine/${organizationId.data}/${evidenceId}.pdf`;
    const now = new Date().toISOString();
    try {
      await ddb.send(
        new PutCommand({
          TableName: appTableName,
          Item: {
            pk: `ORG#${organizationId.data}`,
            sk: `EVIDENCE#${evidenceId}`,
            evidenceId,
            organizationId: organizationId.data,
            displayName,
            declaredContentType: parsed.data.declaredContentType,
            expectedSize: parsed.data.size,
            state: "CREATED",
            createdBy: subject,
            createdAt: now,
            gsi1pk: `ORG#${organizationId.data}#EVIDENCE`,
            gsi1sk: `${now}#${evidenceId}`,
            version: 1,
          },
          ConditionExpression:
            "attribute_not_exists(pk) AND attribute_not_exists(sk)",
        }),
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name !== "ConditionalCheckFailedException"
      )
        throw error;
    }

    const upload = await createPresignedPost(s3, {
      Bucket: evidenceBucketName,
      Key: objectKey,
      Expires: 300,
      Fields: {
        "Content-Type": "application/pdf",
        "x-amz-meta-evidence-id": evidenceId,
      },
      Conditions: [
        ["content-length-range", 1, 10 * 1024 * 1024],
        ["eq", "$Content-Type", "application/pdf"],
        ["eq", "$x-amz-meta-evidence-id", evidenceId],
      ],
    });
    logger.info("Created constrained upload intent", {
      evidenceId,
      organizationId: organizationId.data,
    });
    return response(201, {
      evidenceId,
      displayName,
      upload,
      expiresInSeconds: 300,
    });
  }

  logger.info(
    "Authenticated API route is not yet connected to a domain handler",
  );
  return response(501, {
    code: "ROUTE_NOT_IMPLEMENTED",
    message: "This deployment route is not available yet.",
    requestId,
  });
}
