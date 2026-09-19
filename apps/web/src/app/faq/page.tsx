import { ContentPage } from "@/components/content-page";
export const metadata = { title: "FAQ" };
export default function Page() {
  return (
    <ContentPage
      kicker="Frequently asked questions"
      title="Straight answers about evidence, AI, and review."
      intro="The short version: private documents stay private, AI prepares candidates, and people remain responsible for every decision."
      sections={[
        {
          title: "Does INSIPS verify an organization?",
          body: "No. INSIPS presents specific human-reviewed claims and their meaning. It does not provide a universal legitimacy, compliance, or fraud verdict.",
        },
        {
          title: "Can Compass publish a claim?",
          body: "No. An organization must confirm it and an independent reviewer must approve the current version.",
        },
        {
          title: "Who can see uploaded evidence?",
          body: "Only appropriately authorized people in the restricted workflow. Public and CSR views receive an intentionally narrow approved projection.",
        },
        {
          title: "Is the current data real?",
          body: "No. Every person, organization, identifier, document, and decision in this local experience is synthetic.",
        },
      ]}
    />
  );
}
