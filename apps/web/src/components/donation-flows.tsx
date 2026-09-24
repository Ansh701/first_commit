"use client";

import {
  calculateDonationBreakdown,
  type Donation,
  type PublicCause,
} from "@insips/contracts";
import {
  ArrowRight,
  Bookmark,
  Check,
  CreditCard,
  Download,
  FileDown,
  Heart,
  IndianRupee,
  MessageSquareText,
  QrCode,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { FormEvent, useEffect, useState } from "react";
import detailStyles from "./donation-detail.module.css";
import { useProductDemo } from "./product-demo-provider";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatPaise(value: number) {
  return money.format(value / 100);
}

function downloadText(filename: string, body: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function donationCsv(donations: Donation[]) {
  return [
    [
      "Donation ID",
      "Date",
      "Cause",
      "Gross paise",
      "Platform fee paise",
      "Razorpay fee paise",
      "Net paise",
      "Status",
      "Transfer",
    ],
    ...donations.map((donation) => [
      donation.id,
      donation.createdAt,
      donation.causeId,
      donation.amountPaise,
      donation.platformFeePaise,
      donation.razorpayFeePaise,
      donation.netOrganizationPaise,
      donation.status,
      donation.transferStatus,
    ]),
  ]
    .map((row) => row.map((cell) => JSON.stringify(String(cell))).join(","))
    .join("\n");
}

function DonationStatus({ donation }: { donation: Donation }) {
  return (
    <span className={`state-badge ${donation.status.toLowerCase()}`}>
      {donation.status.replaceAll("_", " ")}
    </span>
  );
}

export function DonorHome() {
  const { donations, causes, itemPledges, followedCauses, bookmarkedCauses } =
    useProductDemo();
  const capturedTotal = donations
    .filter((donation) =>
      ["CAPTURED", "PARTIALLY_REFUNDED"].includes(donation.status),
    )
    .reduce(
      (total, donation) =>
        total + donation.amountPaise - donation.refundedPaise,
      0,
    );
  const highlightedCauses = causes.filter(
    (cause) =>
      followedCauses.includes(cause.id) || bookmarkedCauses.includes(cause.id),
  );

  return (
    <div className={`${detailStyles.page} flow-page`}>
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Individual donor · test data</span>
          <h1>Your giving, clearly accounted for</h1>
          <p>
            Follow causes, review confirmed payments, download demo receipts,
            and track item pledges without mixing money and quantities.
          </p>
        </div>
        <Link className="button button-primary" href="/causes">
          Discover causes <ArrowRight size={16} />
        </Link>
      </header>
      <div className="summary-stat-grid">
        <article>
          <IndianRupee size={20} />
          <span>Confirmed giving</span>
          <strong>{formatPaise(capturedTotal)}</strong>
        </article>
        <article>
          <Heart size={20} />
          <span>Following</span>
          <strong>{followedCauses.length}</strong>
        </article>
        <article>
          <Bookmark size={20} />
          <span>Bookmarked causes</span>
          <strong>{bookmarkedCauses.length}</strong>
        </article>
        <article>
          <WalletCards size={20} />
          <span>Item pledges</span>
          <strong>{itemPledges.length}</strong>
        </article>
      </div>
      <section className="donor-home-next-steps" aria-label="Donor next steps">
        <div className="flow-panel donor-home-next-action">
          <div className="flow-panel-head">
            <div>
              <small>Suggested next step</small>
              <h2>Keep your giving trail together</h2>
            </div>
            <ShieldCheck size={21} />
          </div>
          <p>
            Review the evidence trail behind a cause, then choose a contribution
            that fits your intent. Your receipts and item pledges stay separate
            and easy to revisit.
          </p>
          <div className="donor-home-actions">
            <Link className="button button-primary" href="/causes">
              Explore confirmed causes <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" href="/donor/donations">
              View receipts
            </Link>
            <Link className="button button-secondary" href="/donor/items">
              Track item pledges
            </Link>
          </div>
        </div>
        <div className="flow-panel donor-home-saved">
          <div className="flow-panel-head">
            <div>
              <small>Saved for later</small>
              <h2>Causes you follow</h2>
            </div>
            <Bookmark size={21} />
          </div>
          {highlightedCauses.length ? (
            <div className="donor-home-cause-list">
              {highlightedCauses.slice(0, 3).map((cause) => {
                const progress = Math.min(
                  100,
                  Math.round((cause.raisedPaise / cause.targetPaise) * 100),
                );
                return (
                  <Link href={`/causes/${cause.slug}`} key={cause.id}>
                    <span>
                      <strong>{cause.title}</strong>
                      <small>{cause.organization}</small>
                    </span>
                    <i aria-hidden="true">
                      <b style={{ width: `${progress}%` }} />
                    </i>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="donor-home-empty-copy">
              Save a cause while you browse and it will appear here for an
              easier next visit.
            </p>
          )}
        </div>
      </section>
      <section className="flow-panel">
        <div className="flow-panel-head">
          <div>
            <small>Recent activity</small>
            <h2>Donation history</h2>
          </div>
          <Link href="/donor/donations">View all</Link>
        </div>
        <DonationTable
          donations={donations.slice(0, 4)}
          donorView
          causes={causes}
        />
      </section>
    </div>
  );
}

function DonationTable({
  donations,
  donorView = false,
  adminView = false,
  onSelect,
  causes,
}: {
  donations: Donation[];
  donorView?: boolean;
  adminView?: boolean;
  onSelect?: (donationId: string) => void;
  causes: ReadonlyArray<{ id: string; title: string; organization: string }>;
}) {
  return (
    <div
      aria-label="Donation records"
      className="responsive-table"
      role="region"
      tabIndex={0}
    >
      <table>
        <thead>
          <tr>
            <th>Donation</th>
            <th>Date</th>
            <th>Gross</th>
            <th>Fee</th>
            <th>Net</th>
            <th>Status</th>
            <th>{adminView ? "Transfer" : ""}</th>
            {adminView ? <th>Details</th> : null}
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => {
            const cause = causes.find((item) => item.id === donation.causeId);
            return (
              <tr key={donation.id}>
                <td data-label="Donation">
                  <strong>{cause?.title ?? donation.causeId}</strong>
                  <small>{cause?.organization}</small>
                </td>
                <td data-label="Date">
                  {new Date(donation.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td data-label="Gross">{formatPaise(donation.amountPaise)}</td>
                <td data-label="Platform fee">
                  {formatPaise(donation.platformFeePaise)}
                </td>
                <td data-label="Net">
                  {formatPaise(donation.netOrganizationPaise)}
                </td>
                <td data-label="Status">
                  <DonationStatus donation={donation} />
                </td>
                <td data-label={donorView ? "Details" : "Transfer"}>
                  {donorView ? (
                    <Link href={`/donor/donations/${donation.id}`}>
                      Details
                    </Link>
                  ) : (
                    donation.transferStatus.replaceAll("_", " ")
                  )}
                </td>
                {adminView ? (
                  <td data-label="Details">
                    <button
                      className="ledger-detail-button"
                      type="button"
                      onClick={() => onSelect?.(donation.id)}
                    >
                      Inspect
                    </button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function DonorDonationHistory() {
  const { donations, causes } = useProductDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [range, setRange] = useState("ALL");
  const filtered = donations.filter((donation) => {
    const cause = causes.find((item) => item.id === donation.causeId);
    const ageDays = Math.floor(
      (Date.now() - new Date(donation.createdAt).getTime()) / 86_400_000,
    );
    return (
      (status === "ALL" || donation.status === status) &&
      `${cause?.title} ${cause?.organization} ${donation.razorpayReference}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (range === "ALL" ||
        (range === "30" && ageDays <= 30) ||
        (range === "90" && ageDays <= 90) ||
        (range === "365" && ageDays <= 365))
    );
  });
  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Personal donation history</span>
          <h1>Money donations</h1>
          <p>
            Only captured payments count toward cause progress. Pending and
            failed payments remain visible but do not increase totals.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() =>
            downloadText(
              "insips-donations.csv",
              donationCsv(filtered),
              "text/csv",
            )
          }
          type="button"
        >
          <FileDown size={16} /> Export CSV
        </button>
      </header>
      <div className="table-toolbar">
        <label>
          <Search size={16} />
          <input
            aria-label="Search cause or reference"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cause or reference"
            value={query}
          />
        </label>
        <select
          aria-label="Filter donation status"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="ALL">All statuses</option>
          <option value="CAPTURED">Captured</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="PARTIALLY_REFUNDED">Partially refunded</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select
          aria-label="Filter donation date range"
          onChange={(event) => setRange(event.target.value)}
          value={range}
        >
          <option value="ALL">All time</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>
      <section className="flow-table-card">
        {filtered.length ? (
          <DonationTable donations={filtered} donorView causes={causes} />
        ) : (
          <div className="empty-flow-state">
            <strong>No donation records match these filters</strong>
            <p>Try a broader search, date range, or payment status.</p>
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery("");
                setRange("ALL");
                setStatus("ALL");
              }}
              type="button"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export function DonationDetail({ donationId }: { donationId: string }) {
  const { donations, causes } = useProductDemo();
  const donation = donations.find((item) => item.id === donationId);
  if (!donation) {
    return (
      <div className="empty-flow-state">
        <CreditCard size={26} />
        <h1>Donation not found</h1>
        <p>
          This private donation is unavailable to the current local fixture.
        </p>
        <Link href="/donor/donations">Return to donation history</Link>
      </div>
    );
  }
  const selectedDonation = donation;
  const cause = causes.find((item) => item.id === selectedDonation.causeId);
  const receipt = [
    "INSIPS NON-TAX DEMO RECEIPT",
    "Synthetic fixture · not valid for tax deduction",
    `Donation: ${donation.id}`,
    `Cause: ${cause?.title}`,
    `Organization: ${cause?.organization}`,
    `Amount: ${formatPaise(donation.amountPaise)}`,
    `Platform fee (${donation.feeRateBps} bps): ${formatPaise(donation.platformFeePaise)}`,
    `Payment status: ${donation.status}`,
    `Razorpay test reference: ${donation.razorpayReference ?? "Not available"}`,
  ].join("\n");
  async function downloadDonationQr() {
    const url = `${window.location.origin}/donor/donations/${selectedDonation.id}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 768,
      margin: 2,
      color: { dark: "#122314", light: "#ffffff" },
    });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${selectedDonation.id}-qr.png`;
    anchor.click();
  }
  return (
    <div className="flow-page">
      <header className="flow-page-heading compact">
        <div>
          <Link className="back-link" href="/donor/donations">
            ← Donation history
          </Link>
          <h1>{formatPaise(donation.amountPaise)}</h1>
          <p>
            {cause?.title} · {cause?.organization}
          </p>
        </div>
        <DonationStatus donation={donation} />
      </header>
      <div className={detailStyles.grid}>
        <section className={`${detailStyles.card} flow-panel receipt-card`}>
          <div className="flow-panel-head">
            <div>
              <small>Payment</small>
              <h2>Transparent breakdown</h2>
            </div>
            <ShieldCheck size={24} />
          </div>
          <dl className={detailStyles.breakdown}>
            <div>
              <dt>Cause amount</dt>
              <dd>{formatPaise(donation.amountPaise)}</dd>
            </div>
            <div>
              <dt>INSIPS platform fee · {donation.feeRateBps} bps</dt>
              <dd>{formatPaise(donation.platformFeePaise)}</dd>
            </div>
            <div>
              <dt>Razorpay fee reported</dt>
              <dd>{formatPaise(donation.razorpayFeePaise)}</dd>
            </div>
            <div>
              <dt>Net organization amount</dt>
              <dd>{formatPaise(donation.netOrganizationPaise)}</dd>
            </div>
            <div>
              <dt>Refunded</dt>
              <dd>{formatPaise(donation.refundedPaise)}</dd>
            </div>
          </dl>
          <div className={`${detailStyles.actions} card-actions`}>
            <button
              className="button button-secondary"
              onClick={() =>
                downloadText(`${donation.id}-demo-receipt.txt`, receipt)
              }
              type="button"
            >
              <Download size={16} /> Download non-tax demo receipt
            </button>
            <button
              className="button button-secondary"
              onClick={() => void downloadDonationQr()}
              type="button"
            >
              <QrCode size={16} /> Download donation QR
            </button>
          </div>
        </section>
        <section className={`${detailStyles.card} flow-panel receipt-card`}>
          <div className="flow-panel-head">
            <div>
              <small>Donation preferences</small>
              <h2>What the organization can see</h2>
            </div>
          </div>
          <dl className={detailStyles.breakdown}>
            <div>
              <dt>Name preference</dt>
              <dd>{donation.anonymous ? "Anonymous" : donation.publicName}</dd>
            </div>
            <div>
              <dt>Message</dt>
              <dd>{donation.message ?? "No message"}</dd>
            </div>
            <div>
              <dt>Payment reference</dt>
              <dd>{donation.razorpayReference}</dd>
            </div>
            <div>
              <dt>Transfer</dt>
              <dd>{donation.transferStatus.replaceAll("_", " ")}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export function OrganizationDonationLedger({
  admin = false,
}: {
  admin?: boolean;
}) {
  const { donations, causes, causeProgress } = useProductDemo();
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("ALL");
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (!admin) return;
    const previousOverflowX = document.body.style.overflowX;
    document.body.style.overflowX = "clip";
    return () => {
      document.body.style.overflowX = previousOverflowX;
    };
  }, [admin]);
  const filtered = donations.filter((donation) => {
    const cause = causes.find((item) => item.id === donation.causeId);
    const matchesStatus = status === "ALL" || donation.status === status;
    const matchesQuery =
      `${cause?.title ?? ""} ${cause?.organization ?? ""} ${donation.id} ${donation.razorpayReference}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    const ageDays = Math.floor(
      (Date.now() - new Date(donation.createdAt).getTime()) / 86_400_000,
    );
    const matchesRange =
      range === "ALL" ||
      (range === "30" && ageDays <= 30) ||
      (range === "90" && ageDays <= 90) ||
      (range === "365" && ageDays <= 365);
    return matchesStatus && matchesQuery && matchesRange;
  });
  const captured = donations.filter((donation) =>
    ["CAPTURED", "PARTIALLY_REFUNDED"].includes(donation.status),
  );
  const gross = captured.reduce(
    (total, donation) => total + donation.amountPaise,
    0,
  );
  const platformFees = captured.reduce(
    (total, donation) => total + donation.platformFeePaise,
    0,
  );
  const net = captured.reduce(
    (total, donation) =>
      total + donation.netOrganizationPaise - donation.refundedPaise,
    0,
  );
  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">
            {admin ? "Platform ledger" : "Organization accounting"} · test mode
          </span>
          <h1>
            {admin ? "Donation and transfer ledger" : "Donations received"}
          </h1>
          <p>
            Authoritative amounts are stored as integer paise. Each donation
            preserves the fee rate used at checkout.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() =>
            downloadText(
              admin
                ? "insips-admin-donation-ledger.csv"
                : "insips-organization-donations.csv",
              donationCsv(filtered),
              "text/csv",
            )
          }
          type="button"
        >
          <FileDown size={16} /> Export CSV
        </button>
      </header>
      <div className="summary-stat-grid">
        <article>
          <IndianRupee size={20} />
          <span>Gross captured</span>
          <strong>{formatPaise(gross)}</strong>
        </article>
        <article>
          <WalletCards size={20} />
          <span>Platform fees</span>
          <strong>{formatPaise(platformFees)}</strong>
        </article>
        <article>
          <Check size={20} />
          <span>Net after refunds</span>
          <strong>{formatPaise(net)}</strong>
        </article>
        <article>
          <RotateCcw size={20} />
          <span>Cause progress ledger</span>
          <strong>
            {formatPaise(
              Object.values(causeProgress).reduce((a, b) => a + b, 0),
            )}
          </strong>
        </article>
      </div>
      <div
        className="simple-chart"
        aria-label="Captured donation amounts"
        role="img"
      >
        {captured.length ? (
          captured.slice(0, 6).map((donation) => {
            const maxAmount = Math.max(
              ...captured.map((entry) => entry.amountPaise),
              1,
            );
            return (
              <i
                key={donation.id}
                style={{
                  height: `${Math.max(20, (donation.amountPaise / maxAmount) * 100)}%`,
                }}
              />
            );
          })
        ) : (
          <span>No captured donation amounts in this view.</span>
        )}
      </div>
      <div className="table-toolbar">
        <span>Fee rate in fixture: exactly 0.25% · 25 basis points</span>
        <div className="ledger-filters">
          <label>
            <span>Search donations</span>
            <input
              aria-label="Search donations"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cause, organization, or ID"
              type="search"
              value={query}
            />
          </label>
          <label>
            <span>Date range</span>
            <select
              aria-label="Filter ledger date range"
              onChange={(event) => setRange(event.target.value)}
              value={range}
            >
              <option value="ALL">All time</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </label>
          <label>
            <span>Status</span>
            <select
              aria-label="Filter ledger status"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="ALL">All payments</option>
              <option value="CAPTURED">Captured</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="PARTIALLY_REFUNDED">Partially refunded</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </label>
        </div>
      </div>
      <section className="flow-table-card">
        {filtered.length ? (
          <DonationTable
            adminView={admin}
            causes={causes}
            donations={filtered}
            onSelect={admin ? setSelectedDonationId : undefined}
          />
        ) : (
          <div className="empty-flow-state">
            <strong>No donations match these filters</strong>
            <p>Try a broader search, date range, or payment status.</p>
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery("");
                setRange("ALL");
                setStatus("ALL");
              }}
              type="button"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
      {admin && selectedDonationId
        ? (() => {
            const selectedDonation = donations.find(
              (donation) => donation.id === selectedDonationId,
            );
            if (!selectedDonation) return null;
            const cause = causes.find(
              (item) => item.id === selectedDonation.causeId,
            );
            const eventType =
              selectedDonation.status === "PARTIALLY_REFUNDED"
                ? "REFUND_PROCESSED"
                : `PAYMENT_${selectedDonation.status}`;
            return (
              <aside
                aria-label="Donation detail"
                className="ledger-detail-panel"
              >
                <div className="ledger-detail-header">
                  <div>
                    <span>Audit detail</span>
                    <h2>{cause?.title ?? selectedDonation.causeId}</h2>
                  </div>
                  <button
                    aria-label="Close donation detail"
                    className="icon-button"
                    type="button"
                    onClick={() => setSelectedDonationId(null)}
                  >
                    <X size={17} />
                  </button>
                </div>
                <p className="ledger-detail-note">
                  Local test-mode record. Review payment and transfer state
                  before taking any operational action.
                </p>
                <dl className="ledger-detail-grid">
                  <div>
                    <dt>Donation ID</dt>
                    <dd>{selectedDonation.id}</dd>
                  </div>
                  <div>
                    <dt>Organization</dt>
                    <dd>
                      {cause?.organization ?? selectedDonation.organizationId}
                    </dd>
                  </div>
                  <div>
                    <dt>Gross amount</dt>
                    <dd>{formatPaise(selectedDonation.amountPaise)}</dd>
                  </div>
                  <div>
                    <dt>INSIPS fee</dt>
                    <dd>
                      {formatPaise(selectedDonation.platformFeePaise)} ·{" "}
                      {selectedDonation.feeRateBps} bps
                    </dd>
                  </div>
                  <div>
                    <dt>Razorpay fee</dt>
                    <dd>{formatPaise(selectedDonation.razorpayFeePaise)}</dd>
                  </div>
                  <div>
                    <dt>Refunded</dt>
                    <dd>{formatPaise(selectedDonation.refundedPaise)}</dd>
                  </div>
                  <div>
                    <dt>Net organization amount</dt>
                    <dd>
                      {formatPaise(selectedDonation.netOrganizationPaise)}
                    </dd>
                  </div>
                  <div>
                    <dt>Payment event</dt>
                    <dd>{eventType.replaceAll("_", " ")}</dd>
                  </div>
                  <div>
                    <dt>Transfer status</dt>
                    <dd>
                      {selectedDonation.transferStatus.replaceAll("_", " ")}
                    </dd>
                  </div>
                  <div>
                    <dt>Payment reference</dt>
                    <dd>
                      {selectedDonation.razorpayReference ?? "Not assigned"}
                    </dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>
                      {new Date(selectedDonation.createdAt).toLocaleString(
                        "en-IN",
                      )}
                    </dd>
                  </div>
                </dl>
              </aside>
            );
          })()
        : null}
    </div>
  );
}

export function CauseDirectory({ causes }: { causes: PublicCause[] }) {
  const {
    bookmarkedCauses,
    followedCauses,
    toggleBookmarkCause,
    toggleFollowCause,
  } = useProductDemo();
  const [query, setQuery] = useState("");
  const filteredCauses = causes.filter((cause) =>
    `${cause.title} ${cause.organizationName} ${cause.category}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <main className="public-flow-page" id="main-content">
      <header>
        <span className="fixture-chip">Public cause directory</span>
        <h1>
          Discover causes with clear progress and accountable organizations.
        </h1>
        <p>
          Explore money campaigns separately from quantity-based item needs.
          Progress is updated only by captured payment records.
        </p>
        <label>
          <Search size={18} />
          <input
            aria-label="Search causes"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search causes, organizations, or categories"
            value={query}
          />
        </label>
      </header>
      <div className="cause-card-grid">
        {filteredCauses.length ? (
          filteredCauses.map((cause) => {
            const progress = Math.min(
              100,
              Math.round((cause.raisedPaise / cause.targetPaise) * 100),
            );
            return (
              <article className="cause-card" key={cause.id}>
                <div className="cause-art" data-category={cause.category}>
                  <span>{cause.category}</span>
                </div>
                <div>
                  <small>{cause.organizationName}</small>
                  <h2>{cause.title}</h2>
                  <p>{cause.summary}</p>
                  <div className="progress-line">
                    <i style={{ width: `${progress}%` }} />
                  </div>
                  <div className="cause-progress-copy">
                    <strong>{formatPaise(cause.raisedPaise)}</strong>
                    <span>
                      of {formatPaise(cause.targetPaise)} · {progress}%
                    </span>
                  </div>
                  <div className="card-actions">
                    <Link
                      className="button button-primary"
                      href={`/causes/${cause.slug}`}
                    >
                      View cause
                    </Link>
                    <button
                      aria-label={`${followedCauses.includes(cause.id) ? "Unfollow" : "Follow"} ${cause.title}`}
                      className={
                        followedCauses.includes(cause.id) ? "active" : ""
                      }
                      onClick={() => toggleFollowCause(cause.id)}
                      type="button"
                    >
                      <Heart size={17} />
                    </button>
                    <button
                      aria-label={`${bookmarkedCauses.includes(cause.id) ? "Remove bookmark" : "Bookmark"} ${cause.title}`}
                      className={
                        bookmarkedCauses.includes(cause.id) ? "active" : ""
                      }
                      onClick={() => toggleBookmarkCause(cause.id)}
                      type="button"
                    >
                      <Bookmark size={17} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-flow-state" role="status">
            <strong>
              {query
                ? "No causes match that search"
                : "No published causes yet"}
            </strong>
            <p>
              {query
                ? "Try an organization name, cause category, or a broader phrase."
                : "Published causes will appear here when organizations make them available."}
            </p>
            {query ? (
              <button
                className="button button-secondary"
                onClick={() => setQuery("")}
                type="button"
              >
                Clear search
              </button>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}

export function CauseDetail({ cause }: { cause: PublicCause }) {
  const {
    causeProgress,
    createDonation,
    applyDonationEvent,
    donations,
    followedCauses,
    bookmarkedCauses,
    toggleFollowCause,
    toggleBookmarkCause,
  } = useProductDemo();
  const [amount, setAmount] = useState(1000);
  const [coverFee, setCoverFee] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const selectedCause = cause;
  const currentRaised =
    causeProgress[selectedCause.id] ?? selectedCause.raisedPaise;
  const breakdown = calculateDonationBreakdown({
    amountPaise: Math.max(100, Math.round(amount * 100)),
    donorCoversPlatformFee: coverFee,
  });
  const pendingDonation = donations.find(
    (donation) => donation.id === pendingId,
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = createDonation({
      causeId: selectedCause.id,
      organizationId: selectedCause.organizationSlug,
      amountPaise: breakdown.causeAmountPaise,
      donorCoversPlatformFee: coverFee,
      anonymous,
      message,
    });
    setPendingId(id);
    setResult(
      "Test payment created as pending. Cause progress has not changed.",
    );
  }

  async function downloadQr() {
    const url = `${window.location.origin}/causes/${selectedCause.slug}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 768,
      margin: 2,
      color: { dark: "#122314", light: "#ffffff" },
    });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${selectedCause.slug}-qr.png`;
    anchor.click();
  }

  async function shareCause() {
    const shareData = {
      title: selectedCause.title,
      text: selectedCause.summary,
      url: window.location.href,
    };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      setResult("Cause link copied to your clipboard.");
    }
  }

  return (
    <main className="public-flow-page cause-detail-page" id="main-content">
      <Link className="back-link" href="/causes">
        ← All causes
      </Link>
      <header className="cause-detail-hero">
        <div>
          <span className="fixture-chip">
            Fundraising cause · {cause.category}
          </span>
          <h1>{cause.title}</h1>
          <p>{cause.summary}</p>
          <strong>{cause.organizationName}</strong>
          <div className="card-actions">
            <button
              className="button button-secondary"
              onClick={() => toggleFollowCause(cause.id)}
              type="button"
            >
              <Heart size={17} />{" "}
              {followedCauses.includes(cause.id) ? "Following" : "Follow cause"}
            </button>
            <button
              className="button button-secondary"
              onClick={() => toggleBookmarkCause(cause.id)}
              type="button"
            >
              <Bookmark size={17} />{" "}
              {bookmarkedCauses.includes(cause.id) ? "Bookmarked" : "Bookmark"}
            </button>
            <button
              className="button button-secondary"
              onClick={() => void shareCause()}
              type="button"
            >
              <Share2 size={17} /> Share
            </button>
            <button
              className="button button-secondary"
              onClick={() => void downloadQr()}
              type="button"
            >
              <QrCode size={17} /> Download QR
            </button>
          </div>
        </div>
        <div className="cause-progress-panel">
          <strong>{formatPaise(currentRaised)}</strong>
          <span>raised of {formatPaise(cause.targetPaise)}</span>
          <div>
            <i
              style={{
                width: `${Math.min(100, (currentRaised / cause.targetPaise) * 100)}%`,
              }}
            />
          </div>
          <small>Campaign target · ends {cause.endDate}</small>
        </div>
      </header>
      <div className="cause-content-grid">
        <section className="flow-panel">
          <div className="flow-panel-head">
            <div>
              <small>Use of funds</small>
              <h2>What this cause supports</h2>
            </div>
          </div>
          <div className="allocation-list">
            <div>
              <span>Learning materials</span>
              <strong>55%</strong>
            </div>
            <div>
              <span>Facilitator sessions</span>
              <strong>30%</strong>
            </div>
            <div>
              <span>Monitoring and reporting</span>
              <strong>15%</strong>
            </div>
          </div>
          <div className="cause-update">
            <MessageSquareText size={20} />
            <div>
              <strong>Latest update for prior donors</strong>
              <p>
                The first 80 synthetic learning kits reached three centres on 18
                September.
              </p>
            </div>
          </div>
        </section>
        <section className="flow-panel donation-checkout">
          <div className="flow-panel-head">
            <div>
              <small>Secure checkout</small>
              <h2>Make a money donation</h2>
            </div>
            <CreditCard size={24} />
          </div>
          <form onSubmit={submit}>
            <label className="flow-field">
              <span>Donation amount</span>
              <div className="money-input">
                <span>₹</span>
                <input
                  min="1"
                  onChange={(event) => setAmount(Number(event.target.value))}
                  type="number"
                  value={amount}
                />
              </div>
            </label>
            <label className="choice-row">
              <input
                checked={coverFee}
                onChange={(event) => setCoverFee(event.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>Cover the INSIPS platform fee</strong>
                <small>
                  Add {formatPaise(breakdown.platformFeePaise)}. It does not
                  increase the cause total.
                </small>
              </span>
            </label>
            <label className="choice-row">
              <input
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>Donate anonymously</strong>
                <small>The organization sees “Anonymous donor”.</small>
              </span>
            </label>
            <label className="flow-field">
              <span>Personal message</span>
              <textarea
                maxLength={300}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                value={message}
              />
            </label>
            <dl className="checkout-breakdown">
              <div>
                <dt>Cause amount</dt>
                <dd>{formatPaise(breakdown.causeAmountPaise)}</dd>
              </div>
              <div>
                <dt>INSIPS fee · 0.25%</dt>
                <dd>{formatPaise(breakdown.platformFeePaise)}</dd>
              </div>
              <div>
                <dt>Total in test checkout</dt>
                <dd>{formatPaise(breakdown.totalChargedPaise)}</dd>
              </div>
            </dl>
            <button className="button button-primary button-full" type="submit">
              Create test payment <ArrowRight size={16} />
            </button>
          </form>
          {result ? (
            <div className="inline-result" role="status">
              {result}
            </div>
          ) : null}
          {pendingId && pendingDonation?.status === "PENDING" ? (
            <div className="payment-test-actions">
              <button
                className="button button-secondary"
                onClick={() => {
                  const eventId = `capture-${pendingId}`;
                  applyDonationEvent(pendingId, {
                    id: eventId,
                    donationId: pendingId,
                    type: "PAYMENT_CAPTURED",
                    occurredAt: new Date().toISOString(),
                  });
                  setResult(
                    "Signed local captured event applied once. Cause progress is now updated.",
                  );
                }}
                type="button"
              >
                Simulate signed captured webhook
              </button>
              <button
                className="button button-secondary"
                onClick={() => {
                  applyDonationEvent(pendingId, {
                    id: `failed-${pendingId}`,
                    donationId: pendingId,
                    type: "PAYMENT_FAILED",
                    occurredAt: new Date().toISOString(),
                  });
                  setResult(
                    "Failed payment recorded. Cause progress and organization totals were not changed.",
                  );
                }}
                type="button"
              >
                Simulate failed payment
              </button>
            </div>
          ) : null}
          {pendingId && pendingDonation?.status === "CAPTURED" ? (
            <div className="payment-test-actions">
              <Link
                className="button button-secondary"
                href={`/donor/donations/${pendingDonation.id}`}
              >
                View donation detail
              </Link>
              <button
                className="button button-secondary"
                onClick={() => {
                  applyDonationEvent(pendingId, {
                    id: `capture-${pendingId}`,
                    donationId: pendingId,
                    type: "PAYMENT_CAPTURED",
                    occurredAt: new Date().toISOString(),
                  });
                  setResult(
                    "Duplicate webhook replay ignored. Cause progress did not increase twice.",
                  );
                }}
                type="button"
              >
                Replay same webhook
              </button>
              <button
                className="button button-secondary"
                onClick={() => {
                  applyDonationEvent(pendingId, {
                    id: `refund-${pendingId}`,
                    donationId: pendingId,
                    type: "REFUND_PROCESSED",
                    amountPaise: pendingDonation.amountPaise,
                    occurredAt: new Date().toISOString(),
                  });
                  setResult(
                    "Refund event applied. Cause progress and the accounting record were reduced together.",
                  );
                }}
                type="button"
              >
                Simulate full refund
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
