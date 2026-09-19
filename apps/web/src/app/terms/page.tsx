import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Terms of use" };
export default function Page() {
  return (
    <ContentPage
      draft
      kicker="Terms of use"
      title="Prototype terms for demonstration only."
      intro="These draft terms are placeholders for review before any production release or use with real organizations."
      sections={[
        {
          title: "Permitted use",
          body: "Use the current application only with synthetic demonstration content. Do not upload real identity, compliance, or personal records.",
        },
        {
          title: "No professional advice",
          body: "INSIPS does not provide legal, compliance, financial, eligibility, or fraud determinations.",
        },
        {
          title: "No production guarantee",
          body: "Local fixtures demonstrate intended behavior and must not be represented as live cloud processing or verified customer data.",
        },
      ]}
    />
  );
}
