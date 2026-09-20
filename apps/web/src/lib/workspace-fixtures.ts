export const evidencePipelineStages = [
  { label: "Upload privately", detail: "Restricted evidence workspace", state: "complete" },
  { label: "Safety check", detail: "Document scan completed", state: "complete" },
  { label: "Read the evidence", detail: "2 pages prepared with references", state: "complete" },
  { label: "Review suggestions", detail: "Candidates need your input", state: "current" },
  { label: "Human decision", detail: "Independent review follows submission", state: "waiting" },
  { label: "Publish approved facts", detail: "Only approved current claims appear", state: "waiting" },
] as const;
