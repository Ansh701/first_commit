import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Accessibility" };
export default function Page() {
  return (
    <ContentPage
      kicker="Accessibility"
      title="The trust workflow should be understandable by more people."
      intro="INSIPS is designed for keyboard access, visible focus, responsive zoom, reduced motion, and clear text alternatives."
      sections={[
        {
          title: "Interaction",
          body: "Controls use semantic buttons and links, visible focus, descriptive labels, and status text that does not rely on color alone.",
        },
        {
          title: "Motion",
          body: "Ambient movement and transitions are disabled or simplified when the browser requests reduced motion.",
        },
        {
          title: "Testing",
          body: "Key routes are checked with automated accessibility scans plus manual keyboard, zoom, contrast, and overflow review.",
        },
        {
          title: "Feedback",
          body: "A public accessibility contact channel has not yet been supplied. This page will be updated when one is approved.",
        },
      ]}
    />
  );
}
