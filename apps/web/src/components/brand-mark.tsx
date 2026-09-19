import Image from "next/image";
import Link from "next/link";

export function BrandMark({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <Link
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      href="/"
      aria-label="INSIPS home"
    >
      <span className="brand-logo-tile">
        <Image
          alt=""
          height={44}
          priority
          src="/brand/insips-logo.png"
          width={44}
        />
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>INSIPS</strong>
        </span>
      )}
    </Link>
  );
}
