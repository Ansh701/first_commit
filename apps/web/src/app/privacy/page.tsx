import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Privacy policy" };
export default function Page() {
  return (
    <ContentPage
      draft
      kicker="Privacy policy"
      title="A transparent draft for a synthetic prototype."
      intro="This page describes the intended privacy boundaries of the hackathon implementation. It is not a final production policy."
      sections={[
        {
          title: "Data minimization",
          body: "The demonstration uses synthetic data only. Production use requires a separate privacy, retention, legal, and incident-response review.",
        },
        {
          title: "Restricted evidence",
          body: "Uploaded documents and extracted text are intended to remain private and absent from public responses, analytics, URLs, and logs.",
        },
        {
          title: "Public information",
          body: "Only approved current claims, safe meanings, source summaries, and review dates are intended for public display.",
        },
      ]}
    />
  );
}
