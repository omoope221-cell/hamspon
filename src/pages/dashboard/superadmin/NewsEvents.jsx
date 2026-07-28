import { useEffect, useState, useCallback } from 'react';
import { newsEventsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Select, Textarea, Modal } from '../../../components/ui/Form';
import { Plus, Trash2 } from 'lucide-react';
import { ApiError } from '../../../api/client';

const BLANK = {
  type: 'news', title: '', summary: '', content: '', status: 'published', featured: false,
  eventDate: '', eventTime: '', location: '', publishedAt: '',
};

export default function AdminNewsEvents() {
  const [tab, setTab] = useState('news');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(BLANK);
  const [editError, setEditError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    newsEventsApi.getAll({ type: tab, limit: 100, sort: '-publishedAt' }).then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setForm({ ...BLANK, type: tab });
    setImageFile(null);
    setFormError('');
    setModalOpen(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (imageFile) fd.append('image', imageFile);
      await newsEventsApi.create(fd);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to publish.');
    } finally { setSaving(false); }
  }

  function openEdit(row) {
    setEditing(row);
    setEditForm({
      type: row.type, title: row.title, summary: row.summary || '', content: row.content,
      status: row.status, featured: row.featured,
      eventDate: row.eventDate ? row.eventDate.slice(0, 10) : '',
      eventTime: row.eventTime || '', location: row.location || '',
      publishedAt: row.publishedAt ? row.publishedAt.slice(0, 10) : '',
    });
    setEditError('');
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setEditError(''); setSaving(true);
    try {
      await newsEventsApi.update(editing._id, editForm);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to save changes.');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!window.confirm(`Permanently delete "${editing.title}"?`)) return;
    setSaving(true);
    try {
      await newsEventsApi.remove(editing._id);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to delete.');
    } finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Public Website"
        title="News & Events"
        action={<Button variant="brass" onClick={openAdd}><Plus size={16} /> Add {tab === 'news' ? 'news' : 'event'}</Button>}
      />

      <div className="flex gap-1 mb-4 border-b border-[var(--paper-200)]">
        {['news', 'event'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-[var(--brass-500)] text-[var(--ink-900)]' : 'border-transparent text-[var(--slate-500)]'}`}
          >
            {t === 'news' ? 'News' : 'Events'}
          </button>
        ))}
      </div>

      <Card>
        <DataTable
          loading={loading}
          rows={items}
          emptyTitle={`No ${tab === 'news' ? 'news' : 'events'} published yet`}
          onRowClick={openEdit}
          columns={[
            { key: 'title', header: 'Title', render: (r) => r.title },
            ...(tab === 'event' ? [{ key: 'eventDate', header: 'Date', render: (r) => r.eventDate ? new Date(r.eventDate).toLocaleDateString() : '—' }] : [{ key: 'publishedAt', header: 'Published', render: (r) => r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : '—' }]),
            { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'published' ? 'sage' : 'slate'}>{r.status}</Badge> },
            { key: 'featured', header: '', render: (r) => r.featured && <Badge tone="brass">Featured</Badge> },
          ]}
        />
        <p className="text-xs text-[var(--slate-500)] mt-3">Click a row to edit or delete.</p>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Add ${form.type === 'news' ? 'news' : 'an event'}`}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="news">News</option>
              <option value="event">Event</option>
            </Select>
          </Field>
          <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Summary (optional — short teaser shown in the list)">
            <Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </Field>
          <Field label="Full content"><Textarea rows={5} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          <Field label="Image (optional)">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
          </Field>

          {form.type === 'event' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Event date"><Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></Field>
              <Field label="Event time"><Input placeholder="e.g. 10:00 AM" value={form.eventTime} onChange={(e) => setForm({ ...form, eventTime: e.target.value })} /></Field>
              <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            </div>
          )}
          {form.type === 'news' && (
            <Field label="Publish date"><Input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} /></Field>
          )}

          <div className="flex items-center gap-4">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] mt-6">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured (shown first)
            </label>
          </div>

          {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
          <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Publishing…' : 'Publish'}</Button>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit "${editing.title}"` : ''}>
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Field label="Title"><Input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></Field>
            <Field label="Summary"><Textarea rows={2} value={editForm.summary} onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })} /></Field>
            <Field label="Full content"><Textarea rows={5} required value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} /></Field>

            {editForm.type === 'event' && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Event date"><Input type="date" value={editForm.eventDate} onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })} /></Field>
                <Field label="Event time"><Input value={editForm.eventTime} onChange={(e) => setEditForm({ ...editForm, eventTime: e.target.value })} /></Field>
                <Field label="Location"><Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} /></Field>
              </div>
            )}
            {editForm.type === 'news' && (
              <Field label="Publish date"><Input type="date" value={editForm.publishedAt} onChange={(e) => setEditForm({ ...editForm, publishedAt: e.target.value })} /></Field>
            )}

            <div className="flex items-center gap-4">
              <Field label="Status">
                <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] mt-6">
                <input type="checkbox" checked={editForm.featured} onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })} />
                Featured
              </label>
            </div>

            {editError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{editError}</p>}

            <div className="flex gap-3">
              <Button type="submit" variant="brass" className="flex-1" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              <button type="button" onClick={handleDelete} disabled={saving} className="px-3 text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md" aria-label="Delete" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
