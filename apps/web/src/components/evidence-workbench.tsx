"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleUserRound,
  FileSearch,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const stages = [
  { label: "Upload privately", icon: LockKeyhole },
  { label: "Safety check", icon: ShieldCheck },
  { label: "Read the evidence", icon: FileSearch },
  { label: "Review suggestions", icon: Sparkles },
  { label: "Human decision", icon: CircleUserRound },
  { label: "Publish approved facts", icon: BadgeCheck },
] as const;

export function EvidenceWorkbench() {
  const [activeStage, setActiveStage] = useState(3);
  const reduceMotion = useReducedMotion();

  return (
    <section className="workbench" aria-labelledby="workbench-title">
      <div className="workbench-intro">
        <div>
          <p className="eyebrow">Evidence to public</p>
          <h2 id="workbench-title">A trust trail you can actually follow.</h2>
          <p>
            Each stage has an owner, a source context, and a visible decision.
            Private evidence stays private while the review path stays clear.
          </p>
        </div>
        <span className="workbench-mode"><i /> Human-led workflow</span>
      </div>
      <div className="workbench-layout">
        <div className="workbench-steps" role="tablist" aria-label="Evidence to public workflow">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const selected = activeStage === index;
            return (
              <button
                aria-label={stage.label}
                aria-selected={selected}
                className={`workbench-step ${selected ? "active" : ""}`}
                key={stage.label}
                onClick={() => setActiveStage(index)}
                role="tab"
                type="button"
              >
                <span className="workbench-step-icon">
                  {index < activeStage ? <Check size={15} /> : <Icon size={16} />}
                </span>
                <span>
                  <small>0{index + 1}</small>
                  <strong>{stage.label}</strong>
                </span>
              </button>
            );
          })}
        </div>
        <motion.div
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="workbench-stage"
          initial={false}
          key={activeStage}
          role="tabpanel"
          transition={{ duration: 0.18 }}
        >
          <div className="workbench-stage-header">
            <div>
              <span className="stage-kicker">Current stage · 0{activeStage + 1}</span>
              <h3>{stages[activeStage].label}</h3>
            </div>
            <span className="status-chip status-chip-warning">Needs a person</span>
          </div>
          <div className="workbench-record">
            <div className="source-record">
              <span className="record-label"><FileSearch size={15} /> Source context</span>
              <span className="document-sheet">
                <small>Synthetic evidence · page 1</small>
                <strong>Form CSR-1 registration</strong>
                <span>Udaan Learning Foundation</span>
                <mark>CSR00018427</mark>
                <i /><i /><i className="short" />
              </span>
            </div>
            <div className="candidate-record">
              <span className="record-label"><Sparkles size={15} /> Compass candidate fields</span>
              <div className="candidate-value">
                <span>
                  <strong>CSR-1 registration</strong>
                  <small>High source match · page 1</small>
                </span>
                <span className="candidate-check"><Check size={15} /></span>
              </div>
              <div className="candidate-value muted">
                <span>
                  <strong>Registered legal name</strong>
                  <small>High source match · page 1</small>
                </span>
                <span className="candidate-number">2</span>
              </div>
              <div className="candidate-footer">
                <span>Human confirmation required</span>
                <button className="text-action" type="button">Review all <ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
          <div className="workbench-note">
            <SearchCheck size={16} /> Confidence describes the source match. It does not approve the claim.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
