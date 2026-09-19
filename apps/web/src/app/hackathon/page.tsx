import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Hackathon story" };
export default function Page() {
  return (
    <ContentPage
      kicker="First Commit"
      title="A focused evidence-to-trust vertical slice."
      intro="INSIPS was built for the WeMakeDevs × AWS First Commit hackathon around one complete, judgeable workflow."
      sections={[
        {
          title: "What was built",
          body: "A responsive public experience, organization workspace, independent review view, CSR discovery, secure cloud foundation, deterministic fixtures, and a three-minute demo path.",
        },
        {
          title: "How AI was used",
          body: "INSIPS Compass is bounded product AI. OpenAI Codex assisted with implementation, testing, documentation, and review; this use is disclosed in the repository.",
        },
        {
          title: "What remains external",
          body: "Live cloud deployment, model and region selection, budget approval, public repository authorization, and video submission require the project owner.",
        },
      ]}
    />
  );
}
