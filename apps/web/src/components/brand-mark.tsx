import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="INSIPS Passport home">
      <span className="brand-symbol" aria-hidden="true">
        <span />
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>INSIPS</strong>
          <small>Passport</small>
        </span>
      )}
    </Link>
  );
}
