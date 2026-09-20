import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import {
  BeginTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RDSDataClient,
  RollbackTransactionCommand,
  type SqlParameter,
} from "@aws-sdk/client-rds-data";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { createHash } from "node:crypto";
import { z } from "zod";
import { verifyRazorpayWebhookSignature } from "./razorpay-utils.js";

const rds = new RDSDataClient({});
const secrets = new SecretsManagerClient({});
const resourceArn = process.env.DATABASE_CLUSTER_ARN ?? "";
const secretArn = process.env.DATABASE_SECRET_ARN ?? "";
const database = process.env.DATABASE_NAME ?? "insips";
const razorpaySecretArn = process.env.RAZORPAY_SECRET_ARN ?? "";

const webhookSchema = z.object({
  id: z.string().min(1).max(160),
  event: z.enum([
    "payment.authorized",
    "payment.captured",
    "payment.failed",
    "payment.cancelled",
    "refund.processed",
    "transfer.created",
    "transfer.pending",
    "transfer.processed",
    "transfer.failed",
    "transfer.reversed",
    "transfer.partially_reversed",
  ]),
  payload: z
    .object({
      payment: z
        .object({
          entity: z.object({
            id: z.string(),
            order_id: z.string().nullable().optional(),
            amount: z.number().int().nonnegative(),
          }),
        })
        .optional(),
      refund: z
        .object({
          entity: z.object({
            id: z.string(),
            payment_id: z.string(),
            amount: z.number().int().positive(),
          }),
        })
        .optional(),
      transfer: z
        .object({
          entity: z.object({
            id: z.string(),
            source: z.string().optional(),
          }),
        })
        .optional(),
    })
    .passthrough(),
});

type SecretValue = { webhookSecret: string };
let cachedSecret: SecretValue | null = null;

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

async function webhookSecret(): Promise<string> {
  if (cachedSecret) return cachedSecret.webhookSecret;
  const result = await secrets.send(
    new GetSecretValueCommand({ SecretId: razorpaySecretArn }),
  );
  const parsed = z
    .object({ webhookSecret: z.string().min(24) })
    .parse(JSON.parse(result.SecretString ?? "{}"));
  cachedSecret = parsed;
  return parsed.webhookSecret;
}

function text(name: string, value: string): SqlParameter {
  return { name, value: { stringValue: value } };
}

function integer(name: string, value: number): SqlParameter {
  return { name, value: { longValue: value } };
}

function header(headers: Record<string, string | undefined>, name: string) {
  const expected = name.toLowerCase();
  return Object.entries(headers).find(
    ([key]) => key.toLowerCase() === expected,
  )?.[1];
}

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  if (!resourceArn || !secretArn || !razorpaySecretArn) {
    throw new Error("PAYMENT_ENVIRONMENT_MISSING");
  }
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body ?? "", "base64").toString("utf8")
    : (event.body ?? "");
  const signature = header(event.headers, "x-razorpay-signature") ?? "";
  if (
    !signature ||
    !verifyRazorpayWebhookSignature(rawBody, signature, await webhookSecret())
  ) {
    return response(401, { code: "INVALID_WEBHOOK_SIGNATURE" });
  }

  let parsed: z.infer<typeof webhookSchema>;
  try {
    parsed = webhookSchema.parse(JSON.parse(rawBody));
  } catch {
    return response(400, { code: "INVALID_WEBHOOK_PAYLOAD" });
  }

  const providerEventId =
    header(event.headers, "x-razorpay-event-id") ?? parsed.id;
  const paymentId =
    parsed.payload.payment?.entity.id ??
    parsed.payload.refund?.entity.payment_id ??
    parsed.payload.transfer?.entity.source ??
    "";
  const orderId = parsed.payload.payment?.entity.order_id ?? "";
  const transferId = parsed.payload.transfer?.entity.id ?? "";
  const digest = createHash("sha256").update(rawBody).digest("hex");
  const transaction = await rds.send(
    new BeginTransactionCommand({ resourceArn, secretArn, database }),
  );
  const transactionId = transaction.transactionId;
  if (!transactionId) throw new Error("PAYMENT_TRANSACTION_NOT_STARTED");

  const execute = (sql: string, parameters: SqlParameter[] = []) =>
    rds.send(
      new ExecuteStatementCommand({
        resourceArn,
        secretArn,
        database,
        transactionId,
        sql,
        parameters,
      }),
    );

  try {
    const donationResult = await execute(
      `SELECT id::text, cause_id::text, amount_paise, platform_fee_paise,
              donor_covers_platform_fee, refunded_paise, status::text
       FROM donations
       WHERE razorpay_payment_id = :payment_id
          OR (:order_id <> '' AND razorpay_order_id = :order_id)
          OR (:transfer_id <> '' AND razorpay_transfer_id = :transfer_id)
       FOR UPDATE`,
      [
        text("payment_id", paymentId),
        text("order_id", orderId),
        text("transfer_id", transferId),
      ],
    );
    const donationRecord = donationResult.records?.[0];
    if (!donationRecord) {
      await rds.send(
        new CommitTransactionCommand({ resourceArn, secretArn, transactionId }),
      );
      return response(202, { accepted: true });
    }
    const donationId = donationRecord[0]?.stringValue ?? "";
    const causeId = donationRecord[1]?.stringValue ?? "";
    const donationAmount = Number(donationRecord[2]?.longValue ?? 0);
    const platformFee = Number(donationRecord[3]?.longValue ?? 0);
    const donorCoversPlatformFee = donationRecord[4]?.booleanValue ?? false;
    const refundedBefore = Number(donationRecord[5]?.longValue ?? 0);
    const donationStatus = donationRecord[6]?.stringValue ?? "";
    const chargedAmount = donorCoversPlatformFee
      ? donationAmount + platformFee
      : donationAmount;

    const paymentAmount = parsed.payload.payment?.entity.amount;
    if (
      paymentAmount !== undefined &&
      ["payment.authorized", "payment.captured"].includes(parsed.event) &&
      paymentAmount !== chargedAmount
    ) {
      await rds.send(
        new RollbackTransactionCommand({ resourceArn, secretArn, transactionId }),
      );
      return response(422, { code: "PAYMENT_AMOUNT_MISMATCH" });
    }

    const eventInsert = await execute(
      `INSERT INTO payment_events
         (provider, provider_event_id, donation_id, event_type, amount_paise, payload_digest)
       VALUES ('RAZORPAY', :event_id, CAST(:donation_id AS uuid), :event_type, :amount_paise, :payload_digest)
       ON CONFLICT (provider_event_id) DO NOTHING
       RETURNING id::text`,
      [
        text("event_id", providerEventId),
        text("donation_id", donationId),
        text("event_type", parsed.event),
        integer(
          "amount_paise",
          parsed.payload.refund?.entity.amount ??
            parsed.payload.payment?.entity.amount ??
            0,
        ),
        text("payload_digest", digest),
      ],
    );
    const eventId = eventInsert.records?.[0]?.[0]?.stringValue;
    if (!eventId) {
      await rds.send(
        new CommitTransactionCommand({ resourceArn, secretArn, transactionId }),
      );
      return response(200, { accepted: true, duplicate: true });
    }

    if (
      parsed.event === "payment.authorized" &&
      ["CREATED", "PENDING"].includes(donationStatus)
    ) {
      await execute(
        `UPDATE donations
         SET status = 'AUTHORIZED',
             razorpay_payment_id = COALESCE(razorpay_payment_id, :payment_id),
             updated_at = now()
         WHERE id = CAST(:donation_id AS uuid)`,
        [text("payment_id", paymentId), text("donation_id", donationId)],
      );
    } else if (
      parsed.event === "payment.captured" &&
      ["CREATED", "PENDING", "AUTHORIZED"].includes(donationStatus)
    ) {
      await execute(
        `UPDATE donations
         SET status = 'CAPTURED',
             razorpay_payment_id = COALESCE(razorpay_payment_id, :payment_id),
             updated_at = now()
         WHERE id = CAST(:donation_id AS uuid)`,
        [text("payment_id", paymentId), text("donation_id", donationId)],
      );
      await execute(
        `UPDATE causes SET raised_paise = raised_paise + :amount, updated_at = now()
         WHERE id = CAST(:cause_id AS uuid)`,
        [integer("amount", donationAmount), text("cause_id", causeId)],
      );
      await execute(
        `INSERT INTO accounting_ledger
          (donation_id, event_id, account_code, direction, amount_paise)
         VALUES (CAST(:donation_id AS uuid), CAST(:event_id AS uuid), 'CAUSE_PROGRESS', 'CREDIT', :amount)`,
        [
          text("donation_id", donationId),
          text("event_id", eventId),
          integer("amount", donationAmount),
        ],
      );
    } else if (
      (parsed.event === "payment.failed" ||
        parsed.event === "payment.cancelled") &&
      ["CREATED", "PENDING", "AUTHORIZED"].includes(donationStatus)
    ) {
      await execute(
        `UPDATE donations
         SET status = :status::donation_status,
             razorpay_payment_id = COALESCE(razorpay_payment_id, NULLIF(:payment_id, '')),
             updated_at = now()
         WHERE id = CAST(:donation_id AS uuid)`,
        [
          text("status", parsed.event === "payment.failed" ? "FAILED" : "CANCELLED"),
          text("payment_id", paymentId),
          text("donation_id", donationId),
        ],
      );
    } else if (
      parsed.event === "refund.processed" &&
      ["CAPTURED", "PARTIALLY_REFUNDED"].includes(donationStatus)
    ) {
      const requestedRefund = parsed.payload.refund?.entity.amount ?? 0;
      const actualRefund = Math.min(
        requestedRefund,
        donationAmount - refundedBefore,
      );
      const refundedAfter = refundedBefore + actualRefund;
      await execute(
        `UPDATE donations
         SET refunded_paise = :refunded,
             status = :status::donation_status,
             updated_at = now()
         WHERE id = CAST(:donation_id AS uuid)`,
        [
          integer("refunded", refundedAfter),
          text(
            "status",
            refundedAfter === donationAmount
              ? "REFUNDED"
              : "PARTIALLY_REFUNDED",
          ),
          text("donation_id", donationId),
        ],
      );
      await execute(
        `UPDATE causes
         SET raised_paise = GREATEST(0, raised_paise - :amount), updated_at = now()
         WHERE id = CAST(:cause_id AS uuid)`,
        [integer("amount", actualRefund), text("cause_id", causeId)],
      );
      await execute(
        `INSERT INTO accounting_ledger
          (donation_id, event_id, account_code, direction, amount_paise)
         VALUES (CAST(:donation_id AS uuid), CAST(:event_id AS uuid), 'CAUSE_PROGRESS', 'DEBIT', :amount)`,
        [
          text("donation_id", donationId),
          text("event_id", eventId),
          integer("amount", actualRefund),
        ],
      );
    } else if (parsed.event.startsWith("transfer.")) {
      const statusByEvent: Record<string, string> = {
        "transfer.created": "CREATED",
        "transfer.pending": "PENDING",
        "transfer.processed": "PROCESSED",
        "transfer.failed": "FAILED",
        "transfer.reversed": "REVERSED",
        "transfer.partially_reversed": "PARTIALLY_REVERSED",
      };
      await execute(
        `UPDATE donations
         SET transfer_status = :status::transfer_status,
             razorpay_transfer_id = COALESCE(razorpay_transfer_id, :transfer_id),
             updated_at = now()
         WHERE id = CAST(:donation_id AS uuid)`,
        [
          text("status", statusByEvent[parsed.event] ?? "PENDING"),
          text("transfer_id", transferId),
          text("donation_id", donationId),
        ],
      );
    }

    await rds.send(
      new CommitTransactionCommand({ resourceArn, secretArn, transactionId }),
    );
    return response(200, { accepted: true, duplicate: false });
  } catch (error) {
    await rds.send(
      new RollbackTransactionCommand({ resourceArn, secretArn, transactionId }),
    );
    throw error;
  }
}
