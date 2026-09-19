import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Arn,
  ArnFormat,
  Aws,
  CfnCondition,
  CfnOutput,
  CfnParameter,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  StackProps,
  Tags,
} from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as budgets from "aws-cdk-lib/aws-budgets";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as guardduty from "aws-cdk-lib/aws-guardduty";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export type InsipsStackProps = StackProps & { environment: string };

export class InsipsStack extends Stack {
  constructor(scope: Construct, id: string, props: InsipsStackProps) {
    super(scope, id, props);

    Tags.of(this).add("project", "insips-passport");
    Tags.of(this).add("environment", props.environment);
    Tags.of(this).add("owner", "insips-team");

    const appOrigin = new CfnParameter(this, "AppOrigin", {
      type: "String",
      default: "http://localhost:3000",
      description:
        "Exact trusted web origin for Cognito callbacks and API CORS.",
    });
    const bedrockModelId = new CfnParameter(this, "BedrockModelId", {
      type: "String",
      default: "",
      description:
        "Verified Bedrock text model or inference-profile ID for the selected region.",
    });
    const enableMalwareProtection = new CfnParameter(
      this,
      "EnableMalwareProtection",
      {
        type: "String",
        allowedValues: ["true", "false"],
        default: "false",
        description:
          "Enable only after region support and cost approval are confirmed.",
      },
    );
    const budgetAmount = new CfnParameter(this, "MonthlyBudgetUsd", {
      type: "Number",
      default: 0,
      minValue: 0,
      description: "Non-zero monthly AWS budget amount approved by the owner.",
    });
    const budgetEmail = new CfnParameter(this, "BudgetEmail", {
      type: "String",
      default: "",
      description: "Notification email approved by the owner.",
    });

    const appTable = new dynamodb.Table(this, "AppTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      timeToLiveAttribute: "expiresAt",
      removalPolicy: RemovalPolicy.DESTROY,
    });
    appTable.addGlobalSecondaryIndex({
      indexName: "gsi1",
      partitionKey: { name: "gsi1pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "gsi1sk", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const publicTable = new dynamodb.Table(this, "PublicProjectionTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const evidenceBucket = new s3.Bucket(this, "EvidenceBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      eventBridgeEnabled: true,
      versioned: true,
      lifecycleRules: [
        {
          id: "expire-abandoned-quarantine",
          prefix: "quarantine/",
          expiration: Duration.days(14),
          abortIncompleteMultipartUploadAfter: Duration.days(1),
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: false,
    });

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      standardAttributes: { email: { required: true, mutable: false } },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: { otp: true, sms: false },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 12,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: true,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const userPoolClient = userPool.addClient("WebClient", {
      generateSecret: false,
      authFlows: { userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [`${appOrigin.valueAsString}/api/auth/callback`],
        logoutUrls: [`${appOrigin.valueAsString}/`],
      },
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.minutes(15),
      idTokenValidity: Duration.minutes(15),
      refreshTokenValidity: Duration.days(1),
      enableTokenRevocation: true,
    });
    new cognito.CfnUserPoolDomain(this, "UserPoolDomain", {
      userPoolId: userPool.userPoolId,
      domain: Fn.join("-", ["insips-passport", Aws.ACCOUNT_ID, Aws.REGION]),
    });
    for (const groupName of [
      "ORG_ADMIN",
      "ORG_MEMBER",
      "PLATFORM_REVIEWER",
      "PLATFORM_ADMIN",
      "CSR_USER",
    ]) {
      new cognito.CfnUserPoolGroup(this, `${groupName}Group`, {
        userPoolId: userPool.userPoolId,
        groupName,
      });
    }

    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: true,
        target: "node22",
        format: lambdaNode.OutputFormat.ESM,
      },
    } as const;

    const startExtraction = new lambdaNode.NodejsFunction(
      this,
      "StartExtractionFunction",
      {
        ...commonLambdaProps,
        logGroup: new logs.LogGroup(this, "StartExtractionLogs", {
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        entry: path.join(
          currentDirectory,
          "../src/functions/start-extraction.ts",
        ),
        handler: "handler",
      },
    );
    const getExtraction = new lambdaNode.NodejsFunction(
      this,
      "GetExtractionFunction",
      {
        ...commonLambdaProps,
        logGroup: new logs.LogGroup(this, "GetExtractionLogs", {
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        entry: path.join(
          currentDirectory,
          "../src/functions/get-extraction.ts",
        ),
        handler: "handler",
        timeout: Duration.minutes(1),
      },
    );
    const analyze = new lambdaNode.NodejsFunction(this, "AnalyzeFunction", {
      ...commonLambdaProps,
      logGroup: new logs.LogGroup(this, "AnalyzeLogs", {
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      entry: path.join(currentDirectory, "../src/functions/analyze.ts"),
      handler: "handler",
      timeout: Duration.minutes(1),
      environment: { BEDROCK_MODEL_ID: bedrockModelId.valueAsString },
    });

    evidenceBucket.grantRead(startExtraction);
    startExtraction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:StartDocumentTextDetection"],
        resources: ["*"],
      }),
    );
    getExtraction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:GetDocumentTextDetection"],
        resources: ["*"],
      }),
    );
    analyze.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      }),
    );

    const startTask = new tasks.LambdaInvoke(this, "Start Textract", {
      lambdaFunction: startExtraction,
      outputPath: "$.Payload",
    });
    const waitForTextract = new sfn.Wait(this, "Wait for Textract", {
      time: sfn.WaitTime.duration(Duration.seconds(5)),
    });
    const getTask = new tasks.LambdaInvoke(this, "Read Textract status", {
      lambdaFunction: getExtraction,
      outputPath: "$.Payload",
    });
    const analyzeTask = new tasks.LambdaInvoke(
      this,
      "Run bounded Compass analysis",
      { lambdaFunction: analyze, outputPath: "$.Payload" },
    );
    const extractionFailed = new sfn.Fail(this, "Extraction failed", {
      error: "EXTRACTION_FAILED",
      cause: "Textract did not return a successful bounded result.",
    });
    const workflowComplete = new sfn.Succeed(this, "Needs human confirmation");
    const extractionChoice = new sfn.Choice(this, "Extraction complete?")
      .when(
        sfn.Condition.stringEquals("$.extractionStatus", "IN_PROGRESS"),
        waitForTextract,
      )
      .when(
        sfn.Condition.stringEquals("$.extractionStatus", "SUCCEEDED"),
        analyzeTask.next(workflowComplete),
      )
      .otherwise(extractionFailed);
    startTask.next(waitForTextract);
    waitForTextract.next(getTask);
    getTask.next(extractionChoice);

    const evidenceWorkflow = new sfn.StateMachine(this, "EvidenceWorkflow", {
      definitionBody: sfn.DefinitionBody.fromChainable(startTask),
      timeout: Duration.minutes(15),
      tracingEnabled: true,
      logs: {
        destination: new logs.LogGroup(this, "EvidenceWorkflowLogs", {
          retention: logs.RetentionDays.ONE_WEEK,
        }),
        level: sfn.LogLevel.ERROR,
        includeExecutionData: false,
      },
    });

    const scanRouter = new lambdaNode.NodejsFunction(
      this,
      "ScanRouterFunction",
      {
        ...commonLambdaProps,
        logGroup: new logs.LogGroup(this, "ScanRouterLogs", {
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        entry: path.join(currentDirectory, "../src/functions/route-scan.ts"),
        handler: "handler",
        environment: {
          APP_TABLE_NAME: appTable.tableName,
          STATE_MACHINE_ARN: evidenceWorkflow.stateMachineArn,
        },
      },
    );
    appTable.grantReadWriteData(scanRouter);
    evidenceWorkflow.grantStartExecution(scanRouter);

    new events.Rule(this, "GuardDutyScanResultRule", {
      eventPattern: {
        source: ["aws.guardduty"],
        detailType: ["GuardDuty Malware Protection Object Scan Result"],
        detail: {
          s3ObjectDetails: { bucketName: [evidenceBucket.bucketName] },
        },
      },
      targets: [new targets.LambdaFunction(scanRouter, { retryAttempts: 2 })],
    });

    const guardDutyRole = new iam.Role(this, "GuardDutyMalwareRole", {
      assumedBy: new iam.ServicePrincipal(
        "malware-protection-plan.guardduty.amazonaws.com",
      ),
    });
    guardDutyRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "events:PutRule",
          "events:DeleteRule",
          "events:PutTargets",
          "events:RemoveTargets",
          "events:DescribeRule",
          "events:ListTargetsByRule",
        ],
        resources: [
          Arn.format(
            {
              service: "events",
              resource: "rule",
              resourceName: "DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*",
              arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
            },
            this,
          ),
        ],
      }),
    );
    guardDutyRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "s3:GetBucketNotification",
          "s3:PutBucketNotification",
          "s3:ListBucket",
          "s3:GetBucketLocation",
        ],
        resources: [evidenceBucket.bucketArn],
      }),
    );
    guardDutyRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetObjectTagging",
          "s3:PutObjectTagging",
        ],
        resources: [evidenceBucket.arnForObjects("quarantine/*")],
      }),
    );

    const malwarePlanCondition = new CfnCondition(
      this,
      "MalwareProtectionApproved",
      {
        expression: Fn.conditionEquals(
          enableMalwareProtection.valueAsString,
          "true",
        ),
      },
    );
    const malwarePlan = new guardduty.CfnMalwareProtectionPlan(
      this,
      "MalwareProtectionPlan",
      {
        role: guardDutyRole.roleArn,
        protectedResource: {
          s3Bucket: {
            bucketName: evidenceBucket.bucketName,
            objectPrefixes: ["quarantine/"],
          },
        },
        actions: { tagging: { status: "ENABLED" } },
        tags: [
          { key: "project", value: "insips-passport" },
          { key: "environment", value: props.environment },
        ],
      },
    );
    malwarePlan.cfnOptions.condition = malwarePlanCondition;

    const apiFunction = new lambdaNode.NodejsFunction(this, "ApiFunction", {
      ...commonLambdaProps,
      logGroup: new logs.LogGroup(this, "ApiLogs", {
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      entry: path.join(currentDirectory, "../src/functions/api.ts"),
      handler: "handler",
      environment: {
        APP_TABLE_NAME: appTable.tableName,
        PUBLIC_TABLE_NAME: publicTable.tableName,
        EVIDENCE_BUCKET_NAME: evidenceBucket.bucketName,
      },
    });
    appTable.grantReadWriteData(apiFunction);
    publicTable.grantReadWriteData(apiFunction);
    evidenceBucket.grantReadWrite(apiFunction, "quarantine/*");

    const api = new apigwv2.CfnApi(this, "HttpApi", {
      protocolType: "HTTP",
      corsConfiguration: {
        allowCredentials: true,
        allowHeaders: [
          "authorization",
          "content-type",
          "x-csrf-token",
          "idempotency-key",
        ],
        allowMethods: ["GET", "POST", "PUT", "DELETE"],
        allowOrigins: [appOrigin.valueAsString],
        maxAge: 600,
      },
    });
    const integration = new apigwv2.CfnIntegration(this, "ApiIntegration", {
      apiId: api.ref,
      integrationType: "AWS_PROXY",
      integrationUri: apiFunction.functionArn,
      integrationMethod: "POST",
      payloadFormatVersion: "2.0",
      timeoutInMillis: 28_000,
    });
    const authorizer = new apigwv2.CfnAuthorizer(this, "JwtAuthorizer", {
      apiId: api.ref,
      authorizerType: "JWT",
      name: "CognitoJwtAuthorizer",
      identitySource: ["$request.header.Authorization"],
      jwtConfiguration: {
        audience: [userPoolClient.userPoolClientId],
        issuer: Fn.join("", [
          "https://cognito-idp.",
          Aws.REGION,
          ".amazonaws.com/",
          userPool.userPoolId,
        ]),
      },
    });
    new apigwv2.CfnRoute(this, "HealthRoute", {
      apiId: api.ref,
      routeKey: "GET /health",
      target: `integrations/${integration.ref}`,
      authorizationType: "NONE",
    });
    new apigwv2.CfnRoute(this, "ProtectedRoutes", {
      apiId: api.ref,
      routeKey: "ANY /{proxy+}",
      target: `integrations/${integration.ref}`,
      authorizationType: "JWT",
      authorizerId: authorizer.ref,
    });
    new apigwv2.CfnStage(this, "ApiStage", {
      apiId: api.ref,
      stageName: "$default",
      autoDeploy: true,
      defaultRouteSettings: {
        throttlingBurstLimit: 20,
        throttlingRateLimit: 10,
      },
    });
    apiFunction.addPermission("AllowApiGateway", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      sourceArn: Fn.join("", [
        "arn:",
        Aws.PARTITION,
        ":execute-api:",
        Aws.REGION,
        ":",
        Aws.ACCOUNT_ID,
        ":",
        api.ref,
        "/*/*/*",
      ]),
    });

    for (const metricName of [
      "InfectedUploads",
      "ScanFailures",
      "CompassParseFailure",
    ]) {
      new cloudwatch.Alarm(this, `${metricName}Alarm`, {
        metric: new cloudwatch.Metric({
          namespace: "INSIPS/Passport",
          metricName,
          period: Duration.minutes(5),
          statistic: "sum",
        }),
        threshold: 1,
        evaluationPeriods: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
    }

    new cloudwatch.Alarm(this, "EvidenceWorkflowFailuresAlarm", {
      metric: evidenceWorkflow.metricFailed({ period: Duration.minutes(5) }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    new cloudwatch.Alarm(this, "ApiFunctionErrorsAlarm", {
      metric: apiFunction.metricErrors({ period: Duration.minutes(5) }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    const budgetCondition = new CfnCondition(this, "BudgetConfigured", {
      expression: Fn.conditionAnd(
        Fn.conditionNot(Fn.conditionEquals(budgetAmount.valueAsNumber, 0)),
        Fn.conditionNot(Fn.conditionEquals(budgetEmail.valueAsString, "")),
      ),
    });
    const budget = new budgets.CfnBudget(this, "HackathonBudget", {
      budget: {
        budgetName: `insips-passport-${props.environment}`,
        budgetType: "COST",
        timeUnit: "MONTHLY",
        budgetLimit: { amount: budgetAmount.valueAsNumber, unit: "USD" },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            comparisonOperator: "GREATER_THAN",
            notificationType: "ACTUAL",
            threshold: 80,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [
            { address: budgetEmail.valueAsString, subscriptionType: "EMAIL" },
          ],
        },
      ],
    });
    budget.cfnOptions.condition = budgetCondition;

    new CfnOutput(this, "ApiUrl", { value: api.attrApiEndpoint });
    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, "EvidenceBucketName", {
      value: evidenceBucket.bucketName,
    });
    new CfnOutput(this, "EvidenceWorkflowArn", {
      value: evidenceWorkflow.stateMachineArn,
    });
  }
}
