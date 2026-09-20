"use client";

import type { PublicMedia } from "@insips/contracts";
import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ScreenshotStack({ media }: { media: PublicMedia[] }) {
  const [selected, setSelected] = useState<PublicMedia | null>(null);
  const items = media.slice(0, 3);
  return (
    <section className="marketing-section screenshot-section" aria-labelledby="screenshots-title">
      <div className="section-heading-split"><div><p className="marketing-kicker">Real product surfaces</p><h2 id="screenshots-title">The trail stays visible in the workspace.</h2></div><p>Product screenshots show the people, sources, and decisions that sit behind a public indicator. No fake analytics. No decorative dashboard walls.</p></div>
      <div className="screenshot-stack">{items.map((item, index) => <button className={`screenshot-card screenshot-card-${index + 1}`} type="button" key={item.id} onClick={() => setSelected(item)}><Image src={item.canonicalUrl} alt={item.alt} width={item.width} height={item.height} unoptimized /><span><Maximize2 size={15} /> Open screenshot</span></button>)}</div>
      {selected ? <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={selected.title}><button className="icon-button" type="button" onClick={() => setSelected(null)} aria-label="Close screenshot"><X size={18} /></button><Image src={selected.canonicalUrl} alt={selected.alt} width={selected.width} height={selected.height} unoptimized /></div> : null}
    </section>
  );
}
