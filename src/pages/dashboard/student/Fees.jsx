import { useEffect, useState } from 'react';
import { studentFeeBillsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Badge, Spinner, EmptyState } from '../../../components/ui/Primitives';

const STATUS_TONE = { paid: 'sage', partial: 'brass', unpaid: 'rust' };

export default function StudentFees() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentFeeBillsApi.getAll({ sort: '-uploadedAt' }).then((r) => setBills(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>;

  return (
    <div>
      <PageHeader eyebrow="My Desk" title="My Fees" />

      {!bills.length ? (
        <Card><EmptyState title="No fees uploaded yet" body="Your Class Teacher hasn't uploaded a fee bill yet." /></Card>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <Card
              key={bill._id}
              title={`${bill.term} — ${bill.session?.name || ''}`}
              eyebrow={bill.class?.name}
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
