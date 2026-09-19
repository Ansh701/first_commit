export default function Loading() {
  return (
    <main className="route-loading" aria-label="Loading INSIPS">
      <div className="loading-brand">
        <span className="skeleton skeleton-logo" />
        <span className="skeleton skeleton-word" />
      </div>
      <div className="loading-grid">
        <span className="skeleton skeleton-heading" />
        <span className="skeleton skeleton-copy" />
        <div>
          <span className="skeleton" />
          <span className="skeleton" />
          <span className="skeleton" />
        </div>
      </div>
    </main>
  );
}
