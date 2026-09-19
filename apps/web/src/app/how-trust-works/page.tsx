import { ContentPage } from "@/components/content-page";

export const metadata = { title: "How it works" };

export default function Page() {
  return (
    <ContentPage
      kicker="How it works"
      title="A visible path from private evidence to approved public facts."
      intro="Six understandable stages keep safety, AI assistance, organization ownership, independent review, and publication separate."
      sections={[
        {
          title: "Upload privately",
          body: "A supported document enters a restricted workspace with a controlled file identity and clear size and format rules.",
        },
        {
          title: "Safety check",
          body: "The document stays blocked until the required safety result is known. Failed, unknown, or unsupported results never move forward.",
        },
        {
          title: "Read the evidence",
          body: "The system prepares bounded, page-aware text while keeping the underlying file restricted.",
        },
        {
          title: "Review suggestions",
          body: "INSIPS Compass returns candidate facts and source references. The organization accepts, edits, or dismisses each suggestion.",
        },
        {
          title: "Human decision",
          body: "An independent reviewer compares organization-confirmed claims with their source context and records a decision.",
        },
        {
          title: "Publish approved facts",
          body: "Only approved current versions appear publicly, with a meaning and review date. Evidence and internal notes remain private.",
        },
      ]}
    />
  );
}
