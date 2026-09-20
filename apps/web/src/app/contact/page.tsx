import { StatePanel } from "@/components/state-panel";
import { PublicShell } from "@/components/public-shell";
import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { ContactForm } from "./contact-form";
import { contactTopics } from "./contact-submission";
import styles from "./contact.module.css";

export const metadata = { title: "Contact" };

export default async function Page() {
  const page = await getPublishedSiteContent("contact");
  if (!page) return <StatePanel action={{ href: "/", label: "Return home" }} description="This page is not currently published." kind="empty" title="Contact is unavailable" />;

  return (
    <PublicShell className="marketing-site">
      <div className={styles.page}>
        <header className={styles.hero}>
          <div><p className="marketing-kicker">{page.kicker}</p><h1>{page.title}</h1><p className={styles.heroIntro}>{page.intro}</p></div>
          <aside className={styles.responseNote}><strong>One clear reply path</strong><p>Choose the closest purpose so your message reaches the right team. Most replies arrive within two business days.</p></aside>
        </header>
        <div className={styles.contentGrid}>
          <section className={styles.paths} aria-labelledby="contact-paths-title">
            <h2 id="contact-paths-title">Choose a path</h2>
            <p className={styles.pathsIntro}>You do not need to send private evidence or payment details here. A short description is enough to get started.</p>
            <div className={styles.pathList}>
              {contactTopics.slice(0, 6).map((topic, index) => <div className={styles.path} key={topic}><strong>{topic}<span>0{index + 1}</span></strong><p>{pathDescription(topic)}</p></div>)}
            </div>
            <div className={styles.privacyNote}><strong>Keep sensitive details out of email</strong><p>Never include passwords, payment secrets, access tokens, or private documents. We will ask for a safe next step if needed.</p></div>
          </section>
          <section aria-labelledby="contact-form-title"><ContactForm /></section>
        </div>
      </div>
    </PublicShell>
  );
}

function pathDescription(topic: (typeof contactTopics)[number]) {
  const descriptions: Record<typeof topic, string> = {
    "Organization onboarding": "Profile setup, evidence readiness, or getting your team started.",
    "Donation support": "A contribution record, receipt, refund, or payment question.",
    "Corporate or CSR enquiry": "Discovery, shortlists, matching, or internal reporting.",
    "Verification or document review": "A review decision, source context, or requested change.",
    "Technical support": "A sign-in issue, broken page, or unexpected product behavior.",
    "Media enquiry": "Press, product context, or a request for approved public information.",
    "Security report": "A responsible disclosure about a possible security concern.",
    "General enquiry": "A question that does not fit one of the paths above.",
  };
  return descriptions[topic];
}
