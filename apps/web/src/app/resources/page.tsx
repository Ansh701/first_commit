import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Resources" };
export default function Page() {
  return (
    <ContentPage
      kicker="Resources"
      title="Understand the workflow before you trust the output."
      intro="Plain-language guides explain how evidence moves, what each indicator means, and where human judgment remains essential."
      sections={[
        {
          title: "How the workflow works",
          body: "Follow the path from private upload through organization confirmation, independent review, and approved publication.",
        },
        {
          title: "Security and privacy",
          body: "See which information is public, confidential, or restricted and how the product keeps those boundaries visible.",
        },
        {
          title: "Help and frequently asked questions",
          body: "Find concise answers for organizations, reviewers, and CSR users using the synthetic demonstration.",
        },
      ]}
    />
  );
}
