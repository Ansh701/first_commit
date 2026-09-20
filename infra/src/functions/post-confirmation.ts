import type { PostConfirmationTriggerHandler } from "aws-lambda";
import {
  AdminAddUserToGroupCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  ExecuteStatementCommand,
  RDSDataClient,
} from "@aws-sdk/client-rds-data";

const cognito = new CognitoIdentityProviderClient({});
const rds = new RDSDataClient({});
const resourceArn = process.env.DATABASE_CLUSTER_ARN ?? "";
const secretArn = process.env.DATABASE_SECRET_ARN ?? "";
const database = process.env.DATABASE_NAME ?? "insips";

export const handler: PostConfirmationTriggerHandler = async (event) => {
  if (!resourceArn || !secretArn)
    throw new Error("DATABASE_ENVIRONMENT_MISSING");
  const subject = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;
  const displayName = event.request.userAttributes.name || "INSIPS member";
  if (!subject || !email) throw new Error("CONFIRMED_USER_ATTRIBUTES_MISSING");

  await cognito.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: "INDIVIDUAL_DONOR",
    }),
  );
  await rds.send(
    new ExecuteStatementCommand({
      resourceArn,
      secretArn,
      database,
      sql: `INSERT INTO app_users (cognito_sub, email, display_name)
            VALUES (:subject, :email, :display_name)
            ON CONFLICT (cognito_sub)
            DO UPDATE SET email = EXCLUDED.email,
                          display_name = EXCLUDED.display_name,
                          updated_at = now()`,
      parameters: [
        { name: "subject", value: { stringValue: subject } },
        { name: "email", value: { stringValue: email } },
        { name: "display_name", value: { stringValue: displayName } },
      ],
    }),
  );
  return event;
};
