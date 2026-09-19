import Link from "next/link";
import { ArrowRight, FileText, Plus, ShieldCheck } from "lucide-react";
import { StatusPill } from "@/components/status-pill";

export default function EvidenceListPage() {
  return (
    <>
      <header className="page-heading">
        <div>
          <StatusPill tone="approved">1 document</StatusPill>
          <h1>Evidence</h1>
          <p>
            Documents remain private. Only reviewed, safe summaries can appear
            publicly.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="button button-primary"
            type="button"
            title="Live uploads require the AWS connection"
          >
            <Plus size={16} /> Add evidence
          </button>
        </div>
      </header>
      <div className="notice-bar">
        <ShieldCheck size={17} />
        <span>
          Live PDF upload is disabled in local mode. This synthetic fixture
          demonstrates the clean-before-processing workflow without accepting
          private documents.
        </span>
      </div>
      <section className="panel" aria-label="Evidence documents">
        <div className="data-list">
          <div className="data-row">
            <div className="data-title">
              <span className="file-icon">
                <FileText size={20} />
              </span>
              <span>
                <strong>Synthetic_CSR-1_Certificate.pdf</strong>
                <small>2 pages · 284 KB · added 19 Sep 2026</small>
              </span>
            </div>
            <div className="data-cell">
              <small>Processing state</small>
              <StatusPill tone="ai">Needs confirmation</StatusPill>
            </div>
            <div className="data-cell">
              <small>Source</small>
              <span>Synthetic fixture</span>
            </div>
            <Link
              className="button button-secondary"
              href="/app/evidence/demo-csr-1"
            >
              Open <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
