import { useEffect, useState, useCallback, useRef } from 'react';
import { leadershipApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, EmptyState, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Select, Textarea, Modal } from '../../../components/ui/Form';
import { Plus, Trash2, Pencil, ImagePlus } from 'lucide-react';
import { ApiError } from '../../../api/client';

const CATEGORY_LABELS = {
  proprietor: "Proprietor's Message",
  principal: "Principal's Message",
  management: 'Management Team',
};

const emptyForm = { fullName: '', position: '', category: 'management', message: '', biography: '' };

export default function Leadership() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    leadershipApi.getAll({ limit: 100, sort: 'displayOrder' }).then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingId(item._id);
    setForm({
      fullName: item.fullName || '',
      position: item.position || '',
      category: item.category || 'management',
      message: item.message || '',
      biography: item.biography || '',
    });
    setFile(null);
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.fullName || !form.position) { setFormError('Full name and position are required.'); return; }
    setFormError(''); setSaving(true);
    try {
      let id = editingId;
      if (editingId) {
        await leadershipApi.update(editingId, form);
      } else {
        const res = await leadershipApi.create(form);
        id = res.data._id;
      }
      if (file && id) {
        const fd = new FormData();
        fd.append('photo', file);
        await leadershipApi.uploadPhoto(id, fd);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save profile.');
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this leadership profile? This removes it from the public Leadership page.')) return;
    await leadershipApi.remove(id);
    load();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Website CMS"
        title="Leadership Management"
        action={<Button variant="brass" onClick={openCreate}><Plus size={16} /> Add Profile</Button>}
      />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Manage the Proprietor's message, Principal's message, and management team profiles shown on the public Leadership page.
      </p>

      {loading ? (
        <p className="text-sm text-[var(--slate-500)]">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState title="No leadership profiles yet" body="Add the Proprietor, Principal, and management team members." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item._id}>
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-[var(--paper-200)] shrink-0">
                  {item.photo ? (
                    <img src={item.photo} alt={item.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-[var(--slate-500)]">
                      {item.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--ink-900)] truncate">{item.fullName}</p>
                  <p className="text-xs text-[var(--slate-500)] truncate">{item.position}</p>
                  <Badge tone="brass">{CATEGORY_LABELS[item.category]}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="ghost" className="!px-2 !py-1 text-xs flex-1" onClick={() => openEdit(item)}>
                  <Pencil size={13} /> Edit
                </Button>
                <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => remove(item._id)}>
                  <Trash2 size={13} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Profile' : 'Add Profile'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Full Name"><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></Field>
          <Field label="Position / Title"><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Proprietor, Principal, Board Member" /></Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="proprietor">Proprietor's Message</option>
              <option value="principal">Principal's Message</option>
              <option value="management">Management Team</option>
            </Select>
          </Field>
          {(form.category === 'proprietor' || form.category === 'principal') ? (
            <Field label="Message"><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
          ) : (
            <Field label="Short Biography"><Textarea rows={4} value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} /></Field>
          )}
          <Field label="Photo (optional)">
            <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] border border-dashed border-[var(--paper-200)] rounded-md px-3 py-2 cursor-pointer hover:border-[var(--brass-500)]">
              <ImagePlus size={16} />
              {file ? file.name : 'Choose a photo'}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </Field>
          {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
          <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</Button>
        </form>
      </Modal>
    </div>
  );
}
