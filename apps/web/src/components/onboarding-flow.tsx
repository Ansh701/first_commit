"use client";

import type { OnboardingStep } from "@insips/contracts";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Clock3,
  FileCheck2,
  Save,
  ShieldCheck,
  Upload,
  UsersRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useProductDemo } from "./product-demo-provider";

const steps: { id: OnboardingStep; label: string; short: string }[] = [
  { id: "ACCOUNT", label: "Account and contact", short: "Account" },
  { id: "ORGANIZATION", label: "Organization profile", short: "Organization" },
  { id: "LOCATION", label: "Regions and causes", short: "Location" },
  { id: "MEDIA", label: "Logo and gallery", short: "Media" },
  { id: "DOCUMENTS", label: "Registration documents", short: "Documents" },
  { id: "SOCIAL", label: "Links and public contact", short: "Contact" },
  { id: "TEAM", label: "Team invitations", short: "Team" },
  { id: "PAYMENTS", label: "Payment readiness", short: "Payments" },
  { id: "PREVIEW", label: "Public-profile preview", short: "Preview" },
  { id: "SUBMIT", label: "Submit for review", short: "Submit" },
];

function textField(
  name: string,
  label: string,
  value: string,
  options?: { textarea?: boolean; hint?: string },
) {
  return (
    <label className="flow-field" key={name}>
      <span>{label}</span>
      {options?.textarea ? (
        <textarea defaultValue={value} name={name} rows={4} />
      ) : (
        <input defaultValue={value} name={name} />
      )}
      {options?.hint ? <small>{options.hint}</small> : null}
    </label>
  );
}

export function OrganizationOnboardingFlow() {
  const {
    onboarding,
    onboardingPercent,
    saveOnboardingStep,
    submitOnboarding,
    correctDocument,
    verificationDocuments,
  } = useProductDemo();
  const initialIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === onboarding.currentStep),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [saveLabel, setSaveLabel] = useState("All changes saved");
  const active = steps[activeIndex];
  const values = onboarding.values;

  useEffect(() => {
    const savedIndex = steps.findIndex(
      (step) => step.id === onboarding.currentStep,
    );
    if (savedIndex >= 0) setActiveIndex(savedIndex);
  }, [onboarding.currentStep]);

  const fields = useMemo(() => {
    if (active.id === "ACCOUNT") {
      return [
        textField(
          "contactName",
          "Primary contact name",
          values.contactName ?? "",
        ),
        textField("contactEmail", "Contact email", values.contactEmail ?? ""),
        textField("contactPhone", "Contact phone", values.contactPhone ?? ""),
      ];
    }
    if (active.id === "ORGANIZATION") {
      return [
        textField(
          "organizationName",
          "Organization name",
          values.organizationName ?? "",
        ),
        textField("slug", "Unique public slug", values.slug ?? "", {
          hint: "Lowercase letters, numbers, and hyphens only.",
        }),
        textField(
          "organizationType",
          "Organization type",
          values.organizationType ?? "",
        ),
        textField("mission", "Mission", values.mission ?? "", {
          textarea: true,
        }),
        textField("description", "Description", values.description ?? "", {
          textarea: true,
        }),
      ];
    }
    if (active.id === "LOCATION") {
      return [
        textField("address", "Registered address", values.address ?? "", {
          textarea: true,
        }),
        textField(
          "serviceRegions",
          "Service regions",
          values.serviceRegions ?? "",
          { hint: "Separate regions with commas." },
        ),
        textField("causes", "Cause categories", values.causes ?? ""),
      ];
    }
    if (active.id === "SOCIAL") {
      return [
        textField("website", "Website", values.website ?? ""),
        textField(
          "publicEmail",
          "Public contact email",
          values.publicEmail ?? "",
        ),
        textField("linkedin", "LinkedIn", values.linkedin ?? ""),
        textField("instagram", "Instagram", values.instagram ?? ""),
      ];
    }
    return [];
  }, [active.id, values]);

  function persist(form: HTMLFormElement, next = false) {
    const formData = new FormData(form);
    const nextValues = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value instanceof File ? value.name : String(value),
      ]),
    );
    const nextStep =
      steps[Math.min(activeIndex + Number(next), steps.length - 1)];
    saveOnboardingStep(active.id, nextValues, nextStep.id);
    setSaveLabel(
      `Saved ${new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    );
    if (next && activeIndex < steps.length - 1) setActiveIndex(activeIndex + 1);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persist(event.currentTarget, true);
  }

  return (
    <div className="flow-page onboarding-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Autosaving local fixture</span>
          <h1>Organization onboarding</h1>
          <p>
            Complete the profile, correct requested fields, preview the public
            result, and submit it for independent platform review.
          </p>
        </div>
        <div
          className="completion-card glass-progress"
          aria-label={`${onboardingPercent}% complete`}
        >
          <strong>{onboardingPercent}%</strong>
          <span>Profile complete</span>
          <div>
            <i style={{ width: `${onboardingPercent}%` }} />
          </div>
        </div>
      </header>

      {onboarding.status === "CHANGES_REQUESTED" ? (
        <div className="flow-alert warning" role="status">
          <ShieldCheck size={19} />
          <span>
            <strong>Changes requested.</strong> Correct the highlighted evidence
            and resubmit. Your saved profile remains available.
          </span>
        </div>
      ) : null}

      <div className="onboarding-layout">
        <nav className="step-navigation" aria-label="Onboarding steps">
          {steps.map((step, index) => {
            const complete = onboarding.completedSteps.includes(step.id);
            return (
              <button
                className={index === activeIndex ? "active" : ""}
                key={step.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <span>
                  {complete ? <Check size={15} /> : <Circle size={11} />}
                </span>
                <i>{String(index + 1).padStart(2, "0")}</i>
                <strong>{step.short}</strong>
              </button>
            );
          })}
        </nav>

        <section className="flow-panel onboarding-panel">
          <div className="flow-panel-head">
            <div>
              <small>
                Step {activeIndex + 1} of {steps.length}
              </small>
              <h2>{active.label}</h2>
            </div>
            <span className="autosave-state">
              <Clock3 size={14} /> {saveLabel}
            </span>
          </div>

          <form
            key={`${active.id}-${onboarding.updatedAt}`}
            onBlur={(event) => {
              if (event.currentTarget.contains(event.relatedTarget)) return;
              persist(event.currentTarget);
            }}
            onChange={() => setSaveLabel("Saving when you leave this section…")}
            onSubmit={submit}
          >
            {fields.length ? (
              <div className="flow-field-grid">{fields}</div>
            ) : null}

            {active.id === "MEDIA" ? (
              <div className="upload-grid">
                {["Organization logo", "Cover image", "Gallery images"].map(
                  (label, index) => (
                    <label className="upload-dropzone" key={label}>
                      <Upload size={22} />
                      <strong>{label}</strong>
                      <span>
                        PNG or JPG · synthetic assets only in this demo
                      </span>
                      <input
                        accept="image/png,image/jpeg"
                        multiple={index === 2}
                        name={`media-${index}`}
                        type="file"
                      />
                    </label>
                  ),
                )}
              </div>
            ) : null}

            {active.id === "DOCUMENTS" ? (
              <div className="document-checklist">
                {verificationDocuments.map((document) => (
                  <article key={document.id}>
                    <FileCheck2 size={20} />
                    <span>
                      <strong>{document.label}</strong>
                      <small>
                        {document.status.replaceAll("_", " ").toLowerCase()}
                        {document.expiresOn
                          ? ` · expires ${document.expiresOn}`
                          : ""}
                      </small>
                      {document.latestReason ? (
                        <p>{document.latestReason}</p>
                      ) : null}
                    </span>
                    {document.status === "CHANGES_REQUESTED" ? (
                      <button
                        className="button button-secondary button-small"
                        onClick={() => correctDocument(document.id)}
                        type="button"
                      >
                        Upload correction
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}

            {active.id === "TEAM" ? (
              <div className="embedded-step-card">
                <UsersRound size={28} />
                <h3>Invite teammates with bounded permissions</h3>
                <p>
                  Organization membership and tenant permissions are stored
                  separately from the user’s coarse account role.
                </p>
                <a className="button button-secondary" href="/app/team">
                  Manage team invitations
                </a>
              </div>
            ) : null}

            {active.id === "PAYMENTS" ? (
              <div className="payment-readiness-card">
                <div>
                  <span className="status-dot pending" />
                  <strong>Razorpay Route test account not linked</strong>
                  <p>
                    Donation checkout stays in test mode. Add linked-account
                    details only when provider credentials are configured.
                  </p>
                </div>
                <label className="flow-field">
                  <span>Settlement contact email</span>
                  <input
                    defaultValue={
                      values.settlementEmail ?? "finance@udaan.example"
                    }
                    name="settlementEmail"
                    type="email"
                  />
                </label>
              </div>
            ) : null}

            {active.id === "PREVIEW" ? (
              <div className="profile-preview-card">
                <span className="profile-preview-cover" />
                <div>
                  <span className="profile-preview-logo">UL</span>
                  <small>Preview · not public until approved</small>
                  <h3>{values.organizationName}</h3>
                  <p>{values.mission}</p>
                  <div className="chip-row">
                    {(values.causes ?? "Education, Youth")
                      .split(",")
                      .map((cause) => (
                        <span key={cause}>{cause.trim()}</span>
                      ))}
                  </div>
                </div>
              </div>
            ) : null}

            {active.id === "SUBMIT" ? (
              <div className="submit-review-card">
                <ShieldCheck size={32} />
                <h3>Ready for a human review?</h3>
                <p>
                  Submission locks a review snapshot. You can still respond to
                  requested changes and resubmit later.
                </p>
                <button
                  className="button button-primary"
                  onClick={submitOnboarding}
                  type="button"
                >
                  Submit organization for review
                </button>
              </div>
            ) : null}

            <div className="flow-form-actions">
              <button
                className="button button-secondary"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                type="button"
              >
                <ArrowLeft size={16} /> Back
              </button>
              {active.id !== "SUBMIT" ? (
                <button className="button button-primary" type="submit">
                  <Save size={16} /> Save and continue <ArrowRight size={16} />
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
