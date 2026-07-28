export default function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--brass-500)]">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl font-semibold text-[var(--ink-900)]">{title}</h1>
      </div>
      {action}
    </div>
  );
}
