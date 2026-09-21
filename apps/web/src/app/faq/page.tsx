import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { FaqExperience } from "./faq-experience";

export const metadata = { title: "FAQ" };

export default async function Page() {
  const page = await getPublishedSiteContent("faq");
  return <FaqExperience page={page} />;
}
