"use client";

import type { ItemDonationStatus, VolunteerStatus } from "@insips/contracts";
import {
  Archive,
  ArchiveRestore,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  Download,
  HandHeart,
  Image as ImageIcon,
  MailPlus,
  MapPin,
  PackageCheck,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  TicketCheck,
  UserPlus,
  UsersRound,
  Video,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { getIdentityAdapter } from "@/lib/auth-adapter";
import {
  corporateMatchingCampaigns,
  demoCauses,
  demoEvents,
  organizationFeed,
  volunteerOpportunities,
} from "@/lib/platform-demo-data";
import { useProductDemo } from "./product-demo-provider";

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows
    .map((row) => row.map((cell) => JSON.stringify(String(cell))).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(paise / 100);
}

export function ItemNeedsDirectory() {
  const { itemNeeds, itemPledges, pledgeItem } = useProductDemo();
  const [activeNeed, setActiveNeed] = useState(itemNeeds[0]?.id ?? "");
  const [result, setResult] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = pledgeItem({
      needId: activeNeed,
      quantity: Number(data.get("quantity")),
      condition: String(data.get("condition")),
      notes: String(data.get("notes")),
      preference: String(data.get("preference")) as "PICKUP" | "DROPOFF",
    });
    setResult(`Pledge ${id} saved. The organization can now review it.`);
    event.currentTarget.reset();
  }

  return (
    <main className="public-flow-page" id="main-content">
      <header>
        <span className="fixture-chip">Item donations · quantity based</span>
        <h1>Give useful items without distorting monetary totals.</h1>
        <p>
          Every pledge has an independent status and received quantity. Item
          values are never added to fundraising totals.
        </p>
      </header>
      <div className="item-need-layout">
        <section className="item-need-grid">
          {itemNeeds.map((need) => {
            const percent = Math.min(
              100,
              Math.round(
                (need.receivedQuantity / need.requestedQuantity) * 100,
              ),
            );
            return (
              <article
                className={activeNeed === need.id ? "active" : ""}
                key={need.id}
              >
                <span className="need-icon">
                  <PackageCheck size={22} />
                </span>
                <small>{need.category}</small>
                <h2>{need.title}</h2>
                <p>{need.acceptedCondition}</p>
                <div className="progress-line">
                  <i style={{ width: `${percent}%` }} />
                </div>
                <strong>
                  {need.receivedQuantity} of {need.requestedQuantity} received
                </strong>
                <span>
                  {need.fulfilment} · by {need.deadline}
                </span>
                <button onClick={() => setActiveNeed(need.id)} type="button">
                  Pledge this item
                </button>
              </article>
            );
          })}
        </section>
        <aside className="flow-panel pledge-form-panel">
          <div className="flow-panel-head">
            <div>
              <small>Synthetic local pledge</small>
              <h2>Pledge an item</h2>
            </div>
            <HandHeart size={23} />
          </div>
          <form onSubmit={submit}>
            <label className="flow-field">
              <span>Quantity</span>
              <input min="1" name="quantity" required type="number" />
            </label>
            <label className="flow-field">
              <span>Condition</span>
              <select name="condition">
                <option>New</option>
                <option>Gently used</option>
                <option>Good working condition</option>
              </select>
            </label>
            <label className="flow-field">
              <span>Photo</span>
              <input accept="image/png,image/jpeg" name="image" type="file" />
              <small>Kept private between donor and organization.</small>
            </label>
            <label className="flow-field">
              <span>Notes</span>
              <textarea maxLength={300} name="notes" rows={3} />
            </label>
            <fieldset>
              <legend>Fulfilment preference</legend>
              <label>
                <input
                  defaultChecked
                  name="preference"
                  type="radio"
                  value="DROPOFF"
                />{" "}
                Drop off
              </label>
              <label>
                <input name="preference" type="radio" value="PICKUP" /> Request
                pickup
              </label>
            </fieldset>
            <button className="button button-primary button-full" type="submit">
              Submit item pledge
            </button>
          </form>
          {result ? (
            <div className="inline-result" role="status">
              {result}
            </div>
          ) : null}
          <p className="helper-copy">
            {itemPledges.length} synthetic pledge
            {itemPledges.length === 1 ? "" : "s"} currently in your history.
          </p>
        </aside>
      </div>
    </main>
  );
}

export function DonorItemHistory() {
  const { itemPledges, itemNeeds, transitionItemPledge } = useProductDemo();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notice, setNotice] = useState("");

  const visiblePledges = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return itemPledges.filter((pledge) => {
      const need = itemNeeds.find((item) => item.id === pledge.needId);
      const matchesQuery = normalizedQuery
        ? [need?.title, need?.category, pledge.condition, pledge.preference]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedQuery))
        : true;
      const matchesStatus =
        statusFilter === "ALL" || pledge.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [itemNeeds, itemPledges, query, statusFilter]);

  const totalQuantity = itemPledges.reduce(
    (total, pledge) => total + pledge.quantity,
    0,
  );
  const activePledges = itemPledges.filter(
    (pledge) => !["RECEIVED", "REJECTED", "CANCELLED"].includes(pledge.status),
  ).length;
  const receivedQuantity = itemPledges
    .filter((pledge) => pledge.status === "RECEIVED")
    .reduce((total, pledge) => total + pledge.quantity, 0);

  function cancelPledge(id: string) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Cancel this item pledge? The organization will no longer expect this quantity.",
      )
    ) {
      return;
    }
    transitionItemPledge(id, "CANCELLED");
    setNotice(
      "Pledge cancelled. The organization has been notified in this local fixture.",
    );
  }

  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Item donation history</span>
          <h1>Your item pledges</h1>
          <p>
            Follow acceptance, requested changes, scheduling, and receipt
            separately from money donations.
          </p>
        </div>
        <Link className="button button-primary" href="/items">
          Browse item needs
        </Link>
      </header>
      <section className="donor-items-summary" aria-label="Item pledge summary">
        <article>
          <small>Total pledged</small>
          <strong>{totalQuantity}</strong>
          <span>items across all pledges</span>
        </article>
        <article>
          <small>In progress</small>
          <strong>{activePledges}</strong>
          <span>pledges awaiting completion</span>
        </article>
        <article>
          <small>Received</small>
          <strong>{receivedQuantity}</strong>
          <span>items marked received</span>
        </article>
      </section>
      <section className="donor-items-toolbar" aria-label="Filter item pledges">
        <label>
          <span>Search pledges</span>
          <input
            aria-label="Search item pledges"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by item or category"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>Status</span>
          <select
            aria-label="Filter item pledges by status"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="ALL">All statuses</option>
            <option value="PLEDGED">Pledged</option>
            <option value="CHANGES_REQUESTED">Changes requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RECEIVED">Received</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <span className="donor-items-result-count" role="status">
          {visiblePledges.length} of {itemPledges.length} pledges
        </span>
      </section>
      {notice ? (
        <div className="inline-result" role="status">
          {notice}
        </div>
      ) : null}
      {visiblePledges.length > 0 ? (
        <div className="donor-items-list">
          {visiblePledges.map((pledge) => {
            const need = itemNeeds.find((item) => item.id === pledge.needId);
            const organization = demoCauses.find(
              (cause) => cause.organizationId === need?.organizationId,
            )?.organization;
            return (
              <article className="flow-panel donor-item-card" key={pledge.id}>
                <div className="flow-panel-head">
                  <div>
                    <small>{need?.category ?? "Item need"}</small>
                    <h2>{need?.title ?? "Item need unavailable"}</h2>
                    <p className="donor-item-organization">
                      {organization ?? "Verified organization"}
                    </p>
                  </div>
                  <span
                    className={`state-badge ${pledge.status.toLowerCase()}`}
                  >
                    {pledge.status.replaceAll("_", " ")}
                  </span>
                </div>
                <dl className="donor-item-details">
                  <div>
                    <dt>Quantity</dt>
                    <dd>{pledge.quantity} items</dd>
                  </div>
                  <div>
                    <dt>Condition</dt>
                    <dd>{pledge.condition}</dd>
                  </div>
                  <div>
                    <dt>Fulfilment</dt>
                    <dd>
                      {pledge.preference === "PICKUP"
                        ? "Pickup requested"
                        : "Drop-off"}
                    </dd>
                  </div>
                </dl>
                {pledge.notes ? (
                  <p className="donor-item-notes">
                    <strong>Your note</strong> {pledge.notes}
                  </p>
                ) : null}
                <div className="timeline-list">
                  {pledge.timeline.map((entry) => (
                    <div key={`${entry.label}-${entry.at}`}>
                      <span />
                      <p>
                        <strong>{entry.label}</strong>
                        <small>{entry.at}</small>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="donor-item-card-footer">
                  {need ? <Link href="/items">View this item need</Link> : null}
                  {[
                    "PLEDGED",
                    "CHANGES_REQUESTED",
                    "ACCEPTED",
                    "SCHEDULED",
                  ].includes(pledge.status) ? (
                    <button
                      className="text-button donor-item-cancel"
                      onClick={() => cancelPledge(pledge.id)}
                      type="button"
                    >
                      Cancel pledge
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="flow-panel donor-items-empty" role="status">
          <PackageCheck size={28} />
          <h2>No item pledges match these filters</h2>
          <p>
            Try another search or browse current item needs to find a practical
            way to contribute.
          </p>
          <div>
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery("");
                setStatusFilter("ALL");
              }}
              type="button"
            >
              Clear filters
            </button>
            <Link className="button button-primary" href="/items">
              Browse item needs
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export function OrganizationItemManagement() {
  const { itemNeeds, itemPledges, createItemNeed, transitionItemPledge } =
    useProductDemo();
  const [message, setMessage] = useState("");
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createItemNeed({
      title: String(data.get("title")),
      category: String(data.get("category")),
      requestedQuantity: Number(data.get("quantity")),
      acceptedCondition: String(data.get("condition")),
      deadline: String(data.get("deadline")),
      fulfilment: String(data.get("fulfilment")),
    });
    setMessage("Wish-list need published to the synthetic directory.");
    event.currentTarget.reset();
  }
  const actions: Record<ItemDonationStatus, ItemDonationStatus[]> = {
    PLEDGED: ["ACCEPTED", "CHANGES_REQUESTED", "REJECTED"],
    CHANGES_REQUESTED: [],
    ACCEPTED: ["SCHEDULED", "REJECTED"],
    REJECTED: [],
    SCHEDULED: ["RECEIVED"],
    RECEIVED: [],
    CANCELLED: [],
  };
  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Organization item donations</span>
          <h1>Wish lists and incoming pledges</h1>
          <p>
            Manage requested quantities, fulfilment details, and receipt states
            without adding items to monetary fundraising.
          </p>
        </div>
      </header>
      <div className="split-flow-grid">
        <section className="flow-panel">
          <div className="flow-panel-head">
            <div>
              <small>Create</small>
              <h2>New wish-list need</h2>
            </div>
            <Plus size={20} />
          </div>
          <form className="compact-form" onSubmit={create}>
            <label className="flow-field">
              <span>Item needed</span>
              <input name="title" required />
            </label>
            <label className="flow-field">
              <span>Category</span>
              <select name="category">
                <option>Food</option>
                <option>Clothes</option>
                <option>Books</option>
                <option>Medicine</option>
                <option>Equipment</option>
                <option>Custom</option>
              </select>
            </label>
            <label className="flow-field">
              <span>Requested quantity</span>
              <input min="1" name="quantity" required type="number" />
            </label>
            <label className="flow-field">
              <span>Accepted condition</span>
              <input name="condition" required />
            </label>
            <label className="flow-field">
              <span>Deadline</span>
              <input name="deadline" required type="date" />
            </label>
            <label className="flow-field">
              <span>Drop-off or pickup</span>
              <input name="fulfilment" required />
            </label>
            <button className="button button-primary" type="submit">
              Publish need
            </button>
          </form>
          {message ? (
            <div className="inline-result" role="status">
              {message}
            </div>
          ) : null}
        </section>
        <section className="flow-panel">
          <div className="flow-panel-head">
            <div>
              <small>{itemNeeds.length} open needs</small>
              <h2>Quantity progress</h2>
            </div>
          </div>
          {itemNeeds.map((need) => (
            <div className="need-progress-row" key={need.id}>
              <span>
                <strong>{need.title}</strong>
                <small>
                  {need.receivedQuantity} of {need.requestedQuantity} received
                </small>
              </span>
              <div>
                <i
                  style={{
                    width: `${Math.min(100, (need.receivedQuantity / need.requestedQuantity) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
      <section className="flow-panel">
        <div className="flow-panel-head">
          <div>
            <small>Human-managed lifecycle</small>
            <h2>Incoming pledges</h2>
          </div>
        </div>
        <div
          aria-label="Incoming item pledges"
          className="responsive-table"
          role="region"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Need</th>
                <th>Quantity</th>
                <th>Preference</th>
                <th>Status</th>
                <th>Next action</th>
              </tr>
            </thead>
            <tbody>
              {itemPledges.map((pledge) => (
                <tr key={pledge.id}>
                  <td>
                    <strong>
                      {
                        itemNeeds.find((need) => need.id === pledge.needId)
                          ?.title
                      }
                    </strong>
                    <small>{pledge.condition}</small>
                  </td>
                  <td>{pledge.quantity}</td>
                  <td>{pledge.preference}</td>
                  <td>
                    <span
                      className={`state-badge ${pledge.status.toLowerCase()}`}
                    >
                      {pledge.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>
                    <div className="inline-actions">
                      {actions[pledge.status].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            transitionItemPledge(pledge.id, status)
                          }
                          type="button"
                        >
                          {status.replaceAll("_", " ")}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function VolunteerDirectory({ manage = false }: { manage?: boolean }) {
  const { volunteerApplications, applyVolunteer, transitionVolunteer } =
    useProductDemo();
  const [opportunityQuery, setOpportunityQuery] = useState("");
  const [opportunityMode, setOpportunityMode] = useState("ALL");
  const actions: Record<VolunteerStatus, VolunteerStatus[]> = {
    APPLIED: ["APPROVED", "REJECTED"],
    APPROVED: ["COMPLETED"],
    REJECTED: [],
    COMPLETED: [],
    WITHDRAWN: [],
  };
  const visibleOpportunities = volunteerOpportunities.filter((opportunity) => {
    const query = opportunityQuery.trim().toLowerCase();
    const matchesQuery = query
      ? [
          opportunity.title,
          opportunity.organization,
          opportunity.location,
          opportunity.commitment,
        ].some((value) => value.toLowerCase().includes(query))
      : true;
    const matchesMode =
      opportunityMode === "ALL" ||
      opportunity.location
        .toLowerCase()
        .includes(opportunityMode.toLowerCase());
    return matchesQuery && matchesMode;
  });
  return (
    <div className={manage ? "flow-page" : "public-flow-page"}>
      {manage ? (
        <header className="flow-page-heading">
          <div>
            <span className="fixture-chip">Organization volunteers</span>
            <h1>Volunteer applications</h1>
            <p>
              Approve, reject, and complete volunteer participation with an
              explicit status trail.
            </p>
          </div>
        </header>
      ) : (
        <header>
          <span className="fixture-chip">
            Synthetic volunteer opportunities
          </span>
          <h1>Give time where a specific role is needed.</h1>
          <p>
            Applications are reviewed by the organization. Applying never
            implies acceptance.
          </p>
          <div className="volunteer-public-controls">
            <label>
              <span>Search opportunities</span>
              <input
                aria-label="Search volunteer opportunities"
                onChange={(event) => setOpportunityQuery(event.target.value)}
                placeholder="Role, organization, or place"
                type="search"
                value={opportunityQuery}
              />
            </label>
            <label>
              <span>Format</span>
              <select
                aria-label="Filter volunteer opportunities by format"
                onChange={(event) => setOpportunityMode(event.target.value)}
                value={opportunityMode}
              >
                <option value="ALL">All formats</option>
                <option value="in person">In person</option>
                <option value="remote">Remote</option>
              </select>
            </label>
          </div>
        </header>
      )}
      {manage ? (
        <section className="flow-panel">
          <div
            aria-label="Volunteer applications"
            className="responsive-table"
            role="region"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Applicant</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {volunteerApplications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.title}</td>
                    <td>Synthetic donor</td>
                    <td>
                      <span
                        className={`state-badge ${application.status.toLowerCase()}`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td>
                      <div className="inline-actions">
                        {actions[application.status].map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              transitionVolunteer(application.id, status)
                            }
                            type="button"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!volunteerApplications.length ? (
            <div className="empty-flow-state">
              <UsersRound size={25} />
              <strong>No applications yet</strong>
              <p>
                Applications from the public volunteer page will appear here.
              </p>
            </div>
          ) : null}
        </section>
      ) : visibleOpportunities.length ? (
        <div className="opportunity-grid">
          {visibleOpportunities.map((opportunity) => {
            const application = volunteerApplications.find(
              (item) => item.opportunityId === opportunity.id,
            );
            return (
              <article className="flow-panel" key={opportunity.id}>
                <HandHeart size={24} />
                <small>{opportunity.organization}</small>
                <h2>{opportunity.title}</h2>
                <p>
                  <MapPin size={15} /> {opportunity.location}
                </p>
                <p>
                  <CalendarDays size={15} /> {opportunity.commitment}
                </p>
                <strong>{opportunity.openSpots} open spots</strong>
                <button
                  className="button button-primary"
                  disabled={Boolean(application)}
                  onClick={() =>
                    applyVolunteer(opportunity.id, opportunity.title)
                  }
                  type="button"
                >
                  {application
                    ? `Application ${application.status.toLowerCase()}`
                    : "Apply to volunteer"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="flow-panel volunteer-empty-state" role="status">
          <HandHeart size={26} />
          <h2>No volunteer opportunities match</h2>
          <p>Try a broader search or switch back to all formats.</p>
          <button
            className="button button-secondary"
            onClick={() => {
              setOpportunityQuery("");
              setOpportunityMode("ALL");
            }}
            type="button"
          >
            Clear filters
          </button>
        </section>
      )}
    </div>
  );
}

export function ActivityFeed() {
  return (
    <main className="public-flow-page" id="main-content">
      <header>
        <span className="fixture-chip">
          Public activity · synthetic content
        </span>
        <h1>Updates from organizations and causes you can trace.</h1>
        <p>
          Photos, short videos, events, and cause updates appear without
          exposing private evidence or beneficiary identities.
        </p>
      </header>
      <div className="feed-grid">
        {organizationFeed.map((item, index) => (
          <article className="feed-card" key={item.id}>
            <div className={`feed-media feed-media-${index + 1}`}>
              {item.type === "Short video" ? (
                <Video size={28} />
              ) : item.type === "Event" ? (
                <CalendarDays size={28} />
              ) : (
                <ImageIcon size={28} />
              )}
              <span>{item.type}</span>
            </div>
            <div>
              <small>
                {item.organization} · {item.date}
              </small>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <Link href={item.type === "Event" ? "/events" : "/causes"}>
                View related activity
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export function EventDirectory() {
  const { eventRegistrations, registerForEvent } = useProductDemo();
  const [registrationMessage, setRegistrationMessage] = useState("");
  return (
    <main className="public-flow-page" id="main-content">
      <header className="events-route-header">
        <span className="fixture-chip">Organization events</span>
        <h1>Register for a community event.</h1>
        <p>
          Join a local gathering, orientation, or learning day hosted by an
          organization you can explore on INSIPS.
        </p>
      </header>
      {registrationMessage ? (
        <p className="events-route-status" role="status">
          <TicketCheck size={16} /> {registrationMessage}
        </p>
      ) : null}
      <div className="opportunity-grid events-route-grid">
        {demoEvents.map((event) => {
          const registered = eventRegistrations.includes(event.id);
          return (
            <article className="flow-panel events-route-card" key={event.id}>
              <div className="events-route-card-icon" aria-hidden="true">
                <CalendarDays size={22} />
              </div>
              <small>{event.organization}</small>
              <h2>{event.title}</h2>
              <div className="events-route-meta">
                <p>{event.date}</p>
                <p>
                  <MapPin size={15} /> {event.location}
                </p>
              </div>
              <strong>{event.seats} places available</strong>
              <button
                className="button button-primary"
                disabled={registered}
                onClick={() => {
                  registerForEvent(event.id);
                  setRegistrationMessage(
                    `Your place for ${event.title} is saved in the local demo.`,
                  );
                }}
                type="button"
              >
                {registered ? (
                  <>
                    <TicketCheck size={16} /> Registered
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}

export function TeamManagement() {
  const { teamInvites, inviteTeamMember } = useProductDemo();
  const [message, setMessage] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    inviteTeamMember(String(data.get("email")), String(data.get("role")));
    setMessage("Invitation saved to the local adapter.");
    event.currentTarget.reset();
  }
  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Tenant-scoped permissions</span>
          <h1>Team invitations and roles</h1>
          <p>
            Account roles are coarse. Organization-specific membership and
            permissions remain server-side records.
          </p>
        </div>
      </header>
      <div className="split-flow-grid">
        <section className="flow-panel">
          <div className="flow-panel-head">
            <div>
              <small>Invite</small>
              <h2>Add a teammate</h2>
            </div>
            <UserPlus size={21} />
          </div>
          <form className="compact-form" onSubmit={submit}>
            <label className="flow-field">
              <span>Email address</span>
              <input name="email" required type="email" />
            </label>
            <label className="flow-field">
              <span>Tenant role</span>
              <select name="role">
                <option>Organization member</option>
                <option>Organization admin</option>
              </select>
            </label>
            <button className="button button-primary" type="submit">
              <MailPlus size={16} /> Send invitation
            </button>
          </form>
          {message ? (
            <div className="inline-result" role="status">
              {message}
            </div>
          ) : null}
        </section>
        <section className="flow-panel">
          <div className="flow-panel-head">
            <div>
              <small>{teamInvites.length} people</small>
              <h2>Current team</h2>
            </div>
            <UsersRound size={21} />
          </div>
          {teamInvites.map((invite) => (
            <div className="team-row" key={`${invite.email}-${invite.role}`}>
              <span className="avatar">
                {invite.email.slice(0, 2).toUpperCase()}
              </span>
              <span>
                <strong>{invite.email}</strong>
                <small>{invite.role}</small>
              </span>
              <span className="state-badge approved">{invite.status}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export function NotificationCentre() {
  const { notifications, markNotificationsRead } = useProductDemo();
  const unread = notifications.filter((item) => !item.read).length;
  const [message, setMessage] = useState("");
  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Notification centre</span>
          <h1>
            {unread} unread notification{unread === 1 ? "" : "s"}
          </h1>
          <p>
            Actionable account, review, donation, and item updates in one place.
          </p>
        </div>
        <button
          className="button button-secondary"
          disabled={!unread}
          onClick={() => {
            markNotificationsRead();
            setMessage("All notifications are marked as read.");
          }}
          type="button"
        >
          <Check size={16} /> Mark all read
        </button>
      </header>
      {message ? (
        <p className="notification-status" role="status">
          {message}
        </p>
      ) : null}
      <section className="flow-panel notification-list">
        {notifications.map((notification) => (
          <article
            className={notification.read ? "read" : ""}
            key={notification.id}
          >
            <span>
              <Bell size={18} />
            </span>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.detail}</p>
            </div>
            {notification.read ? <small>Read</small> : <i />}
          </article>
        ))}
      </section>
    </div>
  );
}

export function AccountSettings() {
  const { accountArchived, archiveAccount, restoreAccount, resetProductDemo } =
    useProductDemo();
  const [message, setMessage] = useState("");
  async function action(kind: "refresh" | "logout" | "delete" | "restore") {
    const adapter = getIdentityAdapter();
    const result =
      kind === "refresh"
        ? await adapter.refreshSession()
        : kind === "logout"
          ? await adapter.logout()
          : kind === "restore"
            ? await adapter.restoreAccount()
            : await adapter.deleteAccount();
    if (kind === "delete") archiveAccount();
    if (kind === "restore") restoreAccount();
    setMessage(result.message);
  }
  function requestDeletion() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Archive this account now? You can restore it during the retention window.",
      )
    ) {
      return;
    }
    void action("delete");
  }
  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Account settings</span>
          <h1>Security and account lifecycle</h1>
          <p>
            Manage the current session and request recoverable account archival
            before permanent deletion.
          </p>
        </div>
      </header>
      {accountArchived ? (
        <div className="flow-alert warning">
          <Archive size={19} />
          <span>
            <strong>This local account is archived.</strong> It is signed out
            and excluded from normal activity. Restore it during the retention
            window.
          </span>
        </div>
      ) : null}
      <div className="settings-grid">
        <section className="flow-panel">
          <Settings size={23} />
          <h2>Profile settings</h2>
          <label className="flow-field">
            <span>Display name</span>
            <input defaultValue="Aarav Mehta" />
          </label>
          <label className="flow-field">
            <span>Email</span>
            <input defaultValue="aarav@example.test" disabled />
          </label>
          <button
            className="button button-primary"
            onClick={() =>
              setMessage("Profile settings saved in the local fixture.")
            }
            type="button"
          >
            Save settings
          </button>
        </section>
        <section className="flow-panel">
          <ShieldCheck size={23} />
          <h2>Session</h2>
          <p>
            Production sessions use short-lived access and refresh tokens. The
            API verifies identity independently.
          </p>
          <button
            className="button button-secondary"
            onClick={() => void action("refresh")}
            type="button"
          >
            <RefreshCw size={16} /> Refresh session
          </button>
          <button
            className="button button-secondary"
            onClick={() => void action("logout")}
            type="button"
          >
            Log out
          </button>
        </section>
        <section className="flow-panel danger-zone">
          <ArchiveRestore size={23} />
          <h2>Archive or delete</h2>
          <p>
            Archival is immediate and recoverable. Permanent deletion happens
            only after the documented retention period.
          </p>
          {accountArchived ? (
            <button
              className="button button-secondary"
              onClick={() => void action("restore")}
              type="button"
            >
              Restore account
            </button>
          ) : (
            <button
              className="button button-danger"
              onClick={requestDeletion}
              type="button"
            >
              Request account deletion
            </button>
          )}
          <button
            className="text-button"
            onClick={resetProductDemo}
            type="button"
          >
            Reset synthetic product data
          </button>
        </section>
      </div>
      {message ? (
        <div className="inline-result" role="status">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function CorporateMatchingWorkspace() {
  const [campaigns, setCampaigns] = useState(corporateMatchingCampaigns);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    matchRatio: "1:1",
    budgetRupees: "200000",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
  });
  const [eligibleCauseIds, setEligibleCauseIds] = useState<string[]>([
    "cause-learning-kits",
  ]);

  const totalBudgetPaise = campaigns.reduce(
    (total, campaign) => total + campaign.budgetPaise,
    0,
  );
  const totalPledgedPaise = campaigns.reduce(
    (total, campaign) => total + campaign.pledgedPaise,
    0,
  );
  const totalCapturedPaise = campaigns.reduce(
    (total, campaign) => total + campaign.capturedPaise,
    0,
  );

  function resetForm(options: { clearFeedback?: boolean } = {}) {
    setEditingId(null);
    setForm({
      name: "",
      matchRatio: "1:1",
      budgetRupees: "200000",
      startDate: "2026-10-01",
      endDate: "2026-12-31",
    });
    setEligibleCauseIds(["cause-learning-kits"]);
    setFormError("");
    if (options.clearFeedback !== false) setFormSuccess("");
  }

  function editCampaign(campaign: (typeof corporateMatchingCampaigns)[number]) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      matchRatio: campaign.matchRatio,
      budgetRupees: String(campaign.budgetPaise / 100),
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    });
    setEligibleCauseIds(campaign.eligibleCauseIds);
    setFormError("");
    setFormSuccess("");
  }

  function submitCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    const budgetRupees = Number(form.budgetRupees);
    if (!form.name.trim()) {
      setFormError("Add a campaign name before saving.");
      return;
    }
    if (!Number.isFinite(budgetRupees) || budgetRupees <= 0) {
      setFormError("Enter a budget greater than ₹0.");
      return;
    }
    if (form.endDate < form.startDate) {
      setFormError("The end date must be on or after the start date.");
      return;
    }
    if (!eligibleCauseIds.length) {
      setFormError("Select at least one eligible cause.");
      return;
    }
    const budgetPaise = Math.round(budgetRupees * 100);
    if (editingId) {
      setCampaigns((current) =>
        current.map((campaign) =>
          campaign.id === editingId
            ? {
                ...campaign,
                name: form.name.trim(),
                matchRatio: form.matchRatio,
                budgetPaise,
                startDate: form.startDate,
                endDate: form.endDate,
                eligibleCauseIds,
                history: [
                  ...campaign.history,
                  "Campaign details edited in the local workspace fixture.",
                ],
              }
            : campaign,
        ),
      );
      resetForm({ clearFeedback: false });
      setFormSuccess(
        "Campaign changes are saved in the local workspace fixture.",
      );
    } else {
      setCampaigns((current) => [
        ...current,
        {
          id: `matching-local-${Date.now()}`,
          name: form.name.trim(),
          matchRatio: form.matchRatio,
          budgetPaise,
          pledgedPaise: 0,
          capturedPaise: 0,
          startDate: form.startDate,
          endDate: form.endDate,
          eligibleCauseIds,
          status: "DRAFT",
          history: ["Campaign drafted in the local workspace fixture."],
        },
      ]);
      resetForm({ clearFeedback: false });
      setFormSuccess("Campaign draft created in the local workspace fixture.");
    }
  }

  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Corporate matching records</span>
          <h1>Matching pledges</h1>
          <p>
            Plan a matching campaign with explicit budget rules. These local
            records represent commitments, not captured donations.
          </p>
        </div>
      </header>
      <section
        aria-label="Matching campaign summary"
        className="matching-summary"
      >
        <div>
          <span>Campaign budget</span>
          <strong>{formatInr(totalBudgetPaise)}</strong>
        </div>
        <div>
          <span>Pledged</span>
          <strong>{formatInr(totalPledgedPaise)}</strong>
        </div>
        <div>
          <span>Captured</span>
          <strong>{formatInr(totalCapturedPaise)}</strong>
        </div>
        <div>
          <span>Remaining budget</span>
          <strong>
            {formatInr(Math.max(0, totalBudgetPaise - totalCapturedPaise))}
          </strong>
        </div>
      </section>
      <div className="matching-workbench">
        <section className="flow-panel matching-editor">
          <div className="matching-section-heading">
            <div>
              <span className="fixture-chip">Local campaign editor</span>
              <h2>
                {editingId ? "Edit campaign" : "Create a matching campaign"}
              </h2>
            </div>
            {editingId ? (
              <button
                className="button button-secondary"
                onClick={() => resetForm()}
                type="button"
              >
                New campaign
              </button>
            ) : null}
          </div>
          <p className="matching-helper">
            Define the commitment first. Payment capture remains a separate
            server-confirmed event and never changes from this form.
          </p>
          <form className="matching-form" onSubmit={submitCampaign}>
            <label>
              <span>Campaign name</span>
              <input
                aria-label="Campaign name"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                value={form.name}
              />
            </label>
            <div className="matching-form-grid">
              <label>
                <span>Budget in INR</span>
                <input
                  aria-label="Budget in INR"
                  inputMode="numeric"
                  min="1"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      budgetRupees: event.target.value,
                    }))
                  }
                  type="number"
                  value={form.budgetRupees}
                />
              </label>
              <label>
                <span>Match ratio</span>
                <select
                  aria-label="Match ratio"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      matchRatio: event.target.value,
                    }))
                  }
                  value={form.matchRatio}
                >
                  <option>1:1</option>
                  <option>2:1</option>
                  <option>1:2</option>
                </select>
              </label>
            </div>
            <div className="matching-form-grid">
              <label>
                <span>Start date</span>
                <input
                  aria-label="Start date"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                  type="date"
                  value={form.startDate}
                />
              </label>
              <label>
                <span>End date</span>
                <input
                  aria-label="End date"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))
                  }
                  type="date"
                  value={form.endDate}
                />
              </label>
            </div>
            <fieldset>
              <legend>Eligible causes</legend>
              <div className="matching-cause-options">
                {demoCauses.map((cause) => (
                  <label key={cause.id}>
                    <input
                      checked={eligibleCauseIds.includes(cause.id)}
                      onChange={() =>
                        setEligibleCauseIds((current) =>
                          current.includes(cause.id)
                            ? current.filter((id) => id !== cause.id)
                            : [...current, cause.id],
                        )
                      }
                      type="checkbox"
                    />
                    <span>{cause.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {formError ? (
              <p
                aria-live="assertive"
                className="matching-form-message error"
                role="alert"
              >
                {formError}
              </p>
            ) : null}
            {formSuccess ? (
              <p
                aria-live="polite"
                className="matching-form-message success"
                role="status"
              >
                {formSuccess}
              </p>
            ) : null}
            <div className="matching-form-actions">
              <button className="button button-primary" type="submit">
                {editingId ? "Save campaign" : "Create campaign"}
              </button>
              <button
                className="button button-secondary"
                onClick={() => resetForm()}
                type="button"
              >
                Clear form
              </button>
            </div>
          </form>
        </section>
        <section
          aria-label="Matching campaigns"
          className="matching-campaign-list"
        >
          <div className="matching-section-heading">
            <div>
              <span className="fixture-chip">Campaign history</span>
              <h2>Commitments in review</h2>
            </div>
            <span className="matching-count">
              {campaigns.length} record{campaigns.length === 1 ? "" : "s"}
            </span>
          </div>
          {campaigns.length ? (
            campaigns.map((campaign) => {
              const eligibleCauses = demoCauses.filter((cause) =>
                campaign.eligibleCauseIds.includes(cause.id),
              );
              return (
                <article className="matching-campaign" key={campaign.id}>
                  <header>
                    <div>
                      <h3>{campaign.name}</h3>
                      <p>
                        {campaign.matchRatio} match · {campaign.startDate} to{" "}
                        {campaign.endDate}
                      </p>
                    </div>
                    <span
                      className={`matching-status ${campaign.status.toLowerCase()}`}
                    >
                      {campaign.status}
                    </span>
                  </header>
                  <div className="matching-metrics">
                    <div>
                      <span>Budget</span>
                      <strong>{formatInr(campaign.budgetPaise)}</strong>
                    </div>
                    <div>
                      <span>Pledged</span>
                      <strong>{formatInr(campaign.pledgedPaise)}</strong>
                    </div>
                    <div>
                      <span>Captured</span>
                      <strong>{formatInr(campaign.capturedPaise)}</strong>
                    </div>
                    <div>
                      <span>Remaining</span>
                      <strong>
                        {formatInr(
                          Math.max(
                            0,
                            campaign.budgetPaise - campaign.capturedPaise,
                          ),
                        )}
                      </strong>
                    </div>
                  </div>
                  <div className="matching-cause-list">
                    <span>Eligible causes</span>
                    <div>
                      {eligibleCauses.map((cause) => (
                        <span key={cause.id}>{cause.category}</span>
                      ))}
                    </div>
                  </div>
                  <div className="matching-campaign-actions">
                    <button
                      className="button button-secondary"
                      onClick={() => editCampaign(campaign)}
                      type="button"
                    >
                      Edit campaign
                    </button>
                    <details>
                      <summary>View history</summary>
                      <ul>
                        {campaign.history.map((event) => (
                          <li key={event}>{event}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-flow-state">
              <strong>No matching campaigns yet</strong>
              <p>Create a campaign when your internal approval is ready.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function OrganizationAnalytics() {
  const { donations, itemNeeds, volunteerApplications, causes } =
    useProductDemo();
  const [range, setRange] = useState("365");
  const rangeStart =
    range === "all" ? null : Date.now() - Number(range) * 24 * 60 * 60 * 1000;
  const filteredDonations = donations.filter(
    (donation) =>
      rangeStart === null ||
      new Date(donation.createdAt).getTime() >= rangeStart,
  );
  const recognizedDonations = filteredDonations.filter(
    (donation) =>
      donation.status === "CAPTURED" ||
      donation.status === "PARTIALLY_REFUNDED",
  );
  const causeActivity = causes
    .map((cause) => {
      const amountPaise = recognizedDonations
        .filter((donation) => donation.causeId === cause.id)
        .reduce(
          (total, donation) =>
            total + Math.max(0, donation.amountPaise - donation.refundedPaise),
          0,
        );
      return { cause, amountPaise };
    })
    .filter((entry) => entry.amountPaise > 0);
  const maxCauseAmount = Math.max(
    ...causeActivity.map((entry) => entry.amountPaise),
    1,
  );
  const causeUpdateCount = causes.reduce(
    (total, cause) => total + cause.updateCount,
    0,
  );
  const formatRupees = (amountPaise: number) =>
    `₹${(amountPaise / 100).toLocaleString("en-IN")}`;
  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">
            Organization analytics · synthetic
          </span>
          <h1>Activity with explainable totals</h1>
          <p>
            Donation charts include confirmed money only. Item progress and
            volunteer activity remain separate measures.
          </p>
        </div>
        <div className="analytics-header-actions">
          <label className="analytics-range">
            <span>Date range</span>
            <select
              aria-label="Analytics date range"
              onChange={(event) => setRange(event.target.value)}
              value={range}
            >
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 12 months</option>
              <option value="all">All recorded</option>
            </select>
          </label>
          <button
            className="button button-secondary"
            onClick={() =>
              downloadCsv("insips-impact-export.csv", [
                ["Metric", "Value"],
                ["Donation records", filteredDonations.length],
                [
                  "Recognized donation amount",
                  recognizedDonations.reduce(
                    (total, donation) =>
                      total +
                      Math.max(
                        0,
                        donation.amountPaise - donation.refundedPaise,
                      ),
                    0,
                  ),
                ],
                ["Item needs", itemNeeds.length],
                ["Volunteer applications", volunteerApplications.length],
              ])
            }
            type="button"
          >
            <Download size={16} /> Export impact CSV
          </button>
        </div>
      </header>
      <div className="summary-stat-grid">
        <article>
          <strong>{recognizedDonations.length}</strong>
          <span>recognized donations</span>
        </article>
        <article>
          <strong>
            {itemNeeds.reduce(
              (total, need) => total + need.receivedQuantity,
              0,
            )}
          </strong>
          <span>items received</span>
        </article>
        <article>
          <strong>{volunteerApplications.length}</strong>
          <span>volunteer applications</span>
        </article>
        <article>
          <strong>{causeUpdateCount}</strong>
          <span>cause updates</span>
        </article>
      </div>
      <section className="flow-panel">
        <div className="flow-panel-head">
          <div>
            <small>{recognizedDonations.length} records in range</small>
            <h2>Donation activity by cause</h2>
          </div>
        </div>
        {causeActivity.length ? (
          <div
            aria-label="Donation activity by cause"
            className="analytics-bars"
            role="list"
          >
            {causeActivity.map(({ cause, amountPaise }) => (
              <div className="analytics-bar" key={cause.id} role="listitem">
                <div className="analytics-bar-copy">
                  <strong>{cause.title}</strong>
                  <span>{formatRupees(amountPaise)}</span>
                </div>
                <div className="analytics-bar-track">
                  <i
                    style={{
                      width: `${(amountPaise / maxCauseAmount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-flow-state">
            <strong>No recognized donations in this range</strong>
            <p>
              Choose a wider date range or return when a confirmed donation is
              recorded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export function CorporateWorkspace({
  page = "overview",
}: {
  page?: "overview" | "discover" | "shortlist" | "matching";
}) {
  const { corporateShortlist, toggleCorporateShortlist } = useProductDemo();
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverCategory, setDiscoverCategory] = useState("All focus areas");
  const [discoverSort, setDiscoverSort] = useState("relevance");
  const [shortlistQuery, setShortlistQuery] = useState("");
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [shortlistNotes, setShortlistNotes] = useState<Record<string, string>>(
    {},
  );
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  if (page === "matching") return <CorporateMatchingWorkspace />;
  const categories = [
    "All focus areas",
    ...Array.from(new Set(demoCauses.map((cause) => cause.category))),
  ];
  const discoveryResults = demoCauses
    .filter((cause) => {
      const query = discoverQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        [cause.title, cause.organization, cause.summary, cause.category].some(
          (value) => value.toLowerCase().includes(query),
        );
      const matchesCategory =
        discoverCategory === "All focus areas" ||
        cause.category === discoverCategory;
      return matchesQuery && matchesCategory;
    })
    .sort((left, right) => {
      if (discoverSort === "organization") {
        return left.organization.localeCompare(right.organization);
      }
      if (discoverSort === "ending") {
        return left.endDate.localeCompare(right.endDate);
      }
      return left.title.localeCompare(right.title);
    });
  const shortlistResults = demoCauses.filter((cause) => {
    if (!corporateShortlist.includes(cause.id)) return false;
    const query = shortlistQuery.trim().toLowerCase();
    return (
      !query ||
      [cause.title, cause.organization, cause.category].some((value) =>
        value.toLowerCase().includes(query),
      )
    );
  });
  const visible =
    page === "shortlist"
      ? shortlistResults
      : page === "discover"
        ? discoveryResults
        : demoCauses;
  const isOverview = page === "overview";
  const isShortlist = page === "shortlist";
  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Corporate impact workspace</span>
          <h1>
            {page === "shortlist"
              ? "Cause shortlist"
              : page === "discover"
                ? "Discover aligned causes"
                : "Corporate giving overview"}
          </h1>
          <p>
            Build a reviewable shortlist and record matching intent without
            changing public fundraising totals.
          </p>
        </div>
      </header>
      {page === "discover" ? (
        <>
          <section
            aria-label="Cause discovery filters"
            className="corporate-discovery-controls"
          >
            <label className="corporate-filter">
              <span>Search causes or organizations</span>
              <input
                aria-label="Search causes or organizations"
                onChange={(event) => setDiscoverQuery(event.target.value)}
                placeholder="Try education, water, or an organization"
                type="search"
                value={discoverQuery}
              />
            </label>
            <label className="corporate-filter">
              <span>Focus area</span>
              <select
                aria-label="Filter by focus area"
                onChange={(event) => setDiscoverCategory(event.target.value)}
                value={discoverCategory}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="corporate-filter">
              <span>Sort by</span>
              <select
                aria-label="Sort discovered causes"
                onChange={(event) => setDiscoverSort(event.target.value)}
                value={discoverSort}
              >
                <option value="relevance">Cause name</option>
                <option value="organization">Organization</option>
                <option value="ending">End date</option>
              </select>
            </label>
          </section>
          <div className="corporate-discovery-meta">
            <span>
              Showing <strong>{visible.length}</strong> of {demoCauses.length}{" "}
              seeded causes
            </span>
            <span>Shortlist decisions stay separate from public totals.</span>
          </div>
        </>
      ) : null}
      {isShortlist ? (
        <>
          <section
            aria-label="Shortlist summary"
            className="corporate-shortlist-summary"
          >
            <div>
              <strong>{corporateShortlist.length}</strong>
              <span>saved causes</span>
            </div>
            <div>
              <strong>{comparisonIds.length}</strong>
              <span>selected to compare</span>
            </div>
            <div>
              <strong>{corporateShortlist.length ? "Ready" : "Open"}</strong>
              <span>matching review</span>
            </div>
          </section>
          <section
            aria-label="Shortlist tools"
            className="corporate-shortlist-tools"
          >
            <label className="corporate-filter">
              <span>Search saved causes</span>
              <input
                aria-label="Search saved causes"
                onChange={(event) => setShortlistQuery(event.target.value)}
                placeholder="Search by cause or organization"
                type="search"
                value={shortlistQuery}
              />
            </label>
            <div className="corporate-shortlist-actions">
              <button
                className="button button-secondary"
                onClick={() =>
                  downloadCsv("insips-corporate-shortlist.csv", [
                    ["Cause", "Organization", "Focus area", "End date"],
                    ...shortlistResults.map((cause) => [
                      cause.title,
                      cause.organization,
                      cause.category,
                      cause.endDate,
                    ]),
                  ])
                }
                type="button"
              >
                Export shortlist
              </button>
              <Link
                className="button button-primary"
                href="/corporate/discover"
              >
                Discover more
              </Link>
            </div>
          </section>
        </>
      ) : null}
      {isOverview ? (
        <>
          <section className="corporate-overview-brief">
            <div
              className="corporate-stat-strip"
              aria-label="Corporate workspace summary"
            >
              <div className="corporate-stat">
                <strong>{corporateShortlist.length}</strong>
                <span>saved causes</span>
              </div>
              <div className="corporate-stat">
                <strong>{demoCauses.length}</strong>
                <span>aligned causes available</span>
              </div>
            </div>
            <div className="corporate-next-actions">
              <div>
                <small>Next actions</small>
                <h2>Turn discovery into a reviewable brief</h2>
                <p>
                  Save a focused shortlist, inspect the trust trail, then take
                  the matching decision to your internal team.
                </p>
              </div>
              <div className="corporate-overview-links">
                <Link href="/corporate/discover">Discover causes</Link>
                <Link href="/corporate/shortlist">Open shortlist</Link>
                <Link href="/how-trust-works">Review trust</Link>
              </div>
            </div>
          </section>
          <div className="corporate-section-heading">
            <span>Suggested causes</span>
            <Link href="/corporate/discover">Browse all causes</Link>
          </div>
        </>
      ) : null}
      {visible.length ? (
        <div className="cause-card-grid compact">
          {visible.map((cause) => (
            <article className="cause-card" key={cause.id}>
              <div className="cause-art" data-category={cause.category}>
                <span>{cause.category}</span>
              </div>
              <div>
                <small>{cause.organization}</small>
                <h2>{cause.title}</h2>
                <p>{cause.summary}</p>
                {isShortlist ? (
                  <div className="corporate-shortlist-detail">
                    <div className="corporate-shortlist-detail-row">
                      <span>Trust trail</span>
                      <Link href={`/causes/${cause.slug}`}>
                        Open cause evidence
                      </Link>
                    </div>
                    <div className="corporate-shortlist-detail-row">
                      <span>Review window</span>
                      <strong>Through {cause.endDate}</strong>
                    </div>
                    <div className="corporate-shortlist-note">
                      <span>Internal note</span>
                      <textarea
                        aria-label={`Internal note for ${cause.title}`}
                        onChange={(event) =>
                          setShortlistNotes((current) => ({
                            ...current,
                            [cause.id]: event.target.value,
                          }))
                        }
                        placeholder="Add a question or decision note for your team"
                        rows={3}
                        value={shortlistNotes[cause.id] ?? ""}
                      />
                      <span className="corporate-shortlist-note-actions">
                        <button
                          className="button button-secondary"
                          onClick={() => setSavedNoteId(cause.id)}
                          type="button"
                        >
                          Save note
                        </button>
                        {savedNoteId === cause.id ? (
                          <span
                            aria-live="polite"
                            className="corporate-note-status"
                            role="status"
                          >
                            Note saved to this local workspace.
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <label className="corporate-compare-control">
                      <input
                        checked={comparisonIds.includes(cause.id)}
                        onChange={() =>
                          setComparisonIds((current) =>
                            current.includes(cause.id)
                              ? current.filter((id) => id !== cause.id)
                              : [...current, cause.id],
                          )
                        }
                        type="checkbox"
                      />
                      <span>Include in comparison</span>
                    </label>
                  </div>
                ) : null}
                <button
                  className="button button-secondary"
                  onClick={() => toggleCorporateShortlist(cause.id)}
                  type="button"
                >
                  {corporateShortlist.includes(cause.id)
                    ? "Remove from shortlist"
                    : "Add to shortlist"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-flow-state">
          <strong>
            {isShortlist
              ? shortlistQuery
                ? "No saved causes match this search"
                : "Your shortlist is empty"
              : "No causes match these filters"}
          </strong>
          <p>
            {isShortlist
              ? shortlistQuery
                ? "Try a shorter search phrase or clear it to see every saved cause."
                : "Save a cause from discovery when your team is ready to review it."
              : "Try a broader focus area or a shorter search phrase."}
          </p>
          {isShortlist ? (
            shortlistQuery ? (
              <button
                className="button button-secondary"
                onClick={() => setShortlistQuery("")}
                type="button"
              >
                Clear search
              </button>
            ) : (
              <Link
                className="button button-primary"
                href="/corporate/discover"
              >
                Discover causes
              </Link>
            )
          ) : (
            <button
              className="button button-secondary"
              onClick={() => {
                setDiscoverQuery("");
                setDiscoverCategory("All focus areas");
                setDiscoverSort("relevance");
              }}
              type="button"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminOverview() {
  const {
    causes,
    donations,
    itemNeeds,
    notifications,
    reviewHistory,
    verificationDocuments,
  } = useProductDemo();
  const pendingDocuments = verificationDocuments.filter((document) =>
    ["PENDING", "CHANGES_REQUESTED"].includes(document.status),
  ).length;
  const paymentExceptions = donations.filter(
    (donation) =>
      ["PENDING", "FAILED"].includes(donation.status) ||
      donation.transferStatus === "FAILED",
  ).length;
  const unreadNotifications = notifications.filter((item) => !item.read).length;
  const approvedOrganizations = new Set(
    causes.map((cause) => cause.organizationId),
  ).size;
  const attentionCount =
    pendingDocuments + paymentExceptions + unreadNotifications;

  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">
            Platform admin · synthetic operations
          </span>
          <h1>Human decisions and financial oversight</h1>
          <p>
            Review organizations, inspect the donation ledger, and keep all
            high-impact actions attributed to an administrator.
          </p>
        </div>
        <Link className="button button-primary" href="/admin/organizations">
          Open verification queue
        </Link>
      </header>
      <div className="summary-stat-grid admin-overview-kpis">
        <article>
          <ClipboardCheck size={20} />
          <span>Pending cases</span>
          <strong>{pendingDocuments}</strong>
        </article>
        <article>
          <ShieldCheck size={20} />
          <span>Approved organizations</span>
          <strong>{approvedOrganizations}</strong>
        </article>
        <article>
          <PackageCheck size={20} />
          <span>Item needs</span>
          <strong>{itemNeeds.length}</strong>
        </article>
        <article>
          <BookOpen size={20} />
          <span>Audit events</span>
          <strong>{reviewHistory.length}</strong>
        </article>
      </div>
      <section className="admin-overview-grid">
        <div className="flow-panel admin-attention-panel">
          <div className="flow-panel-head">
            <div>
              <small>Needs attention</small>
              <h2>{attentionCount} open operational signals</h2>
            </div>
            <ClipboardCheck size={21} />
          </div>
          <div className="admin-attention-list">
            <Link href="/admin/organizations">
              <span>
                <strong>{pendingDocuments} evidence cases</strong>
                <small>Documents awaiting a human decision</small>
              </span>
              <span>Review queue →</span>
            </Link>
            <Link href="/admin/donations">
              <span>
                <strong>{paymentExceptions} payment exceptions</strong>
                <small>Pending or failed money movement records</small>
              </span>
              <span>Open ledger →</span>
            </Link>
            <a href="#admin-activity">
              <span>
                <strong>{unreadNotifications} unread alerts</strong>
                <small>Recent events that may need administrator review</small>
              </span>
              <span>View activity →</span>
            </a>
          </div>
        </div>
        <div className="flow-panel admin-decision-panel">
          <div className="flow-panel-head">
            <div>
              <small>Decision ledger</small>
              <h2>Recent review history</h2>
            </div>
            <Link href="/admin/organizations">All reviews</Link>
          </div>
          {reviewHistory.length ? (
            <div className="admin-review-list">
              {reviewHistory.slice(0, 4).map((entry) => (
                <div key={entry.id}>
                  <strong>{entry.action}</strong>
                  <small>
                    {entry.actor} · {entry.at}
                  </small>
                  {entry.reason ? <p>{entry.reason}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-empty-copy">
              No review decisions recorded yet.
            </p>
          )}
        </div>
      </section>
      <section className="flow-panel admin-activity-panel" id="admin-activity">
        <div className="flow-panel-head">
          <div>
            <small>Recent activity</small>
            <h2>Keep consequential work attributable</h2>
          </div>
          <span className="state-badge approved">Human reviewed</span>
        </div>
        <div className="admin-activity-list">
          {notifications.length ? (
            notifications.map((notification) => (
              <div key={notification.id}>
                <Bell size={17} />
                <span>
                  <strong>{notification.title}</strong>
                  <small>{notification.detail}</small>
                </span>
                <em>{notification.read ? "Read" : "Unread"}</em>
              </div>
            ))
          ) : (
            <p className="admin-empty-copy">No recent platform activity.</p>
          )}
        </div>
      </section>
    </div>
  );
}
