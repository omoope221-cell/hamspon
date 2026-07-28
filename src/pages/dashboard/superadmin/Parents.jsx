import { useEffect, useState, useCallback } from 'react';
import { parentsApi, usersApi, studentsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Select, Modal } from '../../../components/ui/Form';
import { Plus, Search, Trash2 } from 'lucide-react';
import { ApiError } from '../../../api/client';

const BLANK_CREATE = { fullName: '', email: '', phone: '', relationship: 'guardian', children: [] };

function ChildrenPicker({ students, selected, onChange }) {
  if (!students.length) return <p className="text-xs text-[var(--slate-500)]">No students in the system yet — add students first.</p>;
  return (
    <div className="max-h-48 overflow-y-auto thin-scroll border border-[var(--paper-200)] rounded-md p-2 space-y-1">
      {students.map((s) => {
        const checked = selected.includes(s._id);
        return (
          <label key={s._id} className="flex items-center gap-2 text-sm text-[var(--slate-600)] cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onChange(checked ? selected.filter((id) => id !== s._id) : [...selected, s._id])}
            />
            {s.firstName} {s.lastName} — {s.class?.name || 'No class'} <span className="font-mono text-xs text-[var(--slate-500)]">({s.admissionNumber})</span>
          </label>
        );
      })}
    </div>
  );
}

export default function AdminParents() {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [tempCred, setTempCred] = useState(null);
  const [form, setForm] = useState(BLANK_CREATE);

  const [editing, setEditing] = useState(null);
  const [editChildren, setEditChildren] = useState([]);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([parentsApi.getAll({ search, limit: 50 }), studentsApi.getAll({ limit: 500 })])
      .then(([p, s]) => { setParents(p.data); setStudents(s.data); })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(''); setCreating(true);
    try {
      const res = await usersApi.createParent(form);
      setTempCred(res.tempPassword);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create parent account.');
    } finally { setCreating(false); }
  }

  function closeModal() {
    setModalOpen(false);
    setTempCred(null);
    setForm(BLANK_CREATE);
  }

  function openEdit(row) {
    setEditing(row);
    setEditChildren((row.children || []).map((c) => c._id || c));
    setEditError('');
  }

  async function handleSaveChildren(e) {
    e.preventDefault();
    setEditError(''); setSaving(true);
    try {
      await parentsApi.update(editing._id, { children: editChildren });
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update linked children.');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!window.confirm(`Permanently delete ${editing.firstName} ${editing.lastName}'s parent account? This removes their login access and cannot be undone.`)) return;
    setSaving(true);
    try {
      await parentsApi.remove(editing._id);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to delete parent account.');
    } finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Register — Parents"
        title="Parent Management"
        action={<Button variant="brass" onClick={() => setModalOpen(true)}><Plus size={16} /> Add parent</Button>}
      />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Link a parent account to their child (or children) so they can see that student's results and fees in the
        Parent Portal.
      </p>

      <Card>
        <div className="relative max-w-xs mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
          <Input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <DataTable
          loading={loading}
          rows={parents}
          emptyTitle="No parent accounts yet"
          onRowClick={openEdit}
          columns={[
            { key: 'name', header: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
            { key: 'email', header: 'Email', render: (r) => r.user?.email || '—' },
            { key: 'relationship', header: 'Relationship', render: (r) => <Badge>{r.relationship}</Badge> },
            { key: 'children', header: 'Linked Children', render: (r) => r.children?.length ? r.children.map((c) => `${c.firstName} ${c.lastName}`).join(', ') : <span className="text-[var(--rust-500)]">None linked</span> },
          ]}
        />
        <p className="text-xs text-[var(--slate-500)] mt-3">Click a row to link/unlink children or remove the account.</p>
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={tempCred ? 'Parent account created' : 'Add a parent'}>
        {tempCred ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--slate-600)]">Share this temporary password securely.</p>
            <p className="font-mono text-lg bg-[var(--paper-200)] rounded-md px-3 py-2 text-center">{tempCred}</p>
            <Button className="w-full" onClick={closeModal}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Full name"><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Relationship">
              <Select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="guardian">Guardian</option>
              </Select>
            </Field>
            <Field label="Link to child(ren)">
              <ChildrenPicker students={students} selected={form.children} onChange={(v) => setForm({ ...form, children: v })} />
            </Field>
            {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
            <Button type="submit" variant="brass" className="w-full" disabled={creating}>{creating ? 'Creating…' : 'Create parent account'}</Button>
          </form>
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.firstName} ${editing.lastName}` : ''}>
        {editing && (
          <form onSubmit={handleSaveChildren} className="space-y-4">
            <Field label="Linked child(ren)">
              <ChildrenPicker students={students} selected={editChildren} onChange={setEditChildren} />
            </Field>
            {editError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{editError}</p>}
            <div className="flex gap-3">
              <Button type="submit" variant="brass" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save linked children'}</Button>
              <button type="button" onClick={handleDelete} disabled={saving} className="px-3 text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md" aria-label="Delete parent" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
