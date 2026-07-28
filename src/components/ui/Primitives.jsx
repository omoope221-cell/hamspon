export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[var(--ink-900)] text-[var(--paper-50)] hover:bg-[var(--ink-800)]',
    brass: 'bg-[var(--brass-500)] text-[var(--ink-950)] hover:bg-[var(--brass-400)]',
    ghost: 'bg-transparent text-[var(--ink-900)] hover:bg-[var(--paper-200)] border border-[var(--paper-200)]',
    danger: 'bg-[var(--rust-500)] text-white hover:opacity-90',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', title, eyebrow, action }) {
  return (
    <div className={`bg-[var(--paper-50)] border border-[var(--paper-200)] rounded-lg shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            {eyebrow && (
              <p className="font-mono text-[11px] tracking-wider uppercase text-[var(--brass-500)] mb-1">
                {eyebrow}
              </p>
            )}
            {title && <h3 className="font-display text-lg font-semibold text-[var(--ink-900)]">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-[var(--paper-200)] text-[var(--slate-600)]',
    sage: 'bg-[var(--sage-100)] text-[var(--sage-500)]',
    brass: 'bg-[color-mix(in_srgb,var(--brass-300)_40%,white)] text-[var(--brass-500)]',
    rust: 'bg-[var(--rust-100)] text-[var(--rust-500)]',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, index, hint }) {
  return (
    <div className="bg-[var(--paper-50)] border border-[var(--paper-200)] rounded-lg p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <p className="font-mono text-[11px] tracking-wider uppercase text-[var(--slate-500)]">{label}</p>
        {index && <span className="font-mono text-[11px] text-[var(--brass-500)]">{index}</span>}
      </div>
      <p className="font-display text-3xl font-semibold text-[var(--ink-900)] mt-2">{value}</p>
      {hint && <p className="text-xs text-[var(--slate-500)] mt-1">{hint}</p>}
      <div className="absolute left-0 bottom-0 h-1 w-full bg-[var(--brass-300)] opacity-40" />
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="text-center py-12 px-4">
      <p className="font-display text-lg text-[var(--ink-900)]">{title}</p>
      {body && <p className="text-sm text-[var(--slate-500)] mt-1 max-w-sm mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 24 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-[var(--ink-700)] border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}
