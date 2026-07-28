export default function ChildSwitcher({ children: kids, selectedId, onSelect }) {
  if (!kids || kids.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {kids.map((c) => (
        <button
          key={c._id}
          onClick={() => onSelect(c._id)}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
            selectedId === c._id
              ? 'bg-[var(--ink-900)] border-[var(--ink-900)] text-[var(--paper-50)]'
              : 'border-[var(--paper-200)] text-[var(--slate-600)] hover:border-[var(--brass-500)]'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-[var(--brass-300)] text-[var(--ink-950)] flex items-center justify-center text-[10px] font-display font-semibold">
            {c.firstName?.[0]}
          </span>
          {c.firstName} {c.lastName}
        </button>
      ))}
    </div>
  );
}
