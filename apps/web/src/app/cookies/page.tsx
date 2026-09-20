import { RepositoryContentPage } from "@/components/repository-content-page";
export const metadata = { title: "Cookie notice" };
export default function Page() { return <RepositoryContentPage slug="cookies" ctaLabel="Read privacy" ctaHref="/privacy" />; }
