import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Trust methodology" };
export default function Page() {
  return (
    <ContentPage
      kicker="Trust methodology"
      title="Trust is a set of explainable claims, not one score."
      intro="INSIPS keeps preparation, organization confirmation, independent review, and public presentation as separate accountable steps."
      sections={[
        {
          title: "AI prepares",
          body: "Compass can structure candidate facts and point to supporting source context. It cannot verify, approve, reject, or publish.",
        },
        {
          title: "Organizations confirm",
          body: "The organization chooses the value it is willing to submit and can correct or dismiss every suggestion.",
        },
        {
          title: "Reviewers decide",
          body: "A platform reviewer records a decision for each submitted claim without silently changing organization-authored data.",
        },
        {
          title: "The public sees only current approvals",
          body: "If an approved value changes, its public approval is removed until the updated version is reviewed.",
        },
      ]}
    />
  );
}
