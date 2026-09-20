import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Arn,
  ArnFormat,
  Aws,
  CfnCondition,
  CfnOutput,
  CfnParameter,
  CustomResource,
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
import * as customResources from "aws-cdk-lib/custom-resources";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as guardduty from "aws-cdk-lib/aws-guardduty";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export type InsipsStackProps = StackProps & { environment: string };

export class InsipsStack extends Stack {
  constructor(scope: Construct, id: string, props: InsipsStackProps) {
    super(scope, id, props);

    Tags.of(this).add("project", "insips");
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

    const googleClientId = new CfnParameter(this, "GoogleClientId", {
      type: "String",
      default: "",
      description: "Optional Google OAuth client ID for Cognito federation.",
    });
    const googleClientSecret = new CfnParameter(this, "GoogleClientSecret", {
      type: "String",
      default: "",
      noEcho: true,
      description: "Optional Google OAuth client secret.",
    });
    const facebookClientId = new CfnParameter(this, "FacebookClientId", {
      type: "String",
      default: "",
      description: "Optional Facebook app ID for Cognito federation.",
    });
    const facebookClientSecret = new CfnParameter(
      this,
      "FacebookClientSecret",
      {
        type: "String",
        default: "",
        noEcho: true,
        description: "Optional Facebook app secret.",
      },
    );
    const appleServicesId = new CfnParameter(this, "AppleServicesId", {
      type: "String",
      default: "",
      description: "Optional Apple Services ID for Cognito federation.",
    });
    const appleTeamId = new CfnParameter(this, "AppleTeamId", {
      type: "String",
      default: "",
    });
    const appleKeyId = new CfnParameter(this, "AppleKeyId", {
      type: "String",
      default: "",
    });
    const applePrivateKey = new CfnParameter(this, "ApplePrivateKey", {
      type: "String",
      default: "",
      noEcho: true,
    });

    const googleFederationConfigured = new CfnCondition(
      this,
      "GoogleFederationConfigured",
      {
        expression: Fn.conditionAnd(
          Fn.conditionNot(Fn.conditionEquals(googleClientId.valueAsString, "")),
          Fn.conditionNot(
            Fn.conditionEquals(googleClientSecret.valueAsString, ""),
          ),
        ),
      },
    );
    const facebookFederationConfigured = new CfnCondition(
      this,
      "FacebookFederationConfigured",
      {
        expression: Fn.conditionAnd(
          Fn.conditionNot(
            Fn.conditionEquals(facebookClientId.valueAsString, ""),
          ),
          Fn.conditionNot(
            Fn.conditionEquals(facebookClientSecret.valueAsString, ""),
          ),
        ),
      },
    );
    const appleFederationConfigured = new CfnCondition(
      this,
      "AppleFederationConfigured",
      {
        expression: Fn.conditionAnd(
          Fn.conditionNot(
            Fn.conditionEquals(appleServicesId.valueAsString, ""),
          ),
          Fn.conditionNot(Fn.conditionEquals(appleTeamId.valueAsString, "")),
          Fn.conditionNot(Fn.conditionEquals(appleKeyId.valueAsString, "")),
          Fn.conditionNot(
            Fn.conditionEquals(applePrivateKey.valueAsString, ""),
          ),
        ),
      },
    );

    const vpc = new ec2.Vpc(this, "ProductVpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
    const productDatabase = new rds.DatabaseCluster(this, "ProductDatabase", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_4,
      }),
      writer: rds.ClusterInstance.serverlessV2("writer", {
        publiclyAccessible: false,
      }),
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
      defaultDatabaseName: "insips",
      enableDataApi: true,
      storageEncrypted: true,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      deletionProtection: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const razorpaySecret = new secretsmanager.Secret(
      this,
      "RazorpayTestCredentials",
      {
        description:
          "Razorpay test-mode credentials. Replace values out of band; never commit them.",
      },
    );

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
      selfSignUpEnabled: true,
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
    const googleProvider = new cognito.CfnUserPoolIdentityProvider(
      this,
      "GoogleIdentityProvider",
      {
        userPoolId: userPool.userPoolId,
        providerName: "Google",
        providerType: "Google",
        providerDetails: {
          client_id: googleClientId.valueAsString,
          client_secret: googleClientSecret.valueAsString,
          authorize_scopes: "openid email profile",
        },
        attributeMapping: { email: "email", name: "name" },
      },
    );
    googleProvider.cfnOptions.condition = googleFederationConfigured;
    const facebookProvider = new cognito.CfnUserPoolIdentityProvider(
      this,
      "FacebookIdentityProvider",
      {
        userPoolId: userPool.userPoolId,
        providerName: "Facebook",
        providerType: "Facebook",
        providerDetails: {
          client_id: facebookClientId.valueAsString,
          client_secret: facebookClientSecret.valueAsString,
          authorize_scopes: "public_profile,email",
        },
        attributeMapping: { email: "email", name: "name" },
      },
    );
    facebookProvider.cfnOptions.condition = facebookFederationConfigured;
    const appleProvider = new cognito.CfnUserPoolIdentityProvider(
      this,
      "AppleIdentityProvider",
      {
        userPoolId: userPool.userPoolId,
        providerName: "SignInWithApple",
        providerType: "SignInWithApple",
        providerDetails: {
          client_id: appleServicesId.valueAsString,
          team_id: appleTeamId.valueAsString,
          key_id: appleKeyId.valueAsString,
          private_key: applePrivateKey.valueAsString,
          authorize_scopes: "name email",
        },
        attributeMapping: { email: "email", name: "name" },
      },
    );
    appleProvider.cfnOptions.condition = appleFederationConfigured;
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
        callbackUrls: [`${appOrigin.valueAsString}/auth/callback`],
        logoutUrls: [`${appOrigin.valueAsString}/`],
      },
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.minutes(15),
      idTokenValidity: Duration.minutes(15),
      refreshTokenValidity: Duration.days(1),
      enableTokenRevocation: true,
    });
    const cfnUserPoolClient = userPoolClient.node
      .defaultChild as cognito.CfnUserPoolClient;
    cfnUserPoolClient.supportedIdentityProviders = [
      "COGNITO",
      Fn.conditionIf(
        googleFederationConfigured.logicalId,
        "Google",
        Aws.NO_VALUE,
      ).toString(),
      Fn.conditionIf(
        facebookFederationConfigured.logicalId,
        "Facebook",
        Aws.NO_VALUE,
      ).toString(),
      Fn.conditionIf(
        appleFederationConfigured.logicalId,
        "SignInWithApple",
        Aws.NO_VALUE,
      ).toString(),
    ];
    new cognito.CfnUserPoolDomain(this, "UserPoolDomain", {
      userPoolId: userPool.userPoolId,
      domain: Fn.join("-", ["insips", Aws.ACCOUNT_ID, Aws.REGION]),
    });
    for (const groupName of [
      "INDIVIDUAL_DONOR",
      "ORGANIZATION_MEMBER",
      "ORGANIZATION_ADMIN",
      "CORPORATE_MEMBER",
      "CORPORATE_ADMIN",
      "REVIEWER",
      "PLATFORM_ADMIN",
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

    const postConfirmation = new lambdaNode.NodejsFunction(
      this,
      "PostConfirmationFunction",
      {
        ...commonLambdaProps,
        logGroup: new logs.LogGroup(this, "PostConfirmationLogs", {
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        entry: path.join(
          currentDirectory,
          "../src/functions/post-confirmation.ts",
        ),
        handler: "handler",
        environment: {
          DATABASE_CLUSTER_ARN: productDatabase.clusterArn,
          DATABASE_SECRET_ARN: productDatabase.secret?.secretArn ?? "",
          DATABASE_NAME: "insips",
        },
      },
    );
    productDatabase.grantDataApiAccess(postConfirmation);
    postConfirmation.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["cognito-idp:AdminAddUserToGroup"],
        // Do not reference this pool directly here. The pool owns the trigger,
        // so a pool ARN token in the function role would create a CloudFormation
        // dependency cycle. The handler still receives and uses Cognito's
        // server-issued userPoolId, and this policy is bounded to user pools in
        // the current account and region.
        resources: [
          Arn.format(
            {
              service: "cognito-idp",
              resource: "userpool",
              resourceName: "*",
              arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
            },
            this,
          ),
        ],
      }),
    );
    userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      postConfirmation,
    );

    const databaseMigration = new lambdaNode.NodejsFunction(
      this,
      "DatabaseMigrationFunction",
      {
        ...commonLambdaProps,
        logGroup: new logs.LogGroup(this, "DatabaseMigrationLogs", {
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        entry: path.join(
          currentDirectory,
          "../src/functions/database-migrate.ts",
        ),
        handler: "handler",
        environment: {
          DATABASE_CLUSTER_ARN: productDatabase.clusterArn,
          DATABASE_SECRET_ARN: productDatabase.secret?.secretArn ?? "",
          DATABASE_NAME: "insips",
        },
        bundling: {
          ...commonLambdaProps.bundling,
          commandHooks: {
            beforeBundling: () => [],
            beforeInstall: () => [],
            afterBundling: (inputDirectory, outputDirectory) => [
              ...["001_product_core", "002_content_foundation", "003_content_seed", "004_site_content_seed"].map(
                (migration) =>
                  `cp ${path.join(inputDirectory, `infra/sql/${migration}.sql`)} ${path.join(outputDirectory, `${migration}.sql`)}`,
              ),
            ],
          },
        },
      },
    );
    productDatabase.grantDataApiAccess(databaseMigration);
    const migrationProvider = new customResources.Provider(
      this,
      "DatabaseMigrationProvider",
      { onEventHandler: databaseMigration },
    );
    new CustomResource(this, "ProductDatabaseSchema", {
      serviceToken: migrationProvider.serviceToken,
      properties: { migration: "001_product_core,002_content_foundation,003_content_seed,004_site_content_seed" },
    });

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
          { key: "project", value: "insips" },
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
        DATABASE_CLUSTER_ARN: productDatabase.clusterArn,
        DATABASE_SECRET_ARN: productDatabase.secret?.secretArn ?? "",
        DATABASE_NAME: "insips",
        RAZORPAY_SECRET_ARN: razorpaySecret.secretArn,
      },
    });
    appTable.grantReadWriteData(apiFunction);
    publicTable.grantReadWriteData(apiFunction);
    evidenceBucket.grantReadWrite(apiFunction, "quarantine/*");
    evidenceBucket.grantRead(apiFunction, "verification/*");
    productDatabase.grantDataApiAccess(apiFunction);
    razorpaySecret.grantRead(apiFunction);

    const razorpayWebhookFunction = new lambdaNode.NodejsFunction(
      this,
      "RazorpayWebhookFunction",
      {
        ...commonLambdaProps,
        logGroup: new logs.LogGroup(this, "RazorpayWebhookLogs", {
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        entry: path.join(
          currentDirectory,
          "../src/functions/razorpay-webhook.ts",
        ),
        handler: "handler",
        environment: {
          DATABASE_CLUSTER_ARN: productDatabase.clusterArn,
          DATABASE_SECRET_ARN: productDatabase.secret?.secretArn ?? "",
          DATABASE_NAME: "insips",
          RAZORPAY_SECRET_ARN: razorpaySecret.secretArn,
        },
      },
    );
    productDatabase.grantDataApiAccess(razorpayWebhookFunction);
    razorpaySecret.grantRead(razorpayWebhookFunction);

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
    const webhookIntegration = new apigwv2.CfnIntegration(
      this,
      "RazorpayWebhookIntegration",
      {
        apiId: api.ref,
        integrationType: "AWS_PROXY",
        integrationUri: razorpayWebhookFunction.functionArn,
        integrationMethod: "POST",
        payloadFormatVersion: "2.0",
        timeoutInMillis: 28_000,
      },
    );
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
    new apigwv2.CfnRoute(this, "RazorpayWebhookRoute", {
      apiId: api.ref,
      routeKey: "POST /webhooks/razorpay",
      target: `integrations/${webhookIntegration.ref}`,
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
    razorpayWebhookFunction.addPermission("AllowApiGatewayWebhook", {
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
        "/*/POST/webhooks/razorpay",
      ]),
    });

    for (const metricName of [
      "InfectedUploads",
      "ScanFailures",
      "CompassParseFailure",
    ]) {
      new cloudwatch.Alarm(this, `${metricName}Alarm`, {
        metric: new cloudwatch.Metric({
          namespace: "INSIPS",
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
        budgetName: `insips-${props.environment}`,
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
    new CfnOutput(this, "ProductDatabaseClusterArn", {
      value: productDatabase.clusterArn,
    });
    new CfnOutput(this, "RazorpayTestSecretArn", {
      value: razorpaySecret.secretArn,
    });
  }
}
