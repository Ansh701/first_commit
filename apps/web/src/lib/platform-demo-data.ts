import type {
  Donation,
  ItemDonationStatus,
  VerificationDocument,
  VolunteerStatus,
} from "@insips/contracts";

export const demoCauses = [
  {
    id: "cause-learning-kits",
    organizationId: "org-udaan-learning",
    organization: "Udaan Learning Foundation",
    slug: "learning-kits-2026",
    title: "Learning kits for 240 first-generation students",
    summary:
      "Fund books, learning materials, and guided practice sessions across four synthetic community learning centres.",
    category: "Education",
    targetPaise: 1_200_000,
    raisedPaise: 684_500,
    supporterCount: 38,
    updateCount: 4,
    endDate: "2026-12-15",
  },
  {
    id: "cause-water-testing",
    organizationId: "org-jal-saathi",
    organization: "Jal Saathi Collective",
    slug: "village-water-testing",
    title: "Village water-quality testing and local training",
    summary:
      "Equip volunteer teams with field test kits and practical training for safe-water monitoring.",
    category: "Water",
    targetPaise: 850_000,
    raisedPaise: 291_000,
    supporterCount: 21,
    updateCount: 2,
    endDate: "2027-01-31",
  },
  {
    id: "cause-mobile-health",
    organizationId: "org-sahaara-health",
    organization: "Sahaara Health Network",
    slug: "preventive-health-camps",
    title: "Preventive health camps for peri-urban communities",
    summary:
      "Support screening, referral coordination, and community health education through a mobile clinic programme.",
    category: "Healthcare",
    targetPaise: 2_000_000,
    raisedPaise: 430_000,
    supporterCount: 29,
    updateCount: 3,
    endDate: "2027-03-20",
  },
] as const;

export type CorporateMatchingCampaign = {
  id: string;
  name: string;
  matchRatio: string;
  budgetPaise: number;
  pledgedPaise: number;
  capturedPaise: number;
  startDate: string;
  endDate: string;
  eligibleCauseIds: string[];
  status: "DRAFT" | "PLEDGED" | "CAPTURED";
  history: string[];
};

export const corporateMatchingCampaigns: CorporateMatchingCampaign[] = [
  {
    id: "matching-learning-kits-2026",
    name: "Learning kits 2026",
    matchRatio: "1:1",
    budgetPaise: 20_000_000,
    pledgedPaise: 7_450_000,
    capturedPaise: 0,
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    eligibleCauseIds: ["cause-learning-kits"],
    status: "PLEDGED",
    history: ["Campaign created from the corporate workspace fixture."],
  },
];

export const initialDonations: Donation[] = [
  {
    id: "donation-demo-1042",
    donorId: "donor-demo",
    organizationId: "org-udaan-learning",
    causeId: "cause-learning-kits",
    amountPaise: 50_000,
    feeRateBps: 25,
    donorCoversPlatformFee: true,
    platformFeePaise: 125,
    razorpayFeePaise: 1_002,
    netOrganizationPaise: 48_998,
    status: "CAPTURED",
    transferStatus: "PROCESSED",
    refundedPaise: 0,
    anonymous: false,
    publicName: "Aarav Mehta",
    message: "For the next learning-kit distribution.",
    razorpayReference: "pay_demo_1042",
    createdAt: "2026-09-16T08:15:00.000Z",
  },
  {
    id: "donation-demo-1038",
    donorId: "donor-demo",
    organizationId: "org-jal-saathi",
    causeId: "cause-water-testing",
    amountPaise: 25_000,
    feeRateBps: 25,
    donorCoversPlatformFee: false,
    platformFeePaise: 63,
    razorpayFeePaise: 500,
    netOrganizationPaise: 24_437,
    status: "PARTIALLY_REFUNDED",
    transferStatus: "PARTIALLY_REVERSED",
    refundedPaise: 5_000,
    anonymous: true,
    message: "Keep the village training practical.",
    razorpayReference: "pay_demo_1038",
    createdAt: "2026-09-02T12:40:00.000Z",
  },
];

export const initialVerificationDocuments: VerificationDocument[] = [
  {
    id: "verify-registration",
    organizationId: "org-udaan-learning",
    label: "Section 8 registration certificate",
    privateObjectId: "private://verification/registration-demo",
    expiresOn: "2031-04-20",
    status: "APPROVED",
    reviewedBy: "admin-mira",
    reviewedAt: "2026-09-12T09:30:00.000Z",
  },
  {
    id: "verify-80g",
    organizationId: "org-udaan-learning",
    label: "80G certificate",
    privateObjectId: "private://verification/80g-demo",
    expiresOn: "2027-03-31",
    status: "CHANGES_REQUESTED",
    latestReason:
      "Upload the complete certificate including the issuing authority signature page.",
    reviewedBy: "admin-mira",
    reviewedAt: "2026-09-18T11:10:00.000Z",
  },
  {
    id: "verify-bank",
    organizationId: "org-udaan-learning",
    label: "Bank account proof",
    privateObjectId: "private://verification/bank-demo",
    status: "PENDING",
  },
];

export type ItemNeed = {
  id: string;
  organizationId: string;
  title: string;
  category: string;
  requestedQuantity: number;
  receivedQuantity: number;
  acceptedCondition: string;
  deadline: string;
  fulfilment: string;
};

export const initialItemNeeds: ItemNeed[] = [
  {
    id: "need-blankets",
    organizationId: "org-udaan-learning",
    title: "Warm single-bed blankets",
    category: "Clothes",
    requestedQuantity: 40,
    receivedQuantity: 18,
    acceptedCondition: "New or freshly laundered, no tears",
    deadline: "2026-11-15",
    fulfilment: "Drop-off in Pune or pickup for 10+ items",
  },
  {
    id: "need-books",
    organizationId: "org-udaan-learning",
    title: "English and Marathi story books",
    category: "Books",
    requestedQuantity: 120,
    receivedQuantity: 54,
    acceptedCondition: "New or gently used, ages 8–14",
    deadline: "2026-12-10",
    fulfilment: "Drop-off at the learning centre",
  },
];

export type ItemPledge = {
  id: string;
  needId: string;
  donorId: string;
  quantity: number;
  condition: string;
  notes: string;
  preference: "PICKUP" | "DROPOFF";
  status: ItemDonationStatus;
  timeline: { label: string; at: string }[];
};

export const initialItemPledges: ItemPledge[] = [
  {
    id: "pledge-demo-1",
    needId: "need-blankets",
    donorId: "donor-demo",
    quantity: 6,
    condition: "New",
    notes: "Packed in two labelled cartons.",
    preference: "PICKUP",
    status: "ACCEPTED",
    timeline: [
      { label: "Pledge submitted", at: "17 Sep, 10:20" },
      { label: "Accepted by organization", at: "18 Sep, 09:10" },
    ],
  },
];

export type VolunteerApplication = {
  id: string;
  opportunityId: string;
  title: string;
  applicantId: string;
  status: VolunteerStatus;
};

export const volunteerOpportunities = [
  {
    id: "volunteer-reading",
    title: "Weekend reading-circle facilitator",
    organization: "Udaan Learning Foundation",
    location: "Pune · in person",
    commitment: "Two Saturdays per month",
    openSpots: 6,
  },
  {
    id: "volunteer-data",
    title: "Programme data cleanup volunteer",
    organization: "Jal Saathi Collective",
    location: "Remote",
    commitment: "8 hours across two weeks",
    openSpots: 2,
  },
] as const;

export const organizationFeed = [
  {
    id: "update-1",
    organization: "Udaan Learning Foundation",
    type: "Cause update",
    title: "The first 80 learning kits have reached three centres",
    body: "Facilitators shared attendance logs and distribution photos with prior donors. All names in this synthetic update are fictional.",
    date: "18 Sep 2026",
  },
  {
    id: "update-2",
    organization: "Jal Saathi Collective",
    type: "Short video",
    title: "How volunteers use a field water-testing kit",
    body: "A 42-second synthetic demo reel showing the testing workflow without beneficiary-identifying information.",
    date: "15 Sep 2026",
  },
  {
    id: "update-3",
    organization: "Sahaara Health Network",
    type: "Event",
    title: "Community preventive-health orientation",
    body: "Registration is open for a fictional public orientation in Bengaluru.",
    date: "12 Sep 2026",
  },
] as const;
