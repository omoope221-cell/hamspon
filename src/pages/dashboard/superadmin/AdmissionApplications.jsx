import { useEffect, useState, useCallback } from 'react';
import { admissionsApplicationsApi, classesApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Badge, EmptyState, Spinner } from '../../../components/ui/Primitives';
import { Textarea, Select, Field, Modal } from '../../../components/ui/Form';
import { Trash2, FileText, Mail, Phone, Check, X } from 'lucide-react';
import { ApiError } from '../../../api/client';

const STATUS_TONE = { pending: 'brass', approved: 'sage', rejected: 'rust' };

export default function AdmissionApplications() {
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewing, setReviewing] = useState(null); // { application, action }
  const [notes, setNotes] = useState('');
  const [classId, setClassId] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = { limit: 100, sort: '-createdAt' };
    if (statusFilter !== 'all') params.status = statusFilter;
    Promise.all([admissionsApplicationsApi.getAll(params), classesApi.getAll({ limit: 200 })])
      .then(([a, c]) => {
        setItems(a.data);
        setClasses(c.data);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  function openReview(application, action) {
    setReviewing({ application, action });
    setNotes('');
    setClassId('');
    setFormError('');
  }

  async function submitReview(e) {
    e.preventDefault();
    if (reviewing.action === 'approved' && !classId) {
      setFormError('Please select a class to place the student in.');
      return;
    }
    setSaving(true); setFormError('');
    try {
      await admissionsApplicationsApi.updateStatus(reviewing.application._id, {
        status: reviewing.action,
        reviewNotes: notes,
        classId: reviewing.action === 'approved' ? classId : undefined,
      });
      setReviewing(null);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this application permanently?')) return;
    await admissionsApplicationsApi.remove(id);
    load();
  }

  return (
    <div>
      <PageHeader eyebrow="Admissions" title="Admission Applications" />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Approving an application generates a Student ID and account automatically. Payment and the entrance exam are
        both completed physically at the school.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
              statusFilter === s ? 'bg-[var(--brass-500)] border-[var(--brass-500)] text-white' : 'border-[var(--paper-200)] text-[var(--slate-600)]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No applications" body="Applications submitted from the public admissions form will show up here." />
      ) : (
        <div className="space-y-3">
          {items.map((app) => (
            <Card key={app._id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-[var(--ink-900)]">{app.studentFullName}</h3>
                    <Badge tone={STATUS_TONE[app.status]}>{app.status}</Badge>
                    {app.applicationNumber && <Badge>{app.applicationNumber}</Badge>}
                  </div>
                  <p className="text-sm text-[var(--slate-600)]">
                    {app.gradeApplyingFor} · {app.gender} · DOB {new Date(app.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[var(--slate-600)] mt-1">Guardian: {app.guardianName} ({app.guardianRelationship || 'n/a'})</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-[var(--slate-500)]">
                    <span className="flex items-center gap-1"><Mail size={12} /> {app.guardianEmail}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {app.guardianPhone}</span>
                  </div>
                  {app.documents?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {app.documents.map((d, i) => (
                        <a key={i} href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[var(--brass-500)] hover:underline">
                          <FileText size={12} /> {d.label}
                        </a>
                      ))}
                    </div>
                  )}
                  {app.reviewNotes && <p className="text-xs text-[var(--slate-500)] italic mt-2">Note: {app.reviewNotes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {app.status === 'pending' && (
                    <>
                      <Button variant="brass" onClick={() => openReview(app, 'approved')}><Check size={14} /> Approve</Button>
                      <Button onClick={() => openReview(app, 'rejected')}><X size={14} /> Reject</Button>
                    </>
                  )}
                  <button onClick={() => remove(app._id)} className="text-[var(--slate-500)] hover:text-[var(--rust-500)]" aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!reviewing} onClose={() => setReviewing(null)} title={reviewing?.action === 'approved' ? 'Approve Application' : 'Reject Application'}>
        {reviewing && (
          <form onSubmit={submitReview} className="space-y-4">
            <p className="text-sm text-[var(--slate-600)]">
              This emails <strong>{reviewing.application.guardianName}</strong> at {reviewing.application.guardianEmail}.
            </p>
            {reviewing.action === 'approved' && (
              <Field label="Place student in class">
                <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">Select a class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ''} ({c.section})</option>
                  ))}
                </Select>
              </Field>
            )}
            <Textarea rows={4} placeholder="Optional note to include in the email…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
            <Button type="submit" variant="brass" className="w-full" disabled={saving}>
              {saving ? 'Sending…' : reviewing.action === 'approved' ? 'Approve & Notify' : 'Reject & Notify'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}