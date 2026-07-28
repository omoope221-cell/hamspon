import { useEffect, useState, useCallback } from 'react';
import { sessionsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Modal } from '../../../components/ui/Form';
import { Plus } from 'lucide-react';
import { ApiError } from '../../../api/client';

export default function AdminSettings() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  const load = useCallback(() => {
    setLoading(true);
    sessionsApi.getAll({ sort: '-startDate' }).then((r) => setSessions(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      await sessionsApi.create(form);
      setModalOpen(false);
      setForm({ name: '', startDate: '', endDate: '' });
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create session.');
    } finally { setSaving(false); }
  }

  async function makeCurrent(id) {
    await sessionsApi.setCurrent(id);
    load();
  }

  return (
    <div>
      <PageHeader
        eyebrow="School Settings"
        title="Academic Sessions"
        action={<Button variant="brass" onClick={() => setModalOpen(true)}><Plus size={16} /> New session</Button>}
      />

      {loading ? (
        <p className="text-sm text-[var(--slate-500)]">Loading…</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s._id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-[var(--ink-900)]">{s.name}</h3>
                    {s.isCurrent && <Badge tone="sage">Current</Badge>}
                  </div>
                  <p className="text-xs text-[var(--slate-500)] mt-1">
                    {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    {s.terms?.map((t) => (
                      <Badge key={t._id} tone={t.isCurrent ? 'brass' : 'slate'}>{t.name}</Badge>
                    ))}
                  </div>
                </div>
                {!s.isCurrent && (
                  <Button variant="ghost" className="text-xs" onClick={() => makeCurrent(s._id)}>Set as current</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New academic session">
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Session name"><Input required placeholder="2026/2027" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
            <Field label="End date"><Input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          </div>
          {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
          <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Create session'}</Button>
        </form>
      </Modal>
    </div>
  );
}
