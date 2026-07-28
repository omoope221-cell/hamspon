export function Field({ label, children, hint, error }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wider text-[var(--slate-600)] mb-1.5">
        {label}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-[var(--slate-500)] mt-1">{hint}</span>}
      {error && <span className="block text-xs text-[var(--rust-500)] mt-1">{error}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-[var(--paper-200)] bg-white px-3 py-2 text-sm text-[var(--ink-900)] placeholder:text-[var(--slate-500)] focus:border-[var(--brass-500)] outline-none transition-colors ${props.className || ''}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-[var(--paper-200)] bg-white px-3 py-2 text-sm text-[var(--ink-900)] focus:border-[var(--brass-500)] outline-none transition-colors ${props.className || ''}`}
    >
      {props.children}
    </select>
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-[var(--paper-200)] bg-white px-3 py-2 text-sm text-[var(--ink-900)] placeholder:text-[var(--slate-500)] focus:border-[var(--brass-500)] outline-none transition-colors ${props.className || ''}`}
    />
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--ink-950)]/60" onClick={onClose} />
      <div className="relative bg-[var(--paper-50)] rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto thin-scroll">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--paper-200)]">
          <h3 className="font-display text-lg font-semibold text-[var(--ink-900)]">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-[var(--slate-500)] hover:text-[var(--ink-900)] text-xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-[var(--paper-200)] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
