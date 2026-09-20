import { PublicHeader } from "./public-header";
import { SiteFooter } from "./site-footer";

export function PublicShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`public-shell ${className}`.trim()}>
      <PublicHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </div>
  );
}
