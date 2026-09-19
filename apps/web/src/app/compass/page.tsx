import { ContentPage } from "@/components/content-page";
export const metadata = { title: "INSIPS Compass" };
export default function Page() {
  return (
    <ContentPage
      kicker="INSIPS Compass"
      title="AI assistance with a deliberately short reach."
      intro="Compass prepares grounded candidate fields from restricted evidence while keeping every consequential decision with a person."
      sections={[
        {
          title: "What Compass does",
          body: "It identifies supported candidates, missing evidence, ambiguity, and page-level source references within a strict schema.",
        },
        {
          title: "What Compass never does",
          body: "It does not certify legitimacy, assess fraud, decide funding eligibility, approve claims, or publish information.",
        },
        {
          title: "Human control by design",
          body: "Every candidate requires Accept, Edit, or Dismiss. Reviewers then make an independent claim-level decision.",
        },
      ]}
    />
  );
}
