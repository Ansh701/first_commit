import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { InsipsStack } from "../lib/insips-stack.js";

function template() {
  const app = new App();
  const stack = new InsipsStack(app, "TestStack", {
    environment: "test",
    env: { account: "111122223333", region: "ap-south-1" },
  });
  return Template.fromStack(stack);
}

describe("INSIPS infrastructure controls", () => {
  it("keeps the evidence bucket private, encrypted, versioned, and TLS-only", () => {
    const result = template();
    result.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: Match.anyValue(),
      VersioningConfiguration: { Status: "Enabled" },
    });
    result.hasResourceProperties(
      "AWS::S3::BucketPolicy",
      Match.objectLike({
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({ Effect: "Deny", Action: "s3:*" }),
          ]),
        }),
      }),
    );
  });

  it("uses on-demand encrypted DynamoDB with recovery enabled", () => {
    const result = template();
    result.resourceCountIs("AWS::DynamoDB::Table", 2);
    result.hasResourceProperties("AWS::DynamoDB::Table", {
      BillingMode: "PAY_PER_REQUEST",
      PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      SSESpecification: { SSEEnabled: true },
    });
  });

  it("uses Cognito without public self-registration", () => {
    template().hasResourceProperties("AWS::Cognito::UserPool", {
      AdminCreateUserConfig: { AllowAdminCreateUserOnly: true },
      MfaConfiguration: "OPTIONAL",
    });
  });

  it("keeps all Lambda functions on Node.js 22 with tracing", () => {
    const result = template();
    result.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs22.x",
      TracingConfig: { Mode: "Active" },
    });
  });

  it("creates the guarded evidence workflow and conditional malware plan", () => {
    const result = template();
    result.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
    result.resourceCountIs("AWS::GuardDuty::MalwareProtectionPlan", 1);
    result.hasResourceProperties("AWS::Events::Rule", {
      EventPattern: {
        source: ["aws.guardduty"],
        "detail-type": ["GuardDuty Malware Protection Object Scan Result"],
      },
    });
    expect(result.toJSON().Resources).toBeTruthy();
  });
});
