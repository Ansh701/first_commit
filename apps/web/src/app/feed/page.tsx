import { PublicFeed } from "@/components/public-feed";
import { PublicShell } from "@/components/public-shell";
import { getPublishedFeed } from "@/lib/server/content-repository";
import styles from "./feed-page.module.css";

export const metadata = { title: "Public updates" };

export default async function FeedPage() {
  const page = await getPublishedFeed({ limit: 12 });
  return (
    <PublicShell className={`${styles.page} marketing-site public-feed-site`}>
      <PublicFeed page={page} />
    </PublicShell>
  );
}
