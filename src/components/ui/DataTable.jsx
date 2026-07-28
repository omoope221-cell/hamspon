import { Spinner, EmptyState } from './Primitives';

// columns: [{ key, header, render?: (row) => node }]
// onRowClick?: (row) => void — when provided, rows are clickable (used for
// edit/detail flows) with a pointer cursor and hover affordance.
export default function DataTable({ columns, rows, loading, emptyTitle = 'Nothing here yet', emptyBody, rowKey = '_id', onRowClick }) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <div className="overflow-x-auto thin-scroll">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--paper-200)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left font-mono text-[11px] tracking-wider uppercase text-[var(--slate-500)] font-medium py-2.5 px-3 whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-[var(--paper-200)] last:border-0 hover:bg-[var(--paper-100)] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-3 text-[var(--ink-900)] align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
