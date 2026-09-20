"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  contactRelationships,
  contactTopics,
  normalizeContactSubmission,
  type ContactSubmission,
} from "./contact-submission";
import styles from "./contact.module.css";

type FormValues = Omit<ContactSubmission, "consent"> & { consent: boolean };
type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyValues: FormValues = {
  fullName: "",
  email: "",
  relationship: "Organization",
  topic: "Organization onboarding",
  subject: "",
  message: "",
  consent: false,
  website: "",
};

function validate(values: FormValues): FormErrors {
  const result = contactSubmissionSchemaSafe(values);
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
}

function contactSubmissionSchemaSafe(values: FormValues) {
  try {
    return { success: true as const, data: normalizeContactSubmission(values) };
  } catch (error) {
    return { success: false as const, error: error as { issues: { path: (string | number)[]; message: string }[] } };
  }
}

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");

  function update<Field extends keyof FormValues>(field: Field, value: FormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status === "error") setStatus("idle");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus("error");
      setFormMessage("Check the highlighted fields before sending your message.");
      return;
    }

    setStatus("submitting");
    setFormMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as { referenceId?: string; message?: string };
      if (!response.ok) {
        setStatus("error");
        setFormMessage(body.message ?? "We could not receive your message. Try again in a moment.");
        return;
      }
      setReferenceId(body.referenceId ?? "");
      setStatus("success");
    } catch {
      setStatus("error");
      setFormMessage("We could not reach INSIPS. Check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <section aria-live="polite" className={styles.successPanel}>
        <span className={styles.successIcon} aria-hidden="true"><CheckCircle2 size={26} /></span>
        <p className="marketing-kicker">Message received</p>
        <h2>Message received and queued</h2>
        <p>We have your note. A support reply will come from <strong>info@insips.com</strong> within two business days.</p>
        <dl className={styles.reference}>
          <div><dt>Reference</dt><dd>{referenceId}</dd></div>
          <div><dt>Next</dt><dd>Your submission remains available to the support team even if delivery is delayed.</dd></div>
        </dl>
        <div className={styles.successActions}>
          <button className="button button-secondary" onClick={() => { setValues(emptyValues); setErrors({}); setReferenceId(""); setStatus("idle"); }} type="button"><RotateCcw size={16} /> Send another message</button>
          <Link className="button button-primary" href="/">Return home <ArrowRight size={16} /></Link>
          <Link className="text-action" href="/help">Open help <ArrowRight size={15} /></Link>
        </div>
      </section>
    );
  }

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <div className={styles.formHeader}>
        <div><p className="marketing-kicker">Write to INSIPS</p><h2>How can we help?</h2></div>
        <span className={styles.formMeta}>Usually replies within 2 business days</span>
      </div>
      {status === "error" && formMessage ? <div aria-live="assertive" className={styles.formAlert} role="alert"><AlertCircle size={17} /><span>{formMessage}</span></div> : null}
      <div className={styles.fieldGrid}>
        <Field error={errors.fullName} label="Full name" name="fullName"><input aria-invalid={Boolean(errors.fullName)} autoComplete="name" id="fullName" name="fullName" onChange={(event) => update("fullName", event.target.value)} value={values.fullName} /></Field>
        <Field error={errors.email} label="Email address" name="email"><input aria-invalid={Boolean(errors.email)} autoComplete="email" id="email" name="email" onChange={(event) => update("email", event.target.value)} type="email" value={values.email} /></Field>
        <Field label="Your relationship to INSIPS" name="relationship"><select id="relationship" name="relationship" onChange={(event) => update("relationship", event.target.value as FormValues["relationship"])} value={values.relationship}>{contactRelationships.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="What is this about?" name="topic"><select id="topic" name="topic" onChange={(event) => update("topic", event.target.value as FormValues["topic"])} value={values.topic}>{contactTopics.map((item) => <option key={item}>{item}</option>)}</select></Field>
      </div>
      <Field error={errors.subject} label="Subject" name="subject"><input aria-invalid={Boolean(errors.subject)} id="subject" name="subject" onChange={(event) => update("subject", event.target.value)} value={values.subject} /></Field>
      <Field error={errors.message} label="Message" name="message"><textarea aria-describedby="message-count" aria-invalid={Boolean(errors.message)} id="message" maxLength={3000} name="message" onChange={(event) => update("message", event.target.value)} rows={6} value={values.message} /></Field>
      <div className={styles.messageCount} id="message-count">{values.message.length}/3000 characters</div>
      <label className={styles.consent}><input checked={values.consent} onChange={(event) => update("consent", event.target.checked)} type="checkbox" /> <span>I agree that INSIPS may use this information to respond to my enquiry.</span></label>
      {errors.consent ? <p className={styles.fieldError}>{errors.consent}</p> : null}
      <label aria-hidden="true" className={styles.honeypot}>Website<input autoComplete="off" name="website" onChange={(event) => update("website", event.target.value)} tabIndex={-1} value={values.website} /></label>
      <div className={styles.formFooter}><p>Do not include passwords, payment secrets, or private evidence in this form.</p><button className="button button-primary" disabled={status === "submitting"} type="submit">{status === "submitting" ? <><LoaderCircle className={styles.spin} size={16} /> Sending…</> : <>Send message <ArrowRight size={16} /></>}</button></div>
    </form>
  );
}

function Field({ children, error, label, name }: { children: React.ReactNode; error?: string; label: string; name: string }) {
  return <label className={styles.field} htmlFor={name}><span>{label}</span>{children}{error ? <small className={styles.fieldError}>{error}</small> : null}</label>;
}
