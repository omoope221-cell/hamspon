import { useEffect, useState, useCallback } from 'react';
import { faqApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Badge, EmptyState } from '../../../components/ui/Primitives';
import { Field, Input, Textarea, Select, Modal } from '../../../components/ui/Form';
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { ApiError } from '../../../api/client';

const BLANK = { question: '', answer: '', category: 'General', status: 'published' };

export default function FaqManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const load = useCallback(() => {
    setLoading(true);
    faqApi.getAll().then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(BLANK);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(f) {
    setEditingId(f._id);
    setForm({ question: f.question, answer: f.answer, category: f.category || 'General', status: f.status || 'published' });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      if (editingId) await faqApi.update(editingId, form);
      else await faqApi.create(form);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save FAQ.');
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm('Delete this FAQ?')) return;
    await faqApi.remove(id);
    load();
  }

  async function toggleStatus(f) {
    await faqApi.update(f._id, { status: f.status === 'published' ? 'draft' : 'published' });
    load();
  }

  async function move(index, direction) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await faqApi.reorder(next.map((f) => f._id));
  }

  const categories = ['All', ...new Set(items.map((f) => f.category || 'General'))];
  const filtered = categoryFilter === 'All' ? items : items.filter((f) => (f.category || 'General') === categoryFilter);

  return (
    <div>
      <PageHeader
        eyebrow="Website CMS"
        title="FAQ Management"
        action={<Button variant="brass" onClick={openCreate}><Plus size={16} /> Add FAQ</Button>}
      />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Published FAQs appear instantly on the public <code>/faq</code> page, in this order.
      </p>

      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                categoryFilter === cat ? 'bg-[var(--brass-500)] border-[var(--brass-500)] text-white' : 'border-[var(--paper-200)] text-[var(--slate-600)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--slate-500)]">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No FAQs yet" body="Add your first question — it'll appear on the public FAQ page immediately." />
      ) : (
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <Card key={f._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-[var(--ink-900)]">{f.question}</h3>
                  </div>
                  <p className="text-sm text-[var(--slate-600)] line-clamp-2">{f.answer}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge>{f.category || 'General'}</Badge>
                    <Badge tone={f.status === 'published' ? 'sage' : 'slate'}>{f.status}</Badge>
                    <button onClick={() => toggleStatus(f)} className="text-[10px] text-[var(--brass-500)] hover:underline">
                      {f.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {categoryFilter === 'All' && (
                    <>
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="text-[var(--slate-500)] hover:text-[var(--ink-900)] disabled:opacity-30" aria-label="Move up"><ChevronUp size={16} /></button>
                      <button onClick={() => move(i, 1)} disabled={i === filtered.length - 1} className="text-[var(--slate-500)] hover:text-[var(--ink-900)] disabled:opacity-30" aria-label="Move down"><ChevronDown size={16} /></button>
                    </>
                  )}
                  <button onClick={() => openEdit(f)} className="text-[var(--slate-500)] hover:text-[var(--ink-900)]" aria-label="Edit"><Pencil size={15} /></button>
                  <button onClick={() => remove(f._id)} className="text-[var(--slate-500)] hover:text-[var(--rust-500)]" aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit FAQ' : 'Add FAQ'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Question"><Input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></Field>
          <Field label="Answer"><Textarea required rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Admissions, Fees" /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
          </div>
          {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
          <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add FAQ'}</Button>
        </form>
      </Modal>
    </div>
  );
}
