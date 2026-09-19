"use client";

import { candidateClaims } from "@/lib/demo-data";
import type { CandidateClaim } from "@insips/contracts";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SuggestionDecision = "pending" | "accepted" | "dismissed";
type ReviewDecision = "pending" | "approved" | "rejected" | "changes_requested";

type DemoState = {
  profileSaved: boolean;
  suggestions: Record<string, SuggestionDecision>;
  submissionStatus: "draft" | "submitted" | "in_review" | "reviewed";
  review: Record<string, ReviewDecision>;
  shortlist: string[];
};

type DemoContextValue = DemoState & {
  claims: CandidateClaim[];
  saveProfile: () => void;
  decideSuggestion: (id: string, decision: SuggestionDecision) => void;
  submitClaims: () => void;
  decideReview: (
    id: string,
    decision: Exclude<ReviewDecision, "pending">,
  ) => void;
  toggleShortlist: (slug: string) => void;
  resetDemo: () => void;
};

const initialState: DemoState = {
  profileSaved: true,
  suggestions: Object.fromEntries(
    candidateClaims.map((claim) => [claim.id, "pending"]),
  ),
  submissionStatus: "draft",
  review: Object.fromEntries(
    candidateClaims.map((claim) => [claim.id, "pending"]),
  ),
  shortlist: ["udaan-learning-foundation"],
};

const DemoContext = createContext<DemoContextValue | null>(null);
const storageKey = "insips-demo-v1";

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        setState({
          ...initialState,
          ...(JSON.parse(stored) as Partial<DemoState>),
        });
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [hydrated, state]);

  const value = useMemo<DemoContextValue>(
    () => ({
      ...state,
      claims: candidateClaims,
      saveProfile: () =>
        setState((current) => ({ ...current, profileSaved: true })),
      decideSuggestion: (id, decision) =>
        setState((current) => ({
          ...current,
          suggestions: { ...current.suggestions, [id]: decision },
        })),
      submitClaims: () =>
        setState((current) => ({ ...current, submissionStatus: "submitted" })),
      decideReview: (id, decision) =>
        setState((current) => {
          const review = { ...current.review, [id]: decision };
          const submittedClaimIds = Object.entries(current.suggestions)
            .filter(
              ([, suggestionDecision]) => suggestionDecision === "accepted",
            )
            .map(([claimId]) => claimId);
          const resolved =
            submittedClaimIds.length > 0 &&
            submittedClaimIds.every((claimId) => review[claimId] !== "pending");
          return {
            ...current,
            review,
            submissionStatus: resolved ? "reviewed" : "in_review",
          };
        }),
      toggleShortlist: (slug) =>
        setState((current) => ({
          ...current,
          shortlist: current.shortlist.includes(slug)
            ? current.shortlist.filter((item) => item !== slug)
            : [...current.shortlist, slug],
        })),
      resetDemo: () => setState(initialState),
    }),
    [state],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
