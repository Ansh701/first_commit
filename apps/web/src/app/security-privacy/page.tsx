import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Security and privacy" };
export default function Page() {
  return (
    <ContentPage
      kicker="Security and privacy"
      title="Restricted evidence never becomes the public product."
      intro="INSIPS separates public trust indicators from private evidence, candidate data, internal notes, and identity records."
      sections={[
        {
          title: "Private by default",
          body: "Evidence enters a restricted workflow and cannot move forward until required safety checks are complete.",
        },
        {
          title: "Least information",
          body: "Public profiles include only the current approved value, its meaning, a safe source summary, and review date.",
        },
        {
          title: "Human-supervised AI",
          body: "Document text is treated as untrusted content. Compass has no tools, its output is schema-checked, and malformed results fail closed.",
        },
        {
          title: "Local demonstration boundary",
          body: "This repository currently uses clearly labeled synthetic fixtures. Do not enter real personal, compliance, or identity data.",
        },
      ]}
    />
  );
}
