import { useEffect, useState } from 'react';
import { parentsApi, studentFeeBillsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Spinner, Badge, EmptyState } from '../../../components/ui/Primitives';

const STATUS_TONE = { paid: 'sage', partial: 'brass', unpaid: 'rust' };

export default function ParentFees() {
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentsApi.getMe().then((r) => {
      setChildren(r.data.children || []);
      if (r.data.children?.length) setActiveChild(r.data.children[0]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    studentFeeBillsApi.getAll({ student: activeChild._id, sort: '-uploadedAt' })
      .then((r) => setBills(r.data))
      .finally(() => setLoading(false));
  }, [activeChild]);

  if (loading && !children.length) return <div className="flex justify-center py-16"><Spinner size={28} /></div>;

  if (!children.length) {
    return (
      <div>
        <PageHeader eyebrow="Finance" title="My Child's Fees" />
        <Card><EmptyState title="No children linked yet" body="Contact the school's Super Admin to have your child linked to your account." /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Finance" title="My Child's Fees" />

      <div className="flex gap-1 mb-4 border-b border-[var(--paper-200)]">
        {children.map((c) => (
          <button
            key={c._id}
            onClick={() => setActiveChild(c)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeChild?._id === c._id ? 'border-[var(--brass-500)] text-[var(--ink-900)]' : 'border-transparent text-[var(--slate-500)]'
            }`}
          >
            {c.firstName} {c.lastName}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : !bills.length ? (
        <Card><p className="text-sm text-[var(--slate-500)] text-center py-8">No fee bill uploaded for {activeChild.firstName} yet.</p></Card>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <Card
              key={bill._id}
              title={`${bill.term} — ${bill.session?.name || ''}`}
              eyebrow={`${activeChild.firstName} ${activeChild.lastName} · ${bill.class?.name || ''}`}
              action={<Badge tone={STATUS_TONE[bill.status]}>{bill.status}</Badge>}
            >
              <div className="overflow-x-auto thin-scroll mb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--paper-200)]">
                      <th className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2">Fee Name</th>
                      <th className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, i) => (
                      <tr key={i} className="border-b border-[var(--paper-200)] last:border-0">
                        <td className="py-2 px-2">{item.feeName}</td>
                        <td className="py-2 px-2 font-mono">₦{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-2 px-2 font-semibold">Total</td>
                      <td className="py-2 px-2 font-mono font-bold">₦{bill.totalAmount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-semibold">Paid so far</td>
                      <td className="py-2 px-2 font-mono">₦{(bill.amountPaid || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-[var(--slate-500)] space-y-1">
                <p>Uploaded {new Date(bill.uploadedAt).toLocaleString()} by {bill.uploadedBy ? `${bill.uploadedBy.firstName} ${bill.uploadedBy.lastName}` : '—'}</p>
                {bill.remarks && <p>Remarks: {bill.remarks}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
