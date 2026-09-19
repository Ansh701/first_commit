import { ContentPage } from "@/components/content-page";
export const metadata = { title: "About INSIPS" };
export default function Page() {
  return (
    <ContentPage
      kicker="About INSIPS"
      title="Infrastructure for clearer social-impact trust."
      intro="INSIPS explores how organizations can prepare evidence once and communicate reviewed facts without exposing private documents."
      sections={[
        {
          title: "Our product thesis",
          body: "Organizations should be able to turn evidence into explainable trust signals, while donors and CSR teams should understand why each signal is trusted.",
        },
        {
          title: "Our design principle",
          body: "Automation may prepare work, but people remain responsible for claims, review, and publication.",
        },
        {
          title: "Current stage",
          body: "This is a synthetic hackathon implementation. It does not claim customers, certifications, measured outcomes, or production readiness.",
        },
      ]}
    />
  );
}
