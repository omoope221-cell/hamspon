import { useEffect, useState, useCallback } from 'react';
import { staffApi, usersApi, classesApi, subjectsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Select, Modal } from '../../../components/ui/Form';
import { Plus, Search, Trash2, KeyRound } from 'lucide-react';
import { ApiError } from '../../../api/client';

const STAFF_ROLES = [
  'principal', 'vice_principal', 'head_teacher', 'teacher', 'accountant', 'bursar',
  'registrar', 'ict_admin', 'librarian', 'hostel_master', 'receptionist',
];

const BLANK_CREATE = { fullName: '', email: '', staffId: '', role: 'teacher', department: '', section: 'both', assignedClasses: [], assignedSubjects: [] };

function MultiCheckList({ options, selected, onChange, labelFor, emptyLabel }) {
  if (!options.length) return <p className="text-xs text-[var(--slate-500)]">{emptyLabel}</p>;
  return (
    <div className="max-h-40 overflow-y-auto thin-scroll border border-[var(--paper-200)] rounded-md p-2 space-y-1">
      {options.map((opt) => {
        const checked = selected.includes(opt._id);
        return (
          <label key={opt._id} className="flex items-center gap-2 text-sm text-[var(--slate-600)] cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onChange(checked ? selected.filter((id) => id !== opt._id) : [...selected, opt._id])}
            />
            {labelFor(opt)}
          </label>
        );
      })}
    </div>
  );
}

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Primary/Secondary/Both are shown as separate tabs, never one combined list.
  const [sectionTab, setSectionTab] = useState('primary');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [tempCred, setTempCred] = useState(null);
  const [form, setForm] = useState(BLANK_CREATE);

  // Edit / delete
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ department: '', section: 'both', assignedClasses: [], assignedSubjects: [] });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetPw, setResetPw] = useState(null); // temp password shown after a reset

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      staffApi.getAll({ search, section: sectionTab, limit: 50 }),
      classesApi.getAll({ limit: 200 }),
      subjectsApi.getAll({ limit: 200 }),
    ])
      .then(([s, c, sub]) => {
        setStaff(s.data);
        setClasses(c.data);
        setSubjects(sub.data);
      })
      .finally(() => setLoading(false));
  }, [search, sectionTab]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const res = await usersApi.createStaff(form);
      setTempCred(res.tempPassword);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create staff account.');
    } finally {
      setCreating(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setTempCred(null);
    setForm(BLANK_CREATE);
  }

  async function toggleStatus(member) {
    const nextStatus = member.status === 'active' ? 'suspended' : 'active';
    // staff.user holds the account id
    await usersApi.setStatus(member.user, nextStatus);
    load();
  }

  function openEdit(row) {
    setEditing(row);
    setEditForm({
      department: row.department || '',
      section: row.section || 'both',
      assignedClasses: (row.assignedClasses || []).map((c) => c._id || c),
      assignedSubjects: (row.assignedSubjects || []).map((s) => s._id || s),
    });
    setEditError('');
    setResetPw(null);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setEditError(''); setSaving(true);
    try {
      await staffApi.update(editing._id, {
        department: editForm.department,
        section: editForm.section,
        assignedClasses: editForm.assignedClasses,
        assignedSubjects: editForm.assignedSubjects,
      });
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update staff member.');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!window.confirm(`Permanently delete ${editing.firstName} ${editing.lastName}? This removes their login access too and cannot be undone.`)) return;
    setSaving(true);
    try {
      await staffApi.remove(editing._id);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to delete staff member.');
    } finally { setSaving(false); }
  }

  async function handleResetPassword() {
    if (!window.confirm(`Generate a new temporary password for ${editing.firstName} ${editing.lastName}? Their current password stops working immediately.`)) return;
    setSaving(true);
    try {
      const res = await usersApi.resetPassword(editing.user);
      setResetPw(res.tempPassword);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to reset password.');
    } finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Register — Staff"
        title="Staff"
        action={<Button variant="brass" onClick={() => setModalOpen(true)}><Plus size={16} /> Add staff</Button>}
      />

      <div className="flex gap-1 mb-4 border-b border-[var(--paper-200)]">
        {['primary', 'secondary', 'both'].map((t) => (
          <button
            key={t}
            onClick={() => setSectionTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              sectionTab === t ? 'border-[var(--brass-500)] text-[var(--ink-900)]' : 'border-transparent text-[var(--slate-500)]'
            }`}
          >
            {t === 'both' ? 'Both Sections' : `${t} School`}
          </button>
        ))}
      </div>

      <Card>
        <div className="relative max-w-xs mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
          <Input placeholder={`Search ${sectionTab === 'both' ? '' : sectionTab + ' '}staff by name or staff ID`} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <DataTable
          loading={loading}
          rows={staff}
          emptyTitle={`No ${sectionTab === 'both' ? '' : sectionTab + ' '}staff yet`}
          onRowClick={openEdit}
          columns={[
            { key: 'staffId', header: 'Staff ID', render: (r) => <span className="font-mono text-xs">{r.staffId}</span> },
            { key: 'name', header: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
            { key: 'role', header: 'Role', render: (r) => <Badge tone="brass">{r.role.replace('_', ' ')}</Badge> },
            { key: 'classes', header: 'Assigned Classes', render: (r) => r.assignedClasses?.length ? r.assignedClasses.map((c) => c.name).join(', ') : '—' },
            { key: 'department', header: 'Department', render: (r) => r.department || '—' },
            { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'sage' : 'rust'}>{r.status}</Badge> },
            {
              key: 'actions', header: '', render: (r) => (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStatus(r); }}
                  className="text-xs font-mono uppercase text-[var(--slate-600)] hover:text-[var(--ink-900)]"
                >
                  {r.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              ),
            },
          ]}
        />
        <p className="text-xs text-[var(--slate-500)] mt-3">Click a row to edit assignments, reset password, or remove a staff member.</p>
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={tempCred ? 'Staff account created' : 'Add a new staff member'}>
        {tempCred ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--slate-600)]">Share this temporary password securely. It must be changed on first login.</p>
            <p className="font-mono text-lg bg-[var(--paper-200)] rounded-md px-3 py-2 text-center">{tempCred}</p>
            <Button className="w-full" onClick={closeModal}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Full name">
              <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Staff ID">
              <Input required value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} />
            </Field>
            <Field label="Role">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {STAFF_ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </Select>
            </Field>
            <Field label="Department (optional)">
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Field>
            <Field label="School section" hint="Which level(s) this teacher belongs to — used to decide who shows up when a Class & Subject assignment is made.">
              <Select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="both">Both</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </Select>
            </Field>
            <Field label="Assign to class(es) (optional)">
              <MultiCheckList
                options={classes}
                selected={form.assignedClasses}
                onChange={(v) => setForm({ ...form, assignedClasses: v })}
                labelFor={(c) => `${c.name}${c.arm ? ` ${c.arm}` : ''}`}
                emptyLabel="No classes set up yet — add classes first from Classes & Subjects."
              />
            </Field>
            <Field label="Assign subject(s) (optional)">
              <MultiCheckList
                options={subjects}
                selected={form.assignedSubjects}
                onChange={(v) => setForm({ ...form, assignedSubjects: v })}
                labelFor={(s) => s.name}
                emptyLabel="No subjects set up yet — add subjects first from Classes & Subjects."
              />
            </Field>

            {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}

            <Button type="submit" variant="brass" className="w-full" disabled={creating}>
              {creating ? 'Creating…' : 'Create staff account'}
            </Button>
          </form>
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.firstName} ${editing.lastName}` : ''}>
        {editing && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--slate-500)]">
              Staff ID <span className="font-mono">{editing.staffId}</span> · Role <Badge tone="brass">{editing.role.replace('_', ' ')}</Badge>
              {' '}— role changes aren't supported here yet; delete and re-add to change a staff member's role.
            </p>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <Field label="Department"><Input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} /></Field>
              <Field label="School section" hint="Which level(s) this teacher belongs to — used to decide who shows up when a Class & Subject assignment is made.">
                <Select value={editForm.section} onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}>
                  <option value="both">Both</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </Select>
              </Field>
              <Field label="Assigned class(es)">
                <MultiCheckList
                  options={classes}
                  selected={editForm.assignedClasses}
                  onChange={(v) => setEditForm({ ...editForm, assignedClasses: v })}
                  labelFor={(c) => `${c.name}${c.arm ? ` ${c.arm}` : ''}`}
                  emptyLabel="No classes set up yet."
                />
              </Field>
              <Field label="Assigned subject(s)">
                <MultiCheckList
                  options={subjects}
                  selected={editForm.assignedSubjects}
                  onChange={(v) => setEditForm({ ...editForm, assignedSubjects: v })}
                  labelFor={(s) => s.name}
                  emptyLabel="No subjects set up yet."
                />
              </Field>

              {editError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{editError}</p>}

              <div className="flex gap-3">
                <Button type="submit" variant="brass" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
                <button type="button" onClick={handleResetPassword} disabled={saving} className="px-3 text-[var(--slate-600)] hover:bg-[var(--paper-200)] rounded-md" aria-label="Reset password" title="Reset password">
                  <KeyRound size={18} />
                </button>
                <button type="button" onClick={handleDelete} disabled={saving} className="px-3 text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md" aria-label="Delete staff member" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </form>
            {resetPw && (
              <div className="bg-[var(--sage-100)] rounded-md px-3 py-2 text-sm">
                New temporary password: <code className="font-mono">{resetPw}</code>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
