"use client";

import type { OnboardingStep } from "@insips/contracts";
import { ArrowLeft, ArrowRight, Check, Circle, Clock3, FileCheck2, Globe2, ImagePlus, Info, MapPin, Phone, Save, ShieldCheck, Upload, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductDemo } from "@/components/product-demo-provider";
import styles from "./onboarding-experience.module.css";

const steps: { id: OnboardingStep; label: string; short: string }[] = [
  { id: "ACCOUNT", label: "Account and contact", short: "Account" },
  { id: "ORGANIZATION", label: "Organization profile", short: "Profile" },
  { id: "LOCATION", label: "Regions and causes", short: "Location" },
  { id: "MEDIA", label: "Logo and gallery", short: "Media" },
  { id: "DOCUMENTS", label: "Registration documents", short: "Documents" },
  { id: "SOCIAL", label: "Links and public contact", short: "Contact" },
  { id: "TEAM", label: "Team invitations", short: "Team" },
  { id: "PAYMENTS", label: "Payment readiness", short: "Readiness" },
  { id: "PREVIEW", label: "Public-profile preview", short: "Preview" },
  { id: "SUBMIT", label: "Submit for review", short: "Submit" },
];

const countryCodes = [
  { value: "91", label: "India (+91)" },
  { value: "1", label: "United States (+1)" },
  { value: "44", label: "United Kingdom (+44)" },
  { value: "61", label: "Australia (+61)" },
];

type FieldOptions = {
  hint?: string;
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
  type?: string;
  inputMode?: "email" | "numeric" | "tel" | "url" | "text";
  textarea?: boolean;
};

function normalizePhone(countryCode: string, phone: string) {
  const digits = phone.replace(/\D/g, "");
  const code = countryCode.replace(/\D/g, "");
  const nationalNumber = digits.startsWith(code) ? digits.slice(code.length) : digits;
  return nationalNumber ? `+${code}${nationalNumber}` : "";
}

export function OnboardingExperience() {
  const router = useRouter();
  const { onboarding, onboardingPercent, saveOnboardingStep, submitOnboarding, correctDocument, verificationDocuments, inviteTeamMember, teamInvites } = useProductDemo();
  const [activeIndex, setActiveIndex] = useState(Math.max(0, steps.findIndex((step) => step.id === onboarding.currentStep)));
  const [saveLabel, setSaveLabel] = useState("All changes saved");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lengths, setLengths] = useState<Record<string, number>>({});
  const [files, setFiles] = useState<Record<string, string[]>>({});
  const [teamEmail, setTeamEmail] = useState("");
  const [teamRole, setTeamRole] = useState("Organization member");
  const [teamMessage, setTeamMessage] = useState("");
  const values = onboarding.values;
  const active = steps[activeIndex];

  useEffect(() => {
    const nextIndex = steps.findIndex((step) => step.id === onboarding.currentStep);
    if (nextIndex >= 0) setActiveIndex(nextIndex);
  }, [onboarding.currentStep]);

  const activeKey = `${active.id}-${onboarding.updatedAt}`;
  const currentStepNumber = activeIndex + 1;

  function field(name: string, label: string, options: FieldOptions = {}) {
    const initial = values[name] ?? "";
    const error = fieldErrors[name];
    const length = lengths[name] ?? initial.length;
    const updateLength = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextLength = event.currentTarget.value.length;
      setLengths((current) => ({ ...current, [name]: nextLength }));
    };
    const control = options.textarea ? (
      <textarea key={activeKey} defaultValue={initial} name={name} rows={4} maxLength={options.maxLength} placeholder={options.placeholder} required={options.required} aria-invalid={Boolean(error)} onInput={updateLength} />
    ) : (
      <input key={activeKey} defaultValue={initial} name={name} type={options.type ?? "text"} inputMode={options.inputMode} maxLength={options.maxLength} placeholder={options.placeholder} required={options.required} aria-invalid={Boolean(error)} onInput={updateLength} />
    );
    return <label className={`${styles.field} ${error ? styles.fieldInvalid : ""}`} key={name}><span>{label}{options.required ? <b aria-hidden="true">*</b> : null}</span>{control}<small className={styles.fieldMeta}><span>{error ?? options.hint ?? " "}</span>{options.maxLength ? <span>{length}/{options.maxLength}</span> : null}</small></label>;
  }

  function selectField(name: string, label: string, options: { items: { value: string; label: string }[]; hint?: string; required?: boolean }) {
    const error = fieldErrors[name];
    return <label className={`${styles.field} ${error ? styles.fieldInvalid : ""}`} key={name}><span>{label}{options.required ? <b aria-hidden="true">*</b> : null}</span><select defaultValue={values[name] ?? options.items[0]?.value ?? ""} name={name} required={options.required} aria-invalid={Boolean(error)}>{options.items.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><small className={styles.fieldMeta}>{error ?? options.hint ?? " "}</small></label>;
  }

  function validate(form: HTMLFormElement) {
    const data = new FormData(form);
    const errors: Record<string, string> = {};
    const required = (name: string, message: string) => { if (!String(data.get(name) ?? "").trim()) errors[name] = message; };
    if (active.id === "ACCOUNT") {
      required("contactName", "Add a primary contact.");
      const email = String(data.get("contactEmail") ?? "");
      if (!/^\S+@\S+\.\S+$/.test(email)) errors.contactEmail = "Enter a valid contact email.";
      if (String(data.get("contactPhone") ?? "").replace(/\D/g, "").length < 7) errors.contactPhone = "Enter at least 7 digits.";
    }
    if (active.id === "ORGANIZATION") {
      required("organizationName", "Add the public organization name.");
      if (!/^[a-z0-9-]+$/.test(String(data.get("slug") ?? ""))) errors.slug = "Use lowercase letters, numbers, and hyphens.";
      if (String(data.get("mission") ?? "").trim().length < 20) errors.mission = "Add at least 20 characters so the mission has context.";
    }
    if (active.id === "LOCATION") {
      required("country", "Choose a country."); required("state", "Choose a state or region."); required("city", "Add a city.");
    }
    if (active.id === "SOCIAL") {
      const publicEmail = String(data.get("publicEmail") ?? "");
      if (publicEmail && !/^\S+@\S+\.\S+$/.test(publicEmail)) errors.publicEmail = "Enter a valid public email.";
      const website = String(data.get("website") ?? "");
      if (website && !/^https?:\/\//.test(website)) errors.website = "Use a full URL beginning with https://.";
    }
    if (active.id === "PAYMENTS") {
      const settlementEmail = String(data.get("settlementEmail") ?? "");
      if (!/^\S+@\S+\.\S+$/.test(settlementEmail)) errors.settlementEmail = "Enter a valid finance contact email.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function persist(form: HTMLFormElement, moveNext = false) {
    if (!validate(form)) {
      setSaveLabel("Fix the highlighted fields");
      return false;
    }
    const raw = Object.fromEntries(Array.from(new FormData(form).entries()).map(([key, value]) => [key, value instanceof File ? value.name : String(value)]));
    const nextValues = { ...raw };
    if (raw.phoneCountryCode && raw.contactPhone) nextValues.contactPhone = normalizePhone(raw.phoneCountryCode, raw.contactPhone);
    saveOnboardingStep(active.id, nextValues, steps[Math.min(activeIndex + (moveNext ? 1 : 0), steps.length - 1)].id);
    setFieldErrors({});
    setSaveLabel(`Saved ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`);
    if (moveNext && activeIndex < steps.length - 1) setActiveIndex((current) => current + 1);
    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persist(event.currentTarget, true);
  }

  function handleFiles(name: string, fileList: FileList | null) {
    const names = Array.from(fileList ?? []).map((file) => file.name);
    setFiles((current) => ({ ...current, [name]: names }));
  }

  function addTeamInvite() {
    if (!/^\S+@\S+\.\S+$/.test(teamEmail)) { setTeamMessage("Enter a valid teammate email before inviting."); return; }
    inviteTeamMember(teamEmail.trim().toLowerCase(), teamRole);
    setTeamEmail(""); setTeamMessage("Invitation saved and ready to send from the team workspace.");
  }

  const formContent = (() => {
    if (active.id === "ACCOUNT") return <div className={styles.formGrid}>{field("contactName", "Primary contact name", { required: true, placeholder: "Name of the person responsible for this profile" })}{field("contactEmail", "Contact email", { required: true, type: "email", inputMode: "email", placeholder: "name@organization.org" })}<div className={styles.phoneGroup}><label className={styles.field}><span>Country calling code<b aria-hidden="true">*</b></span><select defaultValue={values.phoneCountryCode ?? "91"} name="phoneCountryCode" aria-label="Country calling code">{countryCodes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{field("contactPhone", "Contact phone", { required: true, type: "tel", inputMode: "tel", placeholder: "98765 43210" })}</div></div>;
    if (active.id === "ORGANIZATION") return <div className={styles.formGrid}>{field("organizationName", "Organization name", { required: true, maxLength: 100, placeholder: "Public organization name" })}{field("slug", "Public profile slug", { required: true, maxLength: 70, hint: "Lowercase letters, numbers, and hyphens only.", placeholder: "your-organization" })}{field("organizationType", "Organization type", { required: true, placeholder: "Section 8 company, trust, society…" })}{field("mission", "Mission", { required: true, maxLength: 220, textarea: true, placeholder: "What dependable change does your organization work toward?" })}{field("description", "Description", { maxLength: 600, textarea: true, placeholder: "Add the context people need before they explore causes." })}</div>;
    if (active.id === "LOCATION") return <div className={styles.formGrid}>{selectField("country", "Country", { required: true, items: [{ value: "India", label: "India" }, { value: "United States", label: "United States" }, { value: "United Kingdom", label: "United Kingdom" }] })}{selectField("state", "State or region", { required: true, items: [{ value: "Maharashtra", label: "Maharashtra" }, { value: "Karnataka", label: "Karnataka" }, { value: "Delhi", label: "Delhi" }] })}{field("city", "City", { required: true, placeholder: "Pune" })}{field("address", "Registered address", { maxLength: 240, textarea: true, placeholder: "Registered office or public service address" })}{field("serviceRegions", "Service regions", { maxLength: 180, hint: "Separate regions with commas.", placeholder: "Pune, Satara" })}{field("causes", "Cause categories", { required: true, maxLength: 140, hint: "Separate categories with commas.", placeholder: "Education, Youth, Community learning" })}</div>;
    if (active.id === "SOCIAL") return <div className={styles.formGrid}>{field("website", "Website", { type: "url", inputMode: "url", placeholder: "https://organization.org" })}{field("publicEmail", "Public contact email", { type: "email", inputMode: "email", placeholder: "hello@organization.org" })}{field("linkedin", "LinkedIn", { type: "url", inputMode: "url", placeholder: "https://linkedin.com/company/…" })}{field("instagram", "Instagram", { type: "url", inputMode: "url", placeholder: "https://instagram.com/…" })}</div>;
    if (active.id === "MEDIA") return <div className={styles.uploadGrid}>{[{ name: "logo", label: "Organization logo", accept: "image/png,image/jpeg", multiple: false }, { name: "cover", label: "Cover image", accept: "image/png,image/jpeg", multiple: false }, { name: "gallery", label: "Gallery images", accept: "image/png,image/jpeg,video/mp4", multiple: true }].map((item) => <label className={styles.uploadCard} key={item.name}><span className={styles.uploadIcon}><ImagePlus size={21} /></span><strong>{item.label}</strong><small>PNG or JPG{item.multiple ? " · up to 6 files" : ""} · max 5 MB each</small><input accept={item.accept} multiple={item.multiple} name={item.name} type="file" onChange={(event) => handleFiles(item.name, event.target.files)} />{files[item.name]?.length ? <em>{files[item.name].join(", ")}</em> : <span className={styles.uploadAction}><Upload size={15} /> Choose file</span>}</label>)}</div>;
    if (active.id === "DOCUMENTS") return <div className={styles.documents}>{verificationDocuments.map((document) => <article className={styles.documentCard} key={document.id}><span className={styles.documentIcon}><FileCheck2 size={19} /></span><div><strong>{document.label}</strong><small>{document.status.replaceAll("_", " ").toLowerCase()}{document.expiresOn ? ` · expires ${document.expiresOn}` : ""}</small>{document.latestReason ? <p className={styles.rejectedReason}>{document.latestReason}</p> : null}</div>{document.status === "CHANGES_REQUESTED" ? <div className={styles.documentActions}><label className={styles.fileButton}><Upload size={15} /> Upload correction<input accept="application/pdf,image/png,image/jpeg" type="file" onChange={(event) => { handleFiles(document.id, event.target.files); correctDocument(document.id); }} /></label>{files[document.id]?.length ? <small>{files[document.id].join(", ")}</small> : null}</div> : <span className={styles.statusPill}>{document.status.replaceAll("_", " ")}</span>}</article>)}</div>;
    if (active.id === "TEAM") return <div className={styles.teamLayout}><div className={styles.teamIntro}><UsersRound size={24} /><div><h3>Invite people with bounded permissions</h3><p>Membership and tenant permissions stay separate from a person’s broad account role.</p></div></div><div className={styles.inviteForm}><label className={styles.field}><span>Teammate email</span><input type="email" value={teamEmail} onChange={(event) => setTeamEmail(event.target.value)} placeholder="colleague@organization.org" /></label><label className={styles.field}><span>Permission</span><select value={teamRole} onChange={(event) => setTeamRole(event.target.value)}><option>Organization member</option><option>Organization admin</option></select></label><button className="button button-secondary" onClick={addTeamInvite} type="button">Add invitation <ArrowRight size={16} /></button></div>{teamMessage ? <p className={styles.inlineMessage} role="status">{teamMessage}</p> : null}<div className={styles.inviteList}>{teamInvites.length ? teamInvites.map((invite) => <div key={`${invite.email}-${invite.role}`}><span>{invite.email}</span><small>{invite.role} · {invite.status}</small></div>) : <p>No invitations yet.</p>}</div></div>;
    if (active.id === "PAYMENTS") return <div className={styles.readiness}><div className={styles.readinessIcon}><ShieldCheck size={22} /></div><div><h3>Keep payment readiness explicit</h3><p>Connect settlement details only through the approved provider flow. This local workspace does not store payment credentials.</p></div>{field("settlementEmail", "Settlement contact email", { required: true, type: "email", inputMode: "email", placeholder: "finance@organization.org" })}<div className={styles.readinessChecklist}><span><Check size={14} /> Organization profile owner identified</span><span><Circle size={14} /> Provider account connection pending</span><span><Circle size={14} /> Payout review after approval</span></div></div>;
    if (active.id === "PREVIEW") return <div className={styles.preview}><div className={styles.previewCover} /><div className={styles.previewBody}><span className={styles.previewLogo}>{(values.organizationName ?? "OR").slice(0, 2).toUpperCase()}</span><small>Preview · not public until approved</small><h3>{values.organizationName || "Your organization name"}</h3><p>{values.mission || "Your mission will appear here after you add it."}</p><div className={styles.chips}>{(values.causes ?? "Education, Youth").split(",").map((cause) => <span key={cause}>{cause.trim()}</span>)}</div></div></div>;
    return <div className={styles.submitReview}><ShieldCheck size={31} /><h3>Review before sending</h3><p>Submitting creates a review snapshot. You can respond to requested changes and resubmit later without losing your saved profile.</p><dl><div><dt>Organization</dt><dd>{values.organizationName || "Not yet added"}</dd></div><div><dt>Evidence</dt><dd>{verificationDocuments.filter((document) => document.status === "APPROVED").length} approved · {verificationDocuments.filter((document) => document.status === "CHANGES_REQUESTED").length} needs attention</dd></div><div><dt>Profile completion</dt><dd>{onboardingPercent}%</dd></div></dl>{onboarding.status === "SUBMITTED" || onboarding.status === "APPROVED" ? <div className={styles.successPanel} role="status"><Check size={18} /><span>Organization profile submitted. Platform review can now begin.</span></div> : <button className="button button-primary" onClick={submitOnboarding} type="button">Submit organization for review <ArrowRight size={16} /></button>}</div>;
  })();

  return <div className={styles.page}>
    <header className={styles.heading}><div><span className={styles.kicker}>Autosaving local fixture</span><h1>Organization onboarding</h1><p>Build the organization profile in reviewable steps, keep evidence private, and see the public result before submission.</p></div><div className={styles.completion} aria-label={`${onboardingPercent}% complete`}><div><strong>{onboardingPercent}%</strong><span>Profile complete</span></div><div className={styles.progress}><i style={{ width: `${onboardingPercent}%` }} /></div><small>Resume anytime · last saved {new Date(onboarding.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small></div></header>
    {onboarding.status === "CHANGES_REQUESTED" ? <div className={styles.alert} role="status"><Info size={18} /><span><strong>Changes requested.</strong> Correct the highlighted evidence, save the step, and resubmit when ready.</span><a href="#onboarding-form">Review now <ArrowRight size={14} /></a></div> : null}
    <div className={styles.layout}>
      <aside className={styles.stepRail} aria-label="Onboarding progress"><div className={styles.stepRailHeader}><span>Progress</span><strong>{currentStepNumber} / {steps.length}</strong></div>{steps.map((step, index) => <button className={index === activeIndex ? styles.stepActive : ""} key={step.id} onClick={() => { setFieldErrors({}); setActiveIndex(index); }} type="button"><span>{onboarding.completedSteps.includes(step.id) ? <Check size={14} /> : <Circle size={10} />}</span><i>{String(index + 1).padStart(2, "0")}</i><strong>{step.label}</strong></button>)}</aside>
      <section className={styles.content} aria-labelledby="active-step-title"><label className={styles.mobileStepSelect}><span>Jump to step</span><select value={active.id} onChange={(event) => { setFieldErrors({}); setActiveIndex(steps.findIndex((step) => step.id === event.target.value)); }}>{steps.map((step) => <option key={step.id} value={step.id}>{step.short} · {step.label}</option>)}</select></label><div className={styles.stepSummary}><div><span>Step {currentStepNumber} of {steps.length}</span><h2 id="active-step-title">{active.label}</h2></div><span className={styles.savedState}><Clock3 size={14} /> {saveLabel}</span></div><form id="onboarding-form" key={activeKey} noValidate onSubmit={handleSubmit}><div className={styles.formIntro}><span className={styles.stepIcon}>{active.id === "LOCATION" ? <MapPin size={20} /> : active.id === "ACCOUNT" ? <Phone size={20} /> : active.id === "SOCIAL" ? <Globe2 size={20} /> : <ShieldCheck size={20} />}</span><div><strong>{active.short}</strong><p>{active.id === "DOCUMENTS" ? "Upload only documents you are authorized to share. They remain restricted until review." : active.id === "PREVIEW" ? "Check the approved-only public projection before submission." : "Changes stay in the local draft until you choose to submit for review."}</p></div></div>{Object.keys(fieldErrors).length ? <div className={styles.formError} role="alert"><Info size={16} /><span>Fix the highlighted fields before continuing.</span></div> : null}{formContent}<div className={styles.actions}><button className="button button-secondary" disabled={activeIndex === 0} onClick={() => { setFieldErrors({}); setActiveIndex((current) => Math.max(0, current - 1)); }} type="button"><ArrowLeft size={16} /> Previous</button><button className={styles.saveExit} onClick={(event) => { if (persist(event.currentTarget.form ?? document.createElement("form"))) router.push("/app"); }} type="button"><Save size={15} /> Save and exit</button>{active.id !== "SUBMIT" ? <button className="button button-primary" type="submit">Save and continue <ArrowRight size={16} /></button> : null}</div></form></section>
    </div>
  </div>;
}
