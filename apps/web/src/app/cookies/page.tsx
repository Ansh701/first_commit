import { ContentPage } from "@/components/content-page";
export const metadata = { title: "Cookie notice" };
export default function Page() {
  return (
    <ContentPage
      draft
      kicker="Cookie notice"
      title="The local demo uses browser storage, not advertising trackers."
      intro="This draft explains the current synthetic experience and must be reviewed when real authentication is connected."
      sections={[
        {
          title: "Theme preference",
          body: "The browser stores your light or dark theme selection so the interface remains consistent.",
        },
        {
          title: "Synthetic demo state",
          body: "Local storage preserves fixture decisions such as accepted candidates, review state, and shortlist choices.",
        },
        {
          title: "Future secure sessions",
          body: "Production authentication is intended to use secure, HttpOnly, appropriately scoped cookies. Final details depend on the deployed environment.",
        },
      ]}
    />
  );
}
