"use client";

import {
  applyPaymentEvent,
  calculateDonationBreakdown,
  canTransitionItemDonation,
  canTransitionVolunteer,
  decideVerificationDocument,
  onboardingCompletion,
  type Donation,
  type ItemDonationStatus,
  type OnboardingStep,
  type OrganizationLifecycle,
  type PaymentEvent,
  type VerificationDocumentStatus,
  type VolunteerStatus,
} from "@insips/contracts";
import {
  demoCauses,
  initialDonations,
  initialItemNeeds,
  initialItemPledges,
  initialVerificationDocuments,
  type ItemPledge,
  type VolunteerApplication,
} from "@/lib/platform-demo-data";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ReviewHistoryEntry = {
  id: string;
  documentId?: string;
  action: string;
  reason?: string;
  actor: string;
  at: string;
};

type DemoNotification = {
  id: string;
  title: string;
  detail: string;
  read: boolean;
};

type ProductDemoState = {
  onboarding: {
    organizationId: string;
    completedSteps: OnboardingStep[];
    currentStep: OnboardingStep;
    status: "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED";
    updatedAt: string;
    rejectedFields: Record<string, string>;
    values: Record<string, string>;
  };
  organizationStatus: OrganizationLifecycle;
  verificationDocuments: typeof initialVerificationDocuments;
  reviewHistory: ReviewHistoryEntry[];
  donations: Donation[];
  causes: typeof demoCauses;
  processedPaymentEvents: string[];
  causeProgress: Record<string, number>;
  itemNeeds: typeof initialItemNeeds;
  itemPledges: ItemPledge[];
  volunteerApplications: VolunteerApplication[];
  followingOrganizations: string[];
  followedCauses: string[];
  bookmarkedCauses: string[];
  corporateShortlist: string[];
  eventRegistrations: string[];
  teamInvites: { email: string; role: string; status: string }[];
  notifications: DemoNotification[];
  accountArchived: boolean;
};

type ProductDemoContextValue = ProductDemoState & {
  onboardingPercent: number;
  saveOnboardingStep: (
    step: OnboardingStep,
    values: Record<string, string>,
    nextStep?: OnboardingStep,
  ) => void;
  submitOnboarding: () => void;
  correctDocument: (id: string) => void;
  decideDocument: (
    id: string,
    decision: Exclude<VerificationDocumentStatus, "PENDING" | "EXPIRED">,
    reason?: string,
  ) => void;
  decideOrganization: (
    decision: "APPROVED" | "REJECTED" | "SUSPENDED" | "IN_REVIEW",
    reason?: string,
  ) => void;
  createDonation: (input: {
    causeId: string;
    organizationId: string;
    amountPaise: number;
    donorCoversPlatformFee: boolean;
    anonymous: boolean;
    message?: string;
  }) => string;
  applyDonationEvent: (donationId: string, event: PaymentEvent) => void;
  pledgeItem: (input: {
    needId: string;
    quantity: number;
    condition: string;
    notes: string;
    preference: "PICKUP" | "DROPOFF";
  }) => string;
  createItemNeed: (input: {
    title: string;
    category: string;
    requestedQuantity: number;
    acceptedCondition: string;
    deadline: string;
    fulfilment: string;
  }) => void;
  transitionItemPledge: (id: string, status: ItemDonationStatus) => void;
  applyVolunteer: (opportunityId: string, title: string) => void;
  transitionVolunteer: (id: string, status: VolunteerStatus) => void;
  toggleFollowOrganization: (id: string) => void;
  toggleFollowCause: (id: string) => void;
  toggleBookmarkCause: (id: string) => void;
  toggleCorporateShortlist: (id: string) => void;
  registerForEvent: (id: string) => void;
  inviteTeamMember: (email: string, role: string) => void;
  markNotificationsRead: () => void;
  archiveAccount: () => void;
  restoreAccount: () => void;
  resetProductDemo: () => void;
};

const initialState: ProductDemoState = {
  onboarding: {
    organizationId: "org-udaan-learning",
    completedSteps: ["ACCOUNT", "ORGANIZATION", "LOCATION"],
    currentStep: "MEDIA",
    status: "CHANGES_REQUESTED",
    updatedAt: "2026-09-19T13:30:00.000Z",
    rejectedFields: {
      taxDocument:
        "Upload the complete 80G certificate including the signature page.",
    },
    values: {
      contactName: "Nisha Rao",
      contactEmail: "nisha@udaan.example",
      organizationName: "Udaan Learning Foundation",
      slug: "udaan-learning-foundation",
      organizationType: "Section 8 company",
      mission: "Make foundational learning dependable and locally led.",
      address: "18 Learning Lane, Pune, Maharashtra",
      serviceRegions: "Pune, Satara",
      causes: "Education, Youth, Community learning",
    },
  },
  organizationStatus: "CHANGES_REQUESTED",
  verificationDocuments: initialVerificationDocuments,
  reviewHistory: [
    {
      id: "history-1",
      documentId: "verify-registration",
      action: "Document approved",
      actor: "Mira Shah · Platform admin",
      at: "12 Sep 2026, 15:00",
    },
    {
      id: "history-2",
      documentId: "verify-80g",
      action: "Changes requested",
      reason: "Signature page is missing.",
      actor: "Mira Shah · Platform admin",
      at: "18 Sep 2026, 16:40",
    },
  ],
  donations: initialDonations,
  causes: demoCauses,
  processedPaymentEvents: ["fixture-captured-1042"],
  causeProgress: {
    "cause-learning-kits": 684_500,
    "cause-water-testing": 291_000,
    "cause-mobile-health": 430_000,
  },
  itemNeeds: initialItemNeeds,
  itemPledges: initialItemPledges,
  volunteerApplications: [],
  followingOrganizations: ["org-udaan-learning"],
  followedCauses: ["cause-learning-kits"],
  bookmarkedCauses: ["cause-water-testing"],
  corporateShortlist: ["cause-learning-kits"],
  eventRegistrations: [],
  teamInvites: [
    {
      email: "programme.lead@udaan.example",
      role: "Organization member",
      status: "Accepted",
    },
  ],
  notifications: [
    {
      id: "notice-1",
      title: "Changes requested for 80G evidence",
      detail: "Upload the missing signature page before resubmitting.",
      read: false,
    },
    {
      id: "notice-2",
      title: "Donation transfer processed",
      detail: "The synthetic transfer for donation #1042 is complete.",
      read: false,
    },
    {
      id: "notice-3",
      title: "New blanket pledge",
      detail: "A donor pledged six new blankets for pickup.",
      read: true,
    },
  ],
  accountArchived: false,
};

const ProductDemoContext = createContext<ProductDemoContextValue | null>(null);
const storageKey = "insips-product-demo-v1";

function mergeStoredState(stored: Partial<ProductDemoState>): ProductDemoState {
  return {
    ...initialState,
    ...stored,
    onboarding: { ...initialState.onboarding, ...stored.onboarding },
    causeProgress: { ...initialState.causeProgress, ...stored.causeProgress },
  };
}

export function ProductDemoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ProductDemoState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        setState(
          mergeStoredState(JSON.parse(raw) as Partial<ProductDemoState>),
        );
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const value = useMemo<ProductDemoContextValue>(
    () => ({
      ...state,
      onboardingPercent: onboardingCompletion(state.onboarding),
      saveOnboardingStep: (step, values, nextStep = step) =>
        setState((current) => ({
          ...current,
          onboarding: {
            ...current.onboarding,
            values: { ...current.onboarding.values, ...values },
            completedSteps: Array.from(
              new Set([...current.onboarding.completedSteps, step]),
            ),
            currentStep: nextStep,
            status: "DRAFT",
            updatedAt: new Date().toISOString(),
          },
        })),
      submitOnboarding: () =>
        setState((current) => ({
          ...current,
          onboarding: {
            ...current.onboarding,
            completedSteps: Array.from(
              new Set([...current.onboarding.completedSteps, "SUBMIT"]),
            ),
            currentStep: "SUBMIT",
            status: "SUBMITTED",
            rejectedFields: {},
            updatedAt: new Date().toISOString(),
          },
          organizationStatus: "IN_REVIEW",
          notifications: [
            {
              id: `notice-${Date.now()}`,
              title: "Organization profile submitted",
              detail: "Platform review can now begin.",
              read: false,
            },
            ...current.notifications,
          ],
        })),
      correctDocument: (id) =>
        setState((current) => ({
          ...current,
          verificationDocuments: current.verificationDocuments.map(
            (document) =>
              document.id === id
                ? {
                    ...document,
                    status: "PENDING" as const,
                    latestReason: undefined,
                    reviewedBy: undefined,
                    reviewedAt: undefined,
                  }
                : document,
          ),
          onboarding: {
            ...current.onboarding,
            rejectedFields: {},
            status: "SUBMITTED",
            updatedAt: new Date().toISOString(),
          },
        })),
      decideDocument: (id, decision, reason) =>
        setState((current) => {
          const nextDocuments = current.verificationDocuments.map((document) =>
            document.id === id
              ? decideVerificationDocument(
                  document,
                  decision,
                  "admin-mira",
                  reason,
                )
              : document,
          );
          return {
            ...current,
            verificationDocuments: nextDocuments,
            reviewHistory: [
              {
                id: `history-${Date.now()}`,
                documentId: id,
                action: decision.replaceAll("_", " ").toLowerCase(),
                reason,
                actor: "Mira Shah · Platform admin",
                at: new Date().toLocaleString("en-IN"),
              },
              ...current.reviewHistory,
            ],
          };
        }),
      decideOrganization: (decision, reason) =>
        setState((current) => ({
          ...current,
          organizationStatus: decision,
          reviewHistory: [
            {
              id: `history-${Date.now()}`,
              action: `Organization ${decision.toLowerCase().replaceAll("_", " ")}`,
              reason,
              actor: "Mira Shah · Platform admin",
              at: new Date().toLocaleString("en-IN"),
            },
            ...current.reviewHistory,
          ],
        })),
      createDonation: (input) => {
        const id = `donation-local-${Date.now()}`;
        const breakdown = calculateDonationBreakdown({
          amountPaise: input.amountPaise,
          donorCoversPlatformFee: input.donorCoversPlatformFee,
        });
        const donation: Donation = {
          id,
          donorId: "donor-demo",
          organizationId: input.organizationId,
          causeId: input.causeId,
          amountPaise: input.amountPaise,
          feeRateBps: breakdown.feeRateBps,
          donorCoversPlatformFee: input.donorCoversPlatformFee,
          platformFeePaise: breakdown.platformFeePaise,
          razorpayFeePaise: 0,
          netOrganizationPaise: breakdown.netOrganizationPaise,
          status: "PENDING",
          transferStatus: "NOT_CONFIGURED",
          refundedPaise: 0,
          anonymous: input.anonymous,
          publicName: input.anonymous ? undefined : "Aarav Mehta",
          message: input.message,
          razorpayReference: `pay_test_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setState((current) => ({
          ...current,
          donations: [donation, ...current.donations],
        }));
        return id;
      },
      applyDonationEvent: (donationId, event) =>
        setState((current) => {
          const donation = current.donations.find(
            (item) => item.id === donationId,
          );
          if (!donation || current.processedPaymentEvents.includes(event.id)) {
            return current;
          }
          const ledger = applyPaymentEvent(
            {
              donation,
              processedEventIds: current.processedPaymentEvents,
              causeProgressPaise: current.causeProgress[donation.causeId] ?? 0,
            },
            event,
          );
          return {
            ...current,
            donations: current.donations.map((item) =>
              item.id === donationId ? ledger.donation : item,
            ),
            processedPaymentEvents: ledger.processedEventIds,
            causeProgress: {
              ...current.causeProgress,
              [donation.causeId]: ledger.causeProgressPaise,
            },
          };
        }),
      pledgeItem: (input) => {
        const id = `pledge-local-${Date.now()}`;
        setState((current) => ({
          ...current,
          itemPledges: [
            {
              id,
              donorId: "donor-demo",
              status: "PLEDGED",
              timeline: [
                {
                  label: "Pledge submitted",
                  at: new Date().toLocaleString("en-IN"),
                },
              ],
              ...input,
            },
            ...current.itemPledges,
          ],
        }));
        return id;
      },
      createItemNeed: (input) =>
        setState((current) => ({
          ...current,
          itemNeeds: [
            {
              id: `need-local-${Date.now()}`,
              organizationId: "org-udaan-learning",
              receivedQuantity: 0,
              ...input,
            },
            ...current.itemNeeds,
          ],
        })),
      transitionItemPledge: (id, status) =>
        setState((current) => {
          const pledge = current.itemPledges.find((item) => item.id === id);
          if (!pledge || !canTransitionItemDonation(pledge.status, status)) {
            return current;
          }
          return {
            ...current,
            itemPledges: current.itemPledges.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status,
                    timeline: [
                      ...item.timeline,
                      {
                        label: status.replaceAll("_", " ").toLowerCase(),
                        at: new Date().toLocaleString("en-IN"),
                      },
                    ],
                  }
                : item,
            ),
            itemNeeds:
              status === "RECEIVED"
                ? current.itemNeeds.map((need) =>
                    need.id === pledge.needId
                      ? {
                          ...need,
                          receivedQuantity: Math.min(
                            need.requestedQuantity,
                            need.receivedQuantity + pledge.quantity,
                          ),
                        }
                      : need,
                  )
                : current.itemNeeds,
          };
        }),
      applyVolunteer: (opportunityId, title) =>
        setState((current) => {
          if (
            current.volunteerApplications.some(
              (application) => application.opportunityId === opportunityId,
            )
          ) {
            return current;
          }
          return {
            ...current,
            volunteerApplications: [
              {
                id: `volunteer-local-${Date.now()}`,
                opportunityId,
                title,
                applicantId: "donor-demo",
                status: "APPLIED",
              },
              ...current.volunteerApplications,
            ],
          };
        }),
      transitionVolunteer: (id, status) =>
        setState((current) => ({
          ...current,
          volunteerApplications: current.volunteerApplications.map(
            (application) =>
              application.id === id &&
              canTransitionVolunteer(application.status, status)
                ? { ...application, status }
                : application,
          ),
        })),
      toggleFollowOrganization: (id) =>
        setState((current) => ({
          ...current,
          followingOrganizations: current.followingOrganizations.includes(id)
            ? current.followingOrganizations.filter((item) => item !== id)
            : [...current.followingOrganizations, id],
        })),
      toggleFollowCause: (id) =>
        setState((current) => ({
          ...current,
          followedCauses: current.followedCauses.includes(id)
            ? current.followedCauses.filter((item) => item !== id)
            : [...current.followedCauses, id],
        })),
      toggleBookmarkCause: (id) =>
        setState((current) => ({
          ...current,
          bookmarkedCauses: current.bookmarkedCauses.includes(id)
            ? current.bookmarkedCauses.filter((item) => item !== id)
            : [...current.bookmarkedCauses, id],
        })),
      toggleCorporateShortlist: (id) =>
        setState((current) => ({
          ...current,
          corporateShortlist: current.corporateShortlist.includes(id)
            ? current.corporateShortlist.filter((item) => item !== id)
            : [...current.corporateShortlist, id],
        })),
      registerForEvent: (id) =>
        setState((current) => ({
          ...current,
          eventRegistrations: current.eventRegistrations.includes(id)
            ? current.eventRegistrations
            : [...current.eventRegistrations, id],
        })),
      inviteTeamMember: (email, role) =>
        setState((current) => ({
          ...current,
          teamInvites: [
            { email, role, status: "Invited" },
            ...current.teamInvites,
          ],
        })),
      markNotificationsRead: () =>
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),
      archiveAccount: () =>
        setState((current) => ({ ...current, accountArchived: true })),
      restoreAccount: () =>
        setState((current) => ({ ...current, accountArchived: false })),
      resetProductDemo: () => setState(initialState),
    }),
    [state],
  );

  return (
    <ProductDemoContext.Provider value={value}>
      {children}
    </ProductDemoContext.Provider>
  );
}

export function useProductDemo() {
  const context = useContext(ProductDemoContext);
  if (!context) {
    throw new Error("useProductDemo must be used inside ProductDemoProvider");
  }
  return context;
}
