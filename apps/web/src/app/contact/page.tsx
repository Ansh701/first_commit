import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Contact" };
export default function Page() {
  return (
    <ContentPage
      kicker="Contact"
      title="Contact details have not been published yet."
      intro="The project owner has not supplied a public support email, phone number, or social account, so INSIPS does not invent one."
      sections={[
        {
          title: "Hackathon feedback",
          body: "Use the authorized submission channel or repository discussion once the public repository is connected.",
        },
        {
          title: "Security reports",
          body: "A dedicated reporting channel must be confirmed before production use. Do not place sensitive evidence in public issues.",
        },
      ]}
    />
  );
}
