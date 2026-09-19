"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { StatusPill } from "@/components/status-pill";

export default function OrganizationProfilePage() {
  const { saveProfile } = useDemo();
  const [saved, setSaved] = useState(true);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProfile();
    setSaved(true);
  }

  return (
    <>
      <header className="page-heading">
        <div>
          <StatusPill tone="approved">Profile ready</StatusPill>
          <h1>Organization profile</h1>
          <p>
            These public details help people understand who you are before they
            assess individual trust indicators.
          </p>
        </div>
        <div className="page-actions">
          <span className="button button-ghost" role="status">
            {saved ? (
              <>
                <Check size={16} /> Saved
              </>
            ) : (
              "Unsaved changes"
            )}
          </span>
        </div>
      </header>
      <form
        className="panel"
        onSubmit={onSubmit}
        onChange={() => setSaved(false)}
      >
        <div className="panel-body">
          <section className="form-section" aria-labelledby="identity-section">
            <h2 id="identity-section">Identity</h2>
            <p>
              Use the name people should see publicly, while keeping the legal
              name exact.
            </p>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="legal-name">
                  Legal name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="legal-name"
                  name="legalName"
                  defaultValue="Udaan Learning Foundation"
                  required
                />
                <span className="field-hint">
                  Required · match your evidence
                </span>
              </div>
              <div className="field">
                <label htmlFor="display-name">
                  Display name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="display-name"
                  name="displayName"
                  defaultValue="Udaan Learning Foundation"
                  required
                />
              </div>
              <div className="field field-full">
                <label htmlFor="summary">
                  Public summary <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  maxLength={360}
                  defaultValue="Community-led learning centers helping first-generation students build foundational literacy and stay in school."
                  required
                />
                <span className="field-hint">
                  <span>40–360 characters</span>
                  <span>115 / 360</span>
                </span>
              </div>
            </div>
          </section>
          <section className="form-section" aria-labelledby="location-section">
            <h2 id="location-section">Location and focus</h2>
            <p>
              These fields support public discovery; they do not imply service
              coverage.
            </p>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="city">
                  City <span aria-hidden="true">*</span>
                </label>
                <input id="city" name="city" defaultValue="Pune" required />
              </div>
              <div className="field">
                <label htmlFor="state">
                  State <span aria-hidden="true">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  defaultValue="Maharashtra"
                  required
                >
                  <option>Maharashtra</option>
                  <option>Karnataka</option>
                  <option>Rajasthan</option>
                </select>
              </div>
              <div className="field field-full">
                <label htmlFor="focus">
                  Focus areas <span aria-hidden="true">*</span>
                </label>
                <input
                  id="focus"
                  name="focus"
                  defaultValue="Education, Youth, Community learning"
                  required
                />
                <span className="field-hint">
                  Separate up to six areas with commas.
                </span>
              </div>
            </div>
          </section>
          <section className="form-section" aria-labelledby="contact-section">
            <h2 id="contact-section">Contact visibility</h2>
            <p>
              The public email may be published. The operations phone remains
              confidential.
            </p>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="public-email">Public email</label>
                <input
                  id="public-email"
                  name="publicEmail"
                  type="email"
                  defaultValue="hello@example.org"
                />
              </div>
              <div className="field">
                <label htmlFor="phone">Private operations phone</label>
                <input
                  id="phone"
                  name="privatePhone"
                  type="tel"
                  defaultValue="+91 90000 00000"
                />
                <span className="field-hint">
                  Never included in the public projection.
                </span>
              </div>
            </div>
          </section>
        </div>
        <div className="panel-footer">
          <button className="button button-primary" type="submit">
            <Save size={16} /> Save profile
          </button>
        </div>
      </form>
    </>
  );
}
