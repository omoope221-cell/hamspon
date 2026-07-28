import { Card } from '../../../components/ui/Primitives';

// Shared shell for admin sections that have their nav entry, route, and
// layout wired up, but not a full backend-CRUD build yet. Keeps the page
// on-brand (matches AdminDashboardLayout's theme) instead of a raw 404
// or unstyled stub.
export default function ScaffoldPage({ eyebrow, title, description, Icon, children }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--brass-500)]">{eyebrow}</p>
        <h1 className="font-display text-2xl font-semibold text-[var(--ink-900)]">{title}</h1>
      </div>

      <Card>
        <div className="text-center py-12 px-4">
          {Icon && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white mx-auto mb-4">
              <Icon size={26} />
            </div>
          )}
          <p className="font-display text-lg text-[var(--ink-900)]">{title}</p>
          <p className="text-sm text-[var(--slate-500)] mt-1 max-w-md mx-auto">{description}</p>
          {children && <div className="mt-6 text-left">{children}</div>}
        </div>
      </Card>
    </div>
  );
}
