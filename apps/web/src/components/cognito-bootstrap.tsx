"use client";

import { Amplify } from "aws-amplify";
import { useEffect } from "react";

export function CognitoBootstrap() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_INSIPS_AUTH_MODE !== "cognito") return;
    const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    const userPoolClientId =
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!userPoolId || !userPoolClientId || !domain || !siteUrl) {
      throw new Error("Cognito public configuration is incomplete.");
    }
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginWith: {
            oauth: {
              domain,
              scopes: ["openid", "email", "profile"],
              redirectSignIn: [`${siteUrl}/auth/callback`],
              redirectSignOut: [siteUrl],
              responseType: "code",
            },
          },
        },
      },
    });
  }, []);
  return null;
}
