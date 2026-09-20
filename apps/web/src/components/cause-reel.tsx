"use client";

import type { PublicCause } from "@insips/contracts";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function CauseReel({ causes }: { causes: PublicCause[] }) {
  const reel = useRef<HTMLDivElement>(null);
  const move = (distance: number) => reel.current?.scrollBy({ left: distance, behavior: "smooth" });
  return (
    <section className="marketing-section cause-reel-section" aria-labelledby="cause-reel-title">
      <div className="reel-heading"><div><p className="marketing-kicker">Causes with a clear next step</p><h2 id="cause-reel-title">Give each contribution a clear next step.</h2></div><div className="reel-controls"><button className="icon-button" type="button" onClick={() => move(-360)} aria-label="Previous cause"><ChevronLeft size={17} /></button><button className="icon-button" type="button" onClick={() => move(360)} aria-label="Next cause"><ChevronRight size={17} /></button></div></div>
      <div className="cause-reel" ref={reel} tabIndex={0} aria-label="Featured causes">
        {causes.map((cause) => { const progress = Math.min(100, Math.round((cause.raisedPaise / cause.targetPaise) * 100)); return <article className="reel-cause" key={cause.id}>
          <div className="reel-cause-art" data-category={cause.category}>{cause.coverMedia ? <Image src={cause.coverMedia.canonicalUrl} alt={cause.coverMedia.alt} width={cause.coverMedia.width} height={cause.coverMedia.height} unoptimized /> : <span>{cause.category}</span>}</div>
          <div className="reel-cause-body"><p className="reel-cause-org">{cause.organizationName} · {cause.category}</p><h3>{cause.title}</h3><p>{cause.summary}</p><div className="reel-progress"><i style={{ width: `${progress}%` }} /></div><div className="reel-progress-copy"><strong>{money.format(cause.raisedPaise / 100)}</strong><span>of {money.format(cause.targetPaise / 100)} · ends {cause.endDate}</span></div><Link className="text-action" href={`/causes/${cause.slug}`}>View cause <ArrowRight size={15} /></Link></div>
        </article>; })}
      </div>
    </section>
  );
}
