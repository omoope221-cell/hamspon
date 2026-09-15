import { useEffect, useState, useCallback } from 'react';
import { classesApi, subjectsApi, sessionsApi, staffApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Select, Modal } from '../../../components/ui/Form';
import { Plus, Trash2 } from 'lucide-react';
import { ApiError } from '../../../api/client';

const BLANK_EDIT = { name: '', section: 'primary', arm: '', capacity: 40, classTeacher: '', session: '', subjectTeachers: [] };

export default function AdminClasses() {
  const [tab, setTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', section: 'primary', arm: '', session: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', section: 'both' });

  // Edit / delete a class
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(BLANK_EDIT);
  const [editError, setEditError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      classesApi.getAll({ limit: 200 }),
      subjectsApi.getAll({ limit: 200 }),
      sessionsApi.getAll({ limit: 20 }),
      staffApi.getAll({ limit: 200 }),
    ])
      .then(([c, s, ses, st]) => {
        setClasses(c.data);
        setSubjects(s.data);
        setSessions(ses.data);
        setStaff(st.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreateClass(e) {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      await classesApi.create(classForm);
      setModalOpen(false);
      setClassForm({ name: '', section: 'primary', arm: '', session: '' });
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create class.');
    } finally { setSaving(false); }
  }

  async function handleCreateSubject(e) {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      await subjectsApi.create(subjectForm);
      setModalOpen(false);
      setSubjectForm({ name: '', code: '', section: 'both' });
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create subject.');
    } finally { setSaving(false); }
  }

  function openEdit(row) {
    setEditing(row);
    setEditForm({
      name: row.name || '',
      section: row.section || 'primary',
      arm: row.arm || '',
      capacity: row.capacity || 40,
      classTeacher: row.classTeacher?._id || row.classTeacher || '',
      session: row.session?._id || row.session || '',
      subjectTeachers: (row.subjectTeachers || []).map((st) => ({
        subject: st.subject?._id || st.subject || '',
        teacher: st.teacher?._id || st.teacher || '',
      })),
    });
    setEditError('');
  }

  function addSubjectTeacherRow() {
    setEditForm((f) => ({ ...f, subjectTeachers: [...f.subjectTeachers, { subject: '', teacher: '' }] }));
  }
  function updateSubjectTeacherRow(index, field, value) {
    setEditForm((f) => ({
      ...f,
      subjectTeachers: f.subjectTeachers.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }));
  }
  function removeSubjectTeacherRow(index) {
    setEditForm((f) => ({ ...f, subjectTeachers: f.subjectTeachers.filter((_, i) => i !== index) }));
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setEditError(''); setSaving(true);
    const pairs = editForm.subjectTeachers.filter((r) => r.subject && r.teacher);
    try {
      await classesApi.update(editing._id, {
        name: editForm.name,
        section: editForm.section,
        arm: editForm.arm || null,
        capacity: Number(editForm.capacity),
        classTeacher: editForm.classTeacher || null,
        session: editForm.session,
        subjectTeachers: pairs,
        // Keep the plain `subjects` list (used elsewhere for headcounts)
        // in sync with whichever subjects now have an assigned teacher.
        subjects: [...new Set(pairs.map((r) => r.subject))],
      });
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update class.');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!window.confirm(`Permanently delete ${editing.name}${editing.arm ? ` ${editing.arm}` : ''}? Students currently in this class will keep pointing to a deleted class — reassign them first if any are enrolled.`)) return;
    setSaving(true);
    try {
      await classesApi.remove(editing._id);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to delete class.');
    } finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Register — Academics"
        title="Classes & Subjects"
        action={<Button variant="brass" onClick={() => setModalOpen(true)}><Plus size={16} /> Add {tab === 'classes' ? 'class' : 'subject'}</Button>}
      />

      <div className="flex gap-1 mb-4 border-b border-[var(--paper-200)]">
        {['classes', 'subjects'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-[var(--brass-500)] text-[var(--ink-900)]' : 'border-transparent text-[var(--slate-500)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card>
        {tab === 'classes' ? (
          <>
            <DataTable
              loading={loading}
              rows={classes}
              emptyTitle="No classes set up yet"
              onRowClick={openEdit}
              columns={[
                { key: 'name', header: 'Class', render: (r) => `${r.name}${r.arm ? ` ${r.arm}` : ''}` },
                { key: 'section', header: 'Section', render: (r) => <Badge tone={r.section === 'primary' ? 'sage' : 'brass'}>{r.section}</Badge> },
                { key: 'teacher', header: 'Class Teacher', render: (r) => r.classTeacher ? `${r.classTeacher.firstName} ${r.classTeacher.lastName}` : '—' },
                { key: 'subjects', header: 'Subjects', render: (r) => r.subjects?.length || 0 },
                { key: 'capacity', header: 'Capacity', render: (r) => r.capacity },
              ]}
            />
            <p className="text-xs text-[var(--slate-500)] mt-3">Click a row to edit, assign a Class Teacher, or remove a class.</p>
          </>
        ) : (
          <DataTable
            loading={loading}
            rows={subjects}
            emptyTitle="No subjects set up yet"
            columns={[
              { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
              { key: 'name', header: 'Subject' },
              { key: 'section', header: 'Section', render: (r) => <Badge>{r.section}</Badge> },
              { key: 'teachers', header: 'Teachers', render: (r) => r.teachers?.length || 0 },
            ]}
          />
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={tab === 'classes' ? 'New class' : 'New subject'}>
        {tab === 'classes' ? (
          <form onSubmit={handleCreateClass} className="space-y-4">
            <Field label="Class name"><Input required placeholder="e.g. JSS 1" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Section">
                <Select value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </Select>
              </Field>
              <Field label="Arm (optional)"><Input placeholder="A" value={classForm.arm} onChange={(e) => setClassForm({ ...classForm, arm: e.target.value })} /></Field>
            </div>
            <Field label="Session">
              <Select required value={classForm.session} onChange={(e) => setClassForm({ ...classForm, session: e.target.value })}>
                <option value="">Select session</option>
                {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </Select>
            </Field>
            {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
            <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Create class'}</Button>
          </form>
        ) : (
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <Field label="Subject name"><Input required value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} /></Field>
            <Field label="Code"><Input required placeholder="e.g. MTH101" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} /></Field>
            <Field label="Section">
              <Select value={subjectForm.section} onChange={(e) => setSubjectForm({ ...subjectForm, section: e.target.value })}>
                <option value="both">Both</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </Select>
            </Field>
            {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
            <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Create subject'}</Button>
          </form>
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.name}${editing.arm ? ` ${editing.arm}` : ''}` : ''}>
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Field label="Class name"><Input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Section">
                <Select value={editForm.section} onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </Select>
              </Field>
              <Field label="Arm (optional)"><Input value={editForm.arm} onChange={(e) => setEditForm({ ...editForm, arm: e.target.value })} /></Field>
            </div>
            <Field label="Capacity"><Input type="number" min="1" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} /></Field>
            <Field label="Class Teacher">
              <Select value={editForm.classTeacher} onChange={(e) => setEditForm({ ...editForm, classTeacher: e.target.value })}>
                <option value="">None assigned</option>
                {staff.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.role.replace('_', ' ')})</option>)}
              </Select>
            </Field>
            <Field label="Session">
              <Select required value={editForm.session} onChange={(e) => setEditForm({ ...editForm, session: e.target.value })}>
                <option value="">Select session</option>
                {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </Select>
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--ink-900)]">Subjects &amp; Subject Teachers</span>
                <button type="button" onClick={addSubjectTeacherRow} className="text-xs text-[var(--brass-600)] hover:underline">+ Add subject</button>
              </div>
              <p className="text-xs text-[var(--slate-500)] mb-2">
                Only the teacher assigned here for a subject can enter that subject's scores for this class.
              </p>
              <div className="space-y-2">
                {editForm.subjectTeachers.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <Select value={row.subject} onChange={(e) => updateSubjectTeacherRow(i, 'subject', e.target.value)}>
                      <option value="">Select subject</option>
                      {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </Select>
                    <Select value={row.teacher} onChange={(e) => updateSubjectTeacherRow(i, 'teacher', e.target.value)}>
                      <option value="">Select teacher</option>
                      {staff.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
                    </Select>
                    <button type="button" onClick={() => removeSubjectTeacherRow(i)} className="text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md p-2" aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {!editForm.subjectTeachers.length && <p className="text-xs text-[var(--slate-500)]">No subjects assigned to this class yet.</p>}
              </div>
            </div>

            {editError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{editError}</p>}

            <div className="flex gap-3">
              <Button type="submit" variant="brass" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              <button type="button" onClick={handleDelete} disabled={saving} className="px-3 text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md" aria-label="Delete class" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
