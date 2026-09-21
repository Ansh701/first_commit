"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
import type { PublishedContentPage } from "@insips/contracts";
import { PublicShell } from "@/components/public-shell";
import { StatePanel } from "@/components/state-panel";
import styles from "./faq-experience.module.css";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function FaqExperience({ page }: { page: PublishedContentPage | null }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All questions");
  const categories = ["All questions", "Evidence and review", "Compass", "Privacy and access"];
  const visibleQuestions = useMemo(() => (page?.sections ?? []).filter((section, index) => {
    const matchesCategory = category === "All questions" || (category === "Compass" && index === 1) || (category === "Privacy and access" && index === 2) || (category === "Evidence and review" && index === 0);
    return matchesCategory && `${section.title} ${section.body}`.toLowerCase().includes(query.trim().toLowerCase());
  }), [category, page?.sections, query]);
  if (!page) return <StatePanel action={{ href: "/", label: "Return home" }} description="This page is not currently published." kind="empty" title="Content unavailable" />;

  return <PublicShell className="marketing-site"><main className={styles.route}>
    <section className={styles.hero}>
      <div><p className="marketing-kicker">{page.kicker}</p><h1>{page.title}</h1><p>{page.intro}</p></div>
      <div className={styles.searchPanel}><label htmlFor="faq-search">Search the FAQ</label><div className={styles.searchField}><Search size={18} /><input id="faq-search" onChange={(event) => setQuery(event.target.value)} placeholder="Search evidence, Compass, privacy..." type="search" value={query} />{query ? <button aria-label="Clear FAQ search" onClick={() => setQuery("")} type="button"><X size={16} /></button> : null}</div><span>Searches questions and answers.</span></div>
    </section>
    <section className={styles.directory} aria-labelledby="faq-directory-title">
      <div className={styles.directoryHeader}><div><p className="marketing-kicker">Find an answer</p><h2 id="faq-directory-title">Frequently asked, clearly answered.</h2></div><div className={styles.categoryList} aria-label="FAQ categories">{categories.map((item) => <button className={category === item ? styles.selected : ""} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div></div>
      <div className={styles.resultMeta} aria-live="polite">{visibleQuestions.length} {visibleQuestions.length === 1 ? "answer" : "answers"}{query ? ` for “${query}”` : ""}</div>
      {visibleQuestions.length ? <div className={styles.questions}>{visibleQuestions.map((section, index) => <details className={styles.question} id={slugify(section.title)} key={section.title} open={!query && index === 0}><summary><span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><strong>{section.title}</strong><ChevronDown size={18} /></summary><div className={styles.answer}><p>{section.body}</p><Link href={`/contact?topic=${encodeURIComponent(section.title)}`}>Still need help? Contact us <ArrowRight size={15} /></Link></div></details>)}</div> : <div className={styles.empty}><strong>No questions match that search.</strong><p>Try a shorter phrase or browse every category again.</p><button className="button button-secondary" onClick={() => { setQuery(""); setCategory("All questions"); }} type="button">Show all questions</button></div>}
    </section>
    <section className={styles.cta}><div><p className="marketing-kicker">Need a human answer?</p><h2>Bring the unanswered question with you.</h2></div><Link className="button button-accent button-large" href="/help">Open help <ArrowRight size={17} /></Link></section>
  </main></PublicShell>;
}
