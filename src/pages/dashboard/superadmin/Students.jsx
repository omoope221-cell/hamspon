import { useEffect, useState, useCallback } from 'react';
import { studentsApi, usersApi, classesApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Select, Modal } from '../../../components/ui/Form';
import { Plus, Search, Trash2, User as UserIcon } from 'lucide-react';
import { ApiError } from '../../../api/client';

const STUDENT_STATUSES = ['active', 'graduated', 'suspended', 'withdrawn'];

const BLANK_EDIT = {
  firstName: '', lastName: '', middleName: '', dateOfBirth: '', gender: 'male',
  section: 'primary', class: '', department: '', address: '', bloodGroup: '', genotype: '', allergies: '', status: 'active',
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [tempCred, setTempCred] = useState(null);

  const [form, setForm] = useState({
    fullName: '', email: '', section: 'primary', class: '', gender: 'male', dateOfBirth: '', department: '',
  });

  // Edit / delete
  const [editing, setEditing] = useState(null); // the student row being edited
  const [editForm, setEditForm] = useState(BLANK_EDIT);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([studentsApi.getAll({ search, limit: 50 }), classesApi.getAll({ limit: 200 })])
      .then(([s, c]) => {
        setStudents(s.data);
        setClasses(c.data);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const res = await usersApi.createStudent(form);
      setTempCred({ password: res.tempPassword, studentId: res.studentId });
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create student.');
    } finally {
      setCreating(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setTempCred(null);
    setForm({ fullName: '', email: '', section: 'primary', class: '', gender: 'male', dateOfBirth: '', department: '' });
  }

  function openEdit(row) {
    setEditing(row);
    setEditForm({
      firstName: row.firstName || '', lastName: row.lastName || '', middleName: row.middleName || '',
      dateOfBirth: row.dateOfBirth ? row.dateOfBirth.slice(0, 10) : '', gender: row.gender || 'male',
      section: row.section || 'primary', class: row.class?._id || row.class || '', department: row.department || '',
      address: row.address || '', bloodGroup: row.bloodGroup || '', genotype: row.genotype || '',
      allergies: row.allergies || '', status: row.status || 'active',
    });
    setEditError('');
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setEditError(''); setSaving(true);
    try {
      await studentsApi.update(editing._id, editForm);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update student.');
    } finally { setSaving(false); }
  }

  async function handlePhotoUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setEditError('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setEditError('Image must be under 5MB.'); return; }
    setEditError(''); setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('passportPhoto', file);
      const res = await studentsApi.uploadPhoto(editing._id, fd);
      setEditing((prev) => ({ ...prev, passportPhoto: res.data.passportPhoto }));
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to upload photo.');
    } finally { setUploadingPhoto(false); }
  }

  async function handleDelete() {
    if (!window.confirm(`Permanently delete ${editing.firstName} ${editing.lastName}? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await studentsApi.remove(editing._id);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to delete student.');
    } finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Register — Students"
        title="Students"
        action={
          <Button variant="brass" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add student
          </Button>
        }
      />

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
            <Input
              placeholder="Search by name or admission no."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <DataTable
          loading={loading}
          rows={students}
          emptyTitle="No students yet"
          emptyBody="Add your first student to get started."
          onRowClick={openEdit}
          columns={[
            { key: 'admissionNumber', header: 'Adm. No.', render: (r) => <span className="font-mono text-xs">{r.admissionNumber}</span> },
            { key: 'name', header: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
            { key: 'gender', header: 'Gender', render: (r) => r.gender ? r.gender[0].toUpperCase() + r.gender.slice(1) : '—' },
            { key: 'section', header: 'Section', render: (r) => <Badge tone={r.section === 'primary' ? 'sage' : 'brass'}>{r.section}</Badge> },
            { key: 'class', header: 'Class', render: (r) => r.class?.name || '—' },
            { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'sage' : 'rust'}>{r.status}</Badge> },
          ]}
        />
        <p className="text-xs text-[var(--slate-500)] mt-3">Click a row to edit or remove a student.</p>
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={tempCred ? 'Student account created' : 'Add a new student'}>
        {tempCred ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--slate-600)]">
              Share these credentials with the student/parent securely — this password will not be shown again.
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-[var(--slate-500)] mb-1">Student ID</p>
                <p className="font-mono text-lg bg-[var(--paper-200)] rounded-md px-3 py-2 text-center">{tempCred.studentId}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--slate-500)] mb-1">Password</p>
                <p className="font-mono text-lg bg-[var(--paper-200)] rounded-md px-3 py-2 text-center">{tempCred.password}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-[var(--slate-600)] pt-1">
                <p><span className="text-[var(--slate-500)]">Gender:</span> {form.gender ? form.gender[0].toUpperCase() + form.gender.slice(1) : '—'}</p>
                <p><span className="text-[var(--slate-500)]">Class:</span> {classes.find((c) => c._id === form.class)?.name || '—'}</p>
              </div>
            </div>
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
            <p className="text-xs text-[var(--slate-500)] -mt-2">
              A Student ID (e.g. HMP0001) will be generated automatically on save.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Section">
                <Select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value, class: '' })}>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </Select>
              </Field>
              <Field label="Gender">
                <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </Field>
            </div>
            <Field label="Class">
              <Select required value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
                <option value="">Select a class</option>
                {classes.filter((c) => c.section === form.section).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ''}</option>
                ))}
              </Select>
            </Field>
            {form.section === 'secondary' && (
              <Field label="Department (Senior Secondary only — optional for JSS)">
                <Input placeholder="e.g. Science, Arts, Commercial" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </Field>
            )}
            <Field label="Date of birth">
              <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            </Field>

            {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}

            <Button type="submit" variant="brass" className="w-full" disabled={creating}>
              {creating ? 'Creating…' : 'Create student account'}
            </Button>
          </form>
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.firstName} ${editing.lastName}` : ''}>
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="flex items-center gap-4">
              {editing.passportPhoto ? (
                <img
                  src={editing.passportPhoto}
                  alt={`${editing.firstName} ${editing.lastName}`}
                  className="w-16 h-16 rounded-full object-cover border border-[var(--paper-200)] shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--paper-200)] flex items-center justify-center shrink-0">
                  <UserIcon size={26} className="text-[var(--slate-500)]" />
                </div>
              )}
              <div>
                <label className="inline-block text-sm font-medium text-[var(--brass-600)] hover:underline cursor-pointer">
                  {uploadingPhoto ? 'Uploading…' : 'Upload passport photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPhoto}
                    onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                  />
                </label>
                <p className="text-xs text-[var(--slate-500)]">JPG or PNG, under 5MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="First name"><Input required value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} /></Field>
              <Field label="Last name"><Input required value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} /></Field>
            </div>
            <Field label="Middle name"><Input value={editForm.middleName} onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of birth"><Input type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} /></Field>
              <Field label="Gender">
                <Select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Section">
                <Select value={editForm.section} onChange={(e) => setEditForm({ ...editForm, section: e.target.value, class: '' })}>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </Select>
              </Field>
              <Field label="Class">
                <Select required value={editForm.class} onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}>
                  <option value="">Select a class</option>
                  {classes.filter((c) => c.section === editForm.section).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ''}</option>
                  ))}
                </Select>
              </Field>
            </div>
            {editForm.section === 'secondary' && (
              <Field label="Department (Senior Secondary only — optional for JSS)">
                <Input placeholder="e.g. Science, Arts, Commercial" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
              </Field>
            )}
            <Field label="Address"><Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Blood group"><Input value={editForm.bloodGroup} onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })} /></Field>
              <Field label="Genotype"><Input value={editForm.genotype} onChange={(e) => setEditForm({ ...editForm, genotype: e.target.value })} /></Field>
              <Field label="Allergies"><Input value={editForm.allergies} onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })} /></Field>
            </div>
            <Field label="Status">
              <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                {STUDENT_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
              </Select>
            </Field>

            {editError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{editError}</p>}

            <div className="flex gap-3">
              <Button type="submit" variant="brass" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              <button type="button" onClick={handleDelete} disabled={saving} className="px-3 text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md" aria-label="Delete student">
                <Trash2 size={18} />
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}