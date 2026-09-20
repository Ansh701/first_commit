"use client";

import { useState } from "react";

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(58);
  return (
    <section className="marketing-section before-after-section" aria-labelledby="before-after-title">
      <div className="section-heading-centered"><p className="marketing-kicker">Clarity has a shape</p><h2 id="before-after-title">A listing becomes useful when its edges stay visible.</h2><p>Move the comparison or use the preset controls. The point is not polish. It is making claim, scope, date, and next action easy to understand.</p></div>
      <div className="before-after" style={{ "--comparison": `${position}%` } as React.CSSProperties}>
        <div className="comparison-panel comparison-before"><span>Unclear listing</span><h3>Registered</h3><p>No scope. No review date. No explanation of what was checked.</p></div>
        <div className="comparison-panel comparison-after"><span>INSIPS public profile</span><h3>Section 8 company</h3><p>Matched to submitted evidence. Reviewed 12 September 2026. Not a general guarantee.</p></div>
        <div className="comparison-divider" aria-hidden="true" />
      </div>
      <div className="comparison-controls"><button className="button button-secondary" type="button" onClick={() => setPosition(28)}>Show listing</button><label><span className="sr-only">Comparison position</span><input type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))} /></label><button className="button button-primary" type="button" onClick={() => setPosition(78)}>Show profile</button></div>
    </section>
  );
}
