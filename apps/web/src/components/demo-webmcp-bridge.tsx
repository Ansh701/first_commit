"use client";

import { useEffect } from "react";
import { useDemo } from "./demo-provider";

type ToolDefinition = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: unknown) => unknown | Promise<unknown>;
};

declare global {
  interface Document {
    readonly modelContext?: {
      registerTool(
        tool: ToolDefinition,
        options?: { signal?: AbortSignal },
      ): void | Promise<void>;
    };
  }
}

function objectInput(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Input must be an object.");
  return input as Record<string, unknown>;
}

export function DemoWebMcpBridge() {
  const {
    claims,
    suggestions,
    submissionStatus,
    review,
    decideSuggestion,
    submitClaims,
    decideReview,
  } = useDemo();

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const claimIds = new Set(claims.map((claim) => claim.id));

    const register = (tool: ToolDefinition) => {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {
        // The visible product remains fully usable if a browser does not accept a tool.
      });
    };

    register({
      name: "read_passport_demo_status",
      title: "Read Passport demo status",
      description:
        "Read the current synthetic candidate, submission, and review state without changing it.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        return { suggestions, submissionStatus, review };
      },
    });

    register({
      name: "confirm_candidate_claim",
      title: "Confirm candidate claim",
      description:
        "Accept or dismiss one visible synthetic Compass candidate using the same state as the organization evidence screen.",
      inputSchema: {
        type: "object",
        properties: {
          claimId: { type: "string" },
          decision: { type: "string", enum: ["accepted", "dismissed"] },
        },
        required: ["claimId", "decision"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const value = objectInput(input);
        if (typeof value.claimId !== "string" || !claimIds.has(value.claimId))
          throw new Error("Unknown claim ID.");
        if (value.decision !== "accepted" && value.decision !== "dismissed")
          throw new Error("Decision must be accepted or dismissed.");
        decideSuggestion(value.claimId, value.decision);
        return { claimId: value.claimId, decision: value.decision };
      },
    });

    register({
      name: "submit_confirmed_claims",
      title: "Submit confirmed claims",
      description:
        "Submit the currently accepted synthetic claims to the visible reviewer queue.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        const accepted = Object.values(suggestions).filter(
          (decision) => decision === "accepted",
        ).length;
        if (accepted === 0)
          throw new Error(
            "At least one candidate must be accepted before submission.",
          );
        submitClaims();
        return { status: "submitted", claimCount: accepted };
      },
    });

    register({
      name: "record_review_decision",
      title: "Record review decision",
      description:
        "Approve, reject, or request changes for one submitted synthetic claim using the same state as the reviewer screen.",
      inputSchema: {
        type: "object",
        properties: {
          claimId: { type: "string" },
          decision: {
            type: "string",
            enum: ["approved", "rejected", "changes_requested"],
          },
        },
        required: ["claimId", "decision"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (submissionStatus === "draft")
          throw new Error("Claims must be submitted before review.");
        const value = objectInput(input);
        if (typeof value.claimId !== "string" || !claimIds.has(value.claimId))
          throw new Error("Unknown claim ID.");
        if (
          value.decision !== "approved" &&
          value.decision !== "rejected" &&
          value.decision !== "changes_requested"
        )
          throw new Error("Unsupported review decision.");
        decideReview(value.claimId, value.decision);
        return { claimId: value.claimId, decision: value.decision };
      },
    });

    return () => lifecycle.abort();
  }, [
    claims,
    decideReview,
    decideSuggestion,
    review,
    submissionStatus,
    submitClaims,
    suggestions,
  ]);

  return null;
}
