import { ContentPage } from "@/components/content-page";
export const metadata = { title: "For organizations" };
export default function Page() {
  return (
    <ContentPage
      kicker="For organizations"
      title="Prepare evidence once. Stay in control of every fact."
      intro="INSIPS gives social-impact organizations a clear workspace for evidence readiness, human confirmation, and transparent review."
      sections={[
        {
          title: "A next action, not another empty dashboard",
          body: "See what is ready, what is missing, and the single most useful thing to do next.",
          points: [
            "Save and resume your organization profile",
            "Keep evidence restricted by default",
            "Track each claim independently",
          ],
        },
        {
          title: "Compass helps you prepare",
          body: "AI-assisted candidates reduce repetitive typing while source references and clear uncertainty keep you in control.",
          points: [
            "Accept, edit, or dismiss every suggestion",
            "No silent publication",
            "No legitimacy or compliance score",
          ],
        },
        {
          title: "Your public profile stays current",
          body: "Only the approved version of a claim appears publicly. Editing it automatically requires a new review.",
        },
      ]}
    />
  );
}
