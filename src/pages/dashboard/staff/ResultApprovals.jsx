import { useEffect, useState, useCallback } from 'react';
import { classesApi, sessionsApi, resultsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge, Spinner, EmptyState } from '../../../components/ui/Primitives';
import { Field, Select, Modal, Textarea } from '../../../components/ui/Form';
import { Check, X } from 'lucide-react';
import { ApiError } from '../../../api/client';

const STATUS_TONE = { draft: 'slate', submitted: 'brass', approved: 'sage', rejected: 'rust' };

// Visible to any staff member — the backend only ever returns results for
// classes this staff member is the Class Teacher for (or is assigned to
// teach), so a Subject Teacher with no Class Teacher assignment simply
// sees an empty list here. Super Admin/Principal/Vice Principal can
// publish/override any result from Admin Dashboard → Result Management.
export default function StaffResultApprovals() {
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [term, setTerm] = useState('First Term');
  const [status, setStatus] = useState('submitted');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [rejecting, setRejecting] = useState(null); // the result being rejected
  const [reason, setReason] = useState('');

  useEffect(() => {
    Promise.all([classesApi.getAll({ limit: 200 }), sessionsApi.getAll({ limit: 20 })]).then(([c, ses]) => {
      setClasses(c.data);
      setSessions(ses.data);
      const current = ses.data.find((x) => x.isCurrent);
      if (current) setSessionId(current._id);
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = { term, limit: 200 };
    if (classId) params.class = classId;
    if (sessionId) params.session = sessionId;
    if (status) params.status = status;
    resultsApi.getAll(params).then((r) => setResults(r.data)).finally(() => setLoading(false));
  }, [classId, sessionId, term, status]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(result) {
    if (!window.confirm(`Publish ${result.student.firstName} ${result.student.lastName}'s result? It becomes visible to the student immediately.`)) return;
    setActing(result._id);
    try {
      await resultsApi.approve(result._id);
      load();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Failed to publish result.');
    } finally {
      setActing(null);
    }
  }

  async function handleReject(e) {
    e.preventDefault();
    setActing(rejecting._id);
    try {
      await resultsApi.reject(rejecting._id, reason);
      setRejecting(null);
      setReason('');
      load();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Failed to send back result.');
    } finally {
      setActing(null);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Class Teacher" title="Result Approvals" />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Review results submitted by subject teachers for your class(es), then publish so students can see them
        immediately. You'll only see results for classes you're assigned to teach or are the Class Teacher for.
      </p>

      <Card>
        <div className="grid sm:grid-cols-4 gap-3 mb-4">
          <Field label="Class">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">All my classes</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ''}</option>)}
            </Select>
          </Field>
          <Field label="Session">
            <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">All sessions</option>
              {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Term">
            <Select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="submitted">Awaiting publish</option>
              <option value="approved">Published</option>
              <option value="rejected">Sent back</option>
              <option value="">All</option>
            </Select>
          </Field>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !results.length ? (
          <EmptyState
            title="Nothing here"
            body="Once a subject teacher submits scores for one of your classes, they'll show up here for you to publish."
          />
        ) : (
          <DataTable
            rows={results}
            columns={[
              { key: 'student', header: 'Student', render: (r) => `${r.student?.firstName || ''} ${r.student?.lastName || ''}` },
              { key: 'class', header: 'Class', render: (r) => r.class?.name || '—' },
              { key: 'average', header: 'Average', render: (r) => r.average ?? '—' },
              { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
              {
                key: 'actions', header: '', render: (r) => r.status === 'submitted' ? (
                  <div className="flex gap-2">
                    <Button variant="brass" className="!px-2 !py-1 text-xs" disabled={acting === r._id} onClick={() => handleApprove(r)}>
                      <Check size={13} /> Publish
                    </Button>
                    <button
                      type="button"
                      className="text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md px-2"
                      disabled={acting === r._id}
                      onClick={() => { setRejecting(r); setReason(''); }}
                      aria-label="Send back"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : '—',
              },
            ]}
          />
        )}
      </Card>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title={rejecting ? `Send back ${rejecting.student?.firstName}'s result` : ''}>
        {rejecting && (
          <form onSubmit={handleReject} className="space-y-4">
            <Field label="Reason (shown to the subject teacher)">
              <Textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <Button type="submit" variant="brass" className="w-full" disabled={acting === rejecting._id}>
              {acting === rejecting._id ? 'Sending…' : 'Send back for corrections'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
