"use client";

import type { PublicFeedPage } from "@insips/contracts";
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function PublicFeed({ page }: { page: PublicFeedPage }) {
  const list = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-feed-item]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActive(items.indexOf(visible.target as HTMLElement));
    }, { root, threshold: .7 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [page.items.length]);

  function move(direction: number) {
    const next = Math.min(Math.max(active + direction, 0), page.items.length - 1);
    list.current?.querySelector<HTMLElement>(`[data-feed-index="${next}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="public-feed-shell">
      <header className="feed-heading"><div><p className="section-kicker">Public updates</p><h1>A vertical record of work in motion.</h1><p>Updates, causes, events, and milestones with a source organization and a date. Media stays muted and stops when it leaves view.</p></div><div className="feed-heading-actions"><button className="button button-secondary" type="button" onClick={() => move(-1)} aria-label="Previous update"><ArrowLeft size={16} /> Previous</button><button className="button button-secondary" type="button" onClick={() => move(1)} aria-label="Next update">Next <ArrowRight size={16} /></button></div></header>
      <div className="public-feed" ref={list} tabIndex={0} aria-label="Public update feed">
        {page.items.map((post, index) => <article className="feed-item" data-feed-index={index} data-feed-item key={post.id}>
          <div className="feed-media">{post.media?.type === "VIDEO" ? <video muted={muted} controls playsInline poster={post.media.posterUrl} aria-label={post.media.alt}><source src={post.media.canonicalUrl} /></video> : post.media ? <Image src={post.media.canonicalUrl} alt={post.media.alt} width={post.media.width} height={post.media.height} unoptimized /> : <div className="feed-media-empty"><span>{post.kind}</span><strong>Public context first</strong></div>}</div>
          <div className="feed-copy"><p className="section-kicker">{post.kind} · {post.organizationName}</p><h2>{post.title}</h2><p>{post.body}</p><div className="feed-meta"><span>{post.publishedAt}</span><Link href={post.href}>Open organization <ArrowRight size={14} /></Link></div>{post.media?.type === "VIDEO" ? <button className="button button-ghost" type="button" onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />} {muted ? "Unmute" : "Mute"}</button> : null}</div>
        </article>)}
      </div>
      <div className="feed-progress" aria-live="polite">{active + 1} of {page.items.length}{page.nextCursor ? <button className="button button-secondary" type="button">Load more</button> : null}</div>
    </div>
  );
}
