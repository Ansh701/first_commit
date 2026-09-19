import { ContentPage } from "@/components/content-page";
export const metadata = { title: "For CSR teams" };
export default function Page() {
  return (
    <ContentPage
      kicker="For CSR teams"
      title="Understand why a claim is trusted—not just whether it has a badge."
      intro="Discover synthetic demonstration organizations through specific, dated, human-reviewed indicators."
      ctaHref="/csr/discover"
      ctaLabel="Open CSR discovery"
      sections={[
        {
          title: "Specific indicators",
          body: "Registration, tax status, and other claims remain separate so each one can carry its own meaning and review date.",
        },
        {
          title: "Safer discovery",
          body: "Public views contain approved summaries only. Restricted evidence, reviewer notes, and draft claims never appear.",
        },
        {
          title: "A focused shortlist",
          body: "Save organizations for comparison without turning the trust workflow into a marketplace or automated funding decision.",
        },
      ]}
    />
  );
}
