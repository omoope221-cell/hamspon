import { useEffect, useState, useCallback } from 'react';
import { classesApi, sessionsApi, feesApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Select, Modal } from '../../../components/ui/Form';
import { Plus, Trash2 } from 'lucide-react';
import { ApiError } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

const BLANK = { feeType: '', amount: '', term: 'First Term', dueDate: '' };

export default function StaffClassFees() {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classId, setClassId] = useState('');
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit an existing fee item
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(BLANK);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    Promise.all([classesApi.getAll({ limit: 200 }), sessionsApi.getAll({ limit: 20 })]).then(([c, ses]) => {
      setSessions(ses.data);
      const owned = c.data.filter((cls) => (cls.classTeacher?._id || cls.classTeacher) === user.staffProfile);
      setMyClasses(owned);
      if (owned.length) setClassId(owned[0]._id);
      setLoading(false);
    });
  }, [user.staffProfile]);

  const load = useCallback(() => {
    if (!classId) { setFees([]); return; }
    feesApi.getAll({ class: classId, limit: 100 }).then((r) => setFees(r.data));
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      const currentSession = sessions.find((s) => s.isCurrent) || sessions[0];
      await feesApi.create({ ...form, amount: Number(form.amount), class: classId, session: currentSession?._id, dueDate: form.dueDate || undefined });
      setModalOpen(false);
      setForm(BLANK);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to add fee item.');
    } finally { setSaving(false); }
  }

  function openEdit(fee) {
    setEditing(fee);
    setEditForm({
      feeType: fee.feeType,
      amount: fee.amount,
      term: fee.term,
      dueDate: fee.dueDate ? fee.dueDate.slice(0, 10) : '',
    });
    setEditError('');
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setEditError(''); setSaving(true);
    try {
      await feesApi.update(editing._id, { ...editForm, amount: Number(editForm.amount), dueDate: editForm.dueDate || null });
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update fee item.');
    } finally { setSaving(false); }
  }

  async function handleDelete(fee) {
    if (!window.confirm(`Remove "${fee.feeType}" from this class's payment plan?`)) return;
    setSaving(true);
    try {
      await feesApi.remove(fee._id);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to remove fee item.');
    } finally { setSaving(false); }
  }

  if (!loading && !myClasses.length) {
    return (
      <div>
        <PageHeader eyebrow="Class Teacher" title="My Class Fees" />
        <Card>
          <p className="text-sm text-[var(--slate-500)] text-center py-8">
            You haven't been assigned as Class Teacher for any class yet — contact your Super Admin to be assigned before you can publish a payment plan.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Class Teacher"
        title="My Class Fees"
        action={<Button variant="brass" onClick={() => setModalOpen(true)}><Plus size={16} /> Add fee item</Button>}
      />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Publish what's needed this term for your class — school fees, excursions, books/textbooks, equipment. Parents
        see this list immediately in their portal. Click a row to edit or remove an item.
      </p>

      <Card>
        {myClasses.length > 1 && (
          <div className="max-w-xs mb-4">
            <Field label="Class">
              <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                {myClasses.map((c) => <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ''}</option>)}
              </Select>
            </Field>
          </div>
        )}

        <DataTable
          loading={loading}
          rows={fees}
          emptyTitle="No fee items yet"
          onRowClick={openEdit}
          columns={[
            { key: 'feeType', header: 'Item' },
            { key: 'term', header: 'Term', render: (r) => <Badge>{r.term}</Badge> },
            { key: 'amount', header: 'Amount', render: (r) => `₦${r.amount.toLocaleString()}` },
            { key: 'dueDate', header: 'Due date', render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—' },
          ]}
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add fee item">
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Item name">
            <Input required placeholder="e.g. Term 1 School Fees, Excursion, Mathematics Textbook" value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })} />
          </Field>
          <Field label="Amount (₦)">
            <Input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Term">
            <Select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </Select>
          </Field>
          <Field label="Due date (optional)">
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
          {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
          <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Adding…' : 'Add to payment plan'}</Button>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit "${editing.feeType}"` : ''}>
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Field label="Item name">
              <Input required value={editForm.feeType} onChange={(e) => setEditForm({ ...editForm, feeType: e.target.value })} />
            </Field>
            <Field label="Amount (₦)">
              <Input type="number" min="0" required value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            </Field>
            <Field label="Term">
              <Select value={editForm.term} onChange={(e) => setEditForm({ ...editForm, term: e.target.value })}>
                <option>First Term</option>
                <option>Second Term</option>
                <option>Third Term</option>
              </Select>
            </Field>
            <Field label="Due date (optional)">
              <Input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
            </Field>

            {editError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{editError}</p>}

            <div className="flex gap-3">
              <Button type="submit" variant="brass" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              <button type="button" onClick={() => handleDelete(editing)} disabled={saving} className="px-3 text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md" aria-label="Remove fee item" title="Remove">
                <Trash2 size={18} />
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
