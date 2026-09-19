#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { InsipsStack } from "../lib/insips-stack.js";

const app = new cdk.App();
const environment = app.node.tryGetContext("environment") ?? "dev";

new InsipsStack(app, `Insips-${environment}`, {
  environment,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
