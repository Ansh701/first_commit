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
import { FormEvent, useState } from "react";
import { getIdentityAdapter } from "@/lib/auth-adapter";
import {
  demoCauses,
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
  const { itemPledges, itemNeeds } = useProductDemo();
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
      </header>
      <div className="timeline-card-grid">
        {itemPledges.map((pledge) => {
          const need = itemNeeds.find((item) => item.id === pledge.needId);
          return (
            <article className="flow-panel" key={pledge.id}>
              <div className="flow-panel-head">
                <div>
                  <small>{need?.category}</small>
                  <h2>{need?.title}</h2>
                </div>
                <span className={`state-badge ${pledge.status.toLowerCase()}`}>
                  {pledge.status.replaceAll("_", " ")}
                </span>
              </div>
              <p>
                {pledge.quantity} items · {pledge.condition} ·{" "}
                {pledge.preference.toLowerCase()}
              </p>
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
            </article>
          );
        })}
      </div>
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
  const actions: Record<VolunteerStatus, VolunteerStatus[]> = {
    APPLIED: ["APPROVED", "REJECTED"],
    APPROVED: ["COMPLETED"],
    REJECTED: [],
    COMPLETED: [],
    WITHDRAWN: [],
  };
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
      ) : (
        <div className="opportunity-grid">
          {volunteerOpportunities.map((opportunity) => {
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
  const events = [
    {
      id: "event-health-orientation",
      title: "Community preventive-health orientation",
      organization: "Sahaara Health Network",
      date: "24 Oct 2026 · 10:00",
      location: "Bengaluru · synthetic venue",
      seats: 42,
    },
    {
      id: "event-reading-day",
      title: "Community reading day",
      organization: "Udaan Learning Foundation",
      date: "08 Nov 2026 · 09:30",
      location: "Pune · synthetic venue",
      seats: 65,
    },
  ];
  return (
    <main className="public-flow-page" id="main-content">
      <header>
        <span className="fixture-chip">Organization events</span>
        <h1>Register for a community event.</h1>
        <p>
          Every event below is fictional and exists only to demonstrate the
          registration flow.
        </p>
      </header>
      <div className="opportunity-grid">
        {events.map((event) => {
          const registered = eventRegistrations.includes(event.id);
          return (
            <article className="flow-panel" key={event.id}>
              <CalendarDays size={25} />
              <small>{event.organization}</small>
              <h2>{event.title}</h2>
              <p>{event.date}</p>
              <p>
                <MapPin size={15} /> {event.location}
              </p>
              <strong>{event.seats} test seats available</strong>
              <button
                className="button button-primary"
                disabled={registered}
                onClick={() => registerForEvent(event.id)}
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
          onClick={markNotificationsRead}
          type="button"
        >
          <Check size={16} /> Mark all read
        </button>
      </header>
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
              onClick={() => void action("delete")}
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

export function OrganizationAnalytics() {
  const { donations, itemNeeds, volunteerApplications } = useProductDemo();
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
        <button
          className="button button-secondary"
          onClick={() =>
            downloadCsv("insips-impact-export.csv", [
              ["Metric", "Value"],
              ["Donation records", donations.length],
              ["Item needs", itemNeeds.length],
              ["Volunteer applications", volunteerApplications.length],
            ])
          }
          type="button"
        >
          <Download size={16} /> Export impact CSV
        </button>
      </header>
      <div className="summary-stat-grid">
        <article>
          <strong>
            {donations.filter((item) => item.status === "CAPTURED").length}
          </strong>
          <span>captured donations</span>
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
          <strong>4</strong>
          <span>cause updates</span>
        </article>
      </div>
      <section className="flow-panel">
        <div className="flow-panel-head">
          <div>
            <small>Last six periods</small>
            <h2>Confirmed donation activity</h2>
          </div>
        </div>
        <div className="simple-chart tall">
          <i style={{ height: "34%" }} />
          <i style={{ height: "52%" }} />
          <i style={{ height: "47%" }} />
          <i style={{ height: "76%" }} />
          <i style={{ height: "66%" }} />
          <i style={{ height: "91%" }} />
        </div>
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
  if (page === "matching")
    return (
      <div className="flow-page">
        <header className="flow-page-heading">
          <div>
            <span className="fixture-chip">Corporate matching records</span>
            <h1>Matching pledges</h1>
            <p>
              Records represent corporate commitments, not captured donations.
              Cause progress changes only after confirmed payment events.
            </p>
          </div>
        </header>
        <section className="flow-panel">
          <div
            aria-label="Corporate matching pledges"
            className="responsive-table"
            role="region"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Match rule</th>
                  <th>Ceiling</th>
                  <th>Matched</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Learning kits 2026</td>
                  <td>1:1 employee match</td>
                  <td>₹2,00,000</td>
                  <td>₹74,500</td>
                  <td>
                    <span className="state-badge pending">PLEDGED</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  const visible =
    page === "shortlist"
      ? demoCauses.filter((cause) => corporateShortlist.includes(cause.id))
      : demoCauses;
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
    </div>
  );
}

export function AdminOverview() {
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
      <div className="summary-stat-grid">
        <article>
          <ClipboardCheck size={20} />
          <span>Pending cases</span>
          <strong>2</strong>
        </article>
        <article>
          <ShieldCheck size={20} />
          <span>Approved organizations</span>
          <strong>1</strong>
        </article>
        <article>
          <PackageCheck size={20} />
          <span>Item needs</span>
          <strong>2</strong>
        </article>
        <article>
          <BookOpen size={20} />
          <span>Audit events</span>
          <strong>8</strong>
        </article>
      </div>
    </div>
  );
}
