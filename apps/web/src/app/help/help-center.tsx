"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { PublishedContentPage } from "@insips/contracts";
import styles from "./help-center.module.css";

export function HelpCenter({ page }: { page: PublishedContentPage }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All help");
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const categories = useMemo(
    () => ["All help", ...Array.from(new Set(page.sections.map((section) => section.category).filter((value): value is string => Boolean(value))))],
    [page.sections],
  );
  const guides = useMemo(() => {
    return page.sections.filter((section) => {
      const matchesCategory = category === "All help" || section.category === category;
      const searchable = `${section.title} ${section.body} ${section.category ?? ""}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, normalizedQuery, page.sections]);

  function updateQuery(value: string) {
    setQuery(value);
    setCategory("All help");
    setOpenGuide(null);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="help-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{page.kicker}</p>
          <h1 id="help-title">{page.title}</h1>
          <p className={styles.intro}>{page.intro}</p>
        </div>
        <aside className={styles.heroAside}>
          <span className={styles.iconTile} aria-hidden="true"><CircleHelp size={22} /></span>
          <p className={styles.eyebrow}>Start with the next safe step</p>
          <h2>Search the guide, then keep your work moving.</h2>
          <p>Help explains what is visible, what stays private, and when a person needs to step in.</p>
        </aside>
      </section>

      <section className={styles.searchPanel} aria-label="Help search">
        <div className={styles.searchHeading}>
          <div>
            <p className={styles.eyebrow}>Find an answer</p>
            <h2>What are you trying to do?</h2>
          </div>
          <span className={styles.resultCount} aria-live="polite">{guides.length} {guides.length === 1 ? "guide" : "guides"}</span>
        </div>
        <label className={styles.searchField} htmlFor="help-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search help</span>
          <input
            id="help-search"
            type="search"
            aria-label="Search help"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search account, evidence, donations, or teams"
            autoComplete="off"
          />
          <kbd>/</kbd>
        </label>
      </section>

      <section className={styles.quickStart} aria-labelledby="popular-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Popular tasks</p>
            <h2 id="popular-title">A few useful places to begin</h2>
          </div>
          <BookOpen size={22} aria-hidden="true" />
        </div>
        <div className={styles.taskLinks}>
          {page.sections.slice(0, 3).map((section) => (
            <button className={styles.taskLink} key={section.title} type="button" onClick={() => { setQuery(""); setCategory(section.category ?? "All help"); setOpenGuide(section.title); document.getElementById(`guide-${slugify(section.title)}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
              <span>{section.title}</span><ArrowRight size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.categoryRail} aria-label="Help categories">
          <p className={styles.eyebrow}>Browse by topic</p>
          <nav className={styles.categoryList}>
            {categories.map((item) => (
              <button className={`${styles.categoryButton} ${category === item ? styles.categoryButtonActive : ""}`} key={item} type="button" aria-pressed={category === item} onClick={() => { setCategory(item); setQuery(""); setOpenGuide(null); }}>
                <span>{item}</span><span className={styles.categoryCount}>{item === "All help" ? page.sections.length : page.sections.filter((section) => section.category === item).length}</span>
              </button>
            ))}
          </nav>
          <div className={styles.humanHelp}>
            <p className={styles.eyebrow}>Still stuck?</p>
            <p>Share the context without including private documents or payment secrets.</p>
            <Link className="text-action" href="/contact">Contact support <ArrowRight size={15} /></Link>
          </div>
        </aside>

        <section className={styles.guides} aria-labelledby="guides-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Guides and troubleshooting</p>
              <h2 id="guides-title">Clear answers, one decision at a time.</h2>
            </div>
            <span className={styles.activeFilter}>{category}</span>
          </div>
          {guides.length ? (
            <div className={styles.guideList}>
              {guides.map((section, index) => {
                const id = `guide-${slugify(section.title)}`;
                const isOpen = openGuide === section.title;
                return (
                  <article className={`${styles.guide} ${isOpen ? styles.guideOpen : ""}`} id={id} key={section.title}>
                    <button className={styles.guideTrigger} type="button" aria-label={section.title} aria-expanded={isOpen} aria-controls={`${id}-content`} onClick={() => setOpenGuide(isOpen ? null : section.title)}>
                      <span className={styles.guideIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.guideTitle}><span className={styles.guideCategory}>{section.category ?? "Guide"}</span>{section.title}</span>
                      <ChevronDown className={styles.chevron} size={19} aria-hidden="true" />
                    </button>
                    <div className={styles.guideContent} id={`${id}-content`} hidden={!isOpen}>
                      <p>{section.body}</p>
                      {section.points?.length ? <ul>{section.points.map((point) => <li key={point}><Check size={15} aria-hidden="true" />{point}</li>)}</ul> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.noResults} role="status">
              <span className={styles.noResultsIcon} aria-hidden="true"><Search size={20} /></span>
              <h3>No guides match that search.</h3>
              <p>Try a shorter phrase, choose a category, or ask the support team for context-specific help.</p>
              <div className={styles.noResultsActions}>
                <button className="button button-quiet" type="button" onClick={() => updateQuery("")}>Clear search</button>
                <Link className="button button-accent" href="/contact">Contact support <ArrowRight size={16} /></Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className={styles.boundary} aria-label="Help boundaries">
        <div><p className={styles.eyebrow}>Keep sensitive context private</p><h2>Support can help with the workflow without needing your evidence.</h2></div>
        <p>Never paste passwords, one-time codes, payment secrets, reviewer notes, or private documents into a public help request.</p>
      </section>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
