import { ItemNeedsDirectory } from "@/components/community-flows";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Item donations" };

export default function Page() {
  return (
    <div className="marketing-site public-product-site">
      <PublicHeader />
      <ItemNeedsDirectory />
      <SiteFooter />
    </div>
  );
}
