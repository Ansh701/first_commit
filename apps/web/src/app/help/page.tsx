import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Help and contact" };
export default function Page() {
  return (
    <ContentPage
      kicker="Help and contact"
      title="Know what happened—and what to do next."
      intro="The product explains preserved work, blocked states, and safe recovery actions without exposing raw system errors."
      ctaHref="/contact"
      ctaLabel="View contact status"
      sections={[
        {
          title: "Using the synthetic demo",
          body: "Choose a role from the demo launcher, follow the evidence flow, and reset browser site data when you want a clean run.",
        },
        {
          title: "A document is blocked",
          body: "Keep it restricted. Correct the file or account issue, then retry only the failed safe stage—never skip a required check.",
        },
        {
          title: "A public indicator disappeared",
          body: "The underlying value may have changed. This is expected until a reviewer approves the new version.",
        },
      ]}
    />
  );
}
