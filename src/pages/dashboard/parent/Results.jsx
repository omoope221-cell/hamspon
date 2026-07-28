import { useEffect, useState } from 'react';
import { parentsApi, resultsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Spinner, Badge, Button, EmptyState } from '../../../components/ui/Primitives';
import { Printer, Download } from 'lucide-react';
import { downloadReportCard } from '../../../utils/downloadReportCard';

export default function ParentResults() {
  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  async function handleDownload(res) {
    setDownloading(res._id);
    try {
      await downloadReportCard(res._id, `${res.student?.firstName || 'report'}-${res.term}`.replace(/\s+/g, '-'));
    } catch {
      window.alert('Failed to download the report card. Please try again.');
    } finally {
      setDownloading(null);
    }
  }

  useEffect(() => {
    parentsApi.getMe().then((r) => {
      setChildren(r.data.children || []);
      if (r.data.children?.length) setActiveChild(r.data.children[0]._id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeChild) return;
    setLoading(true);
    resultsApi.getAll({ student: activeChild, sort: '-createdAt', limit: 20 }).then((r) => setResults(r.data)).finally(() => setLoading(false));
  }, [activeChild]);

  if (loading && !children.length) return <div className="flex justify-center py-16"><Spinner size={28} /></div>;

  if (!children.length) {
    return (
      <div>
        <PageHeader eyebrow="Academics" title="My Children's Results" />
        <Card><EmptyState title="No children linked yet" body="Contact the school's Super Admin to have your child linked to your account." /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Academics" title="My Children's Results" />

      <div className="flex gap-1 mb-4 border-b border-[var(--paper-200)]">
        {children.map((c) => (
          <button
            key={c._id}
            onClick={() => setActiveChild(c._id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeChild === c._id ? 'border-[var(--brass-500)] text-[var(--ink-900)]' : 'border-transparent text-[var(--slate-500)]'
            }`}
          >
            {c.firstName} {c.lastName}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : results.length === 0 ? (
        <Card><p className="text-sm text-[var(--slate-500)] text-center py-8">No published results yet for this child.</p></Card>
      ) : (
        <div className="space-y-4">
          {results.map((res) => (
            <Card
              key={res._id}
              title={`${res.term} — ${res.class?.name}`}
              eyebrow="Published Result"
              action={
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge tone="sage">Average: {res.average}</Badge>
                  {res.positionInClass && <Badge tone="brass">Position: {res.positionInClass} of {res.classSize || '—'}</Badge>}
                  <Button variant="ghost" className="!px-2 !py-1 print:hidden" onClick={() => window.print()} aria-label="Print result"><Printer size={15} /></Button>
                  <Button variant="ghost" className="!px-2 !py-1 print:hidden" disabled={downloading === res._id} onClick={() => handleDownload(res)} aria-label="Download result as PDF"><Download size={15} /></Button>
                </div>
              }
            >
              {res.attendance?.totalDays && (
                <p className="text-xs text-[var(--slate-500)] mb-3">Attendance: {res.attendance.daysPresent ?? 0} / {res.attendance.totalDays} Days</p>
              )}
              <div className="overflow-x-auto thin-scroll">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--paper-200)]">
                      {['Subject', 'CA1 (10)', 'CA2 (10)', 'Assign. (10)', 'Exam (70)', 'Total (100)', 'Grade', 'Position', 'Remark'].map((h) => (
                        <th key={h} className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {res.scores?.map((s) => (
                      <tr key={s.subject?._id || s.subject} className="border-b border-[var(--paper-200)] last:border-0">
                        <td className="py-2 px-2">{s.subject?.name || '—'}</td>
                        <td className="py-2 px-2">{s.ca1}</td>
                        <td className="py-2 px-2">{s.ca2}</td>
                        <td className="py-2 px-2">{s.assignment ?? 0}</td>
                        <td className="py-2 px-2">{s.exam}</td>
                        <td className="py-2 px-2 font-mono">{s.total}</td>
                        <td className="py-2 px-2"><Badge>{s.grade}</Badge></td>
                        <td className="py-2 px-2">{s.position || '—'}</td>
                        <td className="py-2 px-2 text-[var(--slate-500)]">{s.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 space-y-1">
                {res.teacherComment && <p className="text-xs text-[var(--slate-500)]"><strong>Class Teacher's Comment:</strong> {res.teacherComment}</p>}
                {res.principalComment && <p className="text-xs text-[var(--slate-500)]"><strong>Principal's Comment:</strong> {res.principalComment}</p>}
                {(res.promotedTo || res.nextClass) && (
                  <p className="text-xs text-[var(--slate-500)]"><strong>Promoted to:</strong> {res.promotedTo || '—'} {res.nextClass ? `(${res.nextClass})` : ''}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
