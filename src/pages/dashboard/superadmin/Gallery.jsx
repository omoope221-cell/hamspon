import { useEffect, useState, useCallback, useRef } from 'react';
import { galleryApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, EmptyState } from '../../../components/ui/Primitives';
import { Field, Input, Modal } from '../../../components/ui/Form';
import { Plus, Trash2, Star, ImagePlus } from 'lucide-react';
import { ApiError } from '../../../api/client';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('General');
  const fileInputRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    galleryApi.getAll({ limit: 200, sort: '-createdAt' }).then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openUpload() {
    setFile(null);
    setCaption('');
    setCategory('General');
    setFormError('');
    setModalOpen(true);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) { setFormError('Please choose an image.'); return; }
    setFormError(''); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      fd.append('category', category || 'General');
      await galleryApi.upload(fd);
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to upload image.');
    } finally { setSaving(false); }
  }

  async function toggleFeatured(img) {
    await galleryApi.update(img._id, { featured: !img.featured });
    load();
  }

  async function remove(id) {
    if (!window.confirm('Delete this image? This removes it from the public Gallery.')) return;
    await galleryApi.remove(id);
    load();
  }

  const categories = [...new Set(items.map((i) => i.category || 'General'))];

  return (
    <div>
      <PageHeader
        eyebrow="Website CMS"
        title="Gallery"
        action={<Button variant="brass" onClick={openUpload}><Plus size={16} /> Upload image</Button>}
      />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Uploaded images appear on the public Gallery page immediately, grouped by category.
      </p>

      {loading ? (
        <p className="text-sm text-[var(--slate-500)]">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState title="No images yet" body="Upload your first photo — it'll appear on the public Gallery page immediately." />
      ) : (
        <>
          {categories.map((cat) => (
            <div key={cat} className="mb-8">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-[var(--brass-500)] mb-3">{cat}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.filter((i) => (i.category || 'General') === cat).map((img) => (
                  <div key={img._id} className="bg-[var(--paper-50)] border border-[var(--paper-200)] rounded-lg shadow-sm p-2">
                    <div className="img-frame relative h-32 rounded-md">
                      <img src={img.image} alt={img.caption || ''} className="img-zoom h-full w-full object-cover" />
                      <button
                        onClick={() => toggleFeatured(img)}
                        className={`absolute top-1.5 right-1.5 rounded-full p-1 bg-white/90 ${img.featured ? 'text-[var(--brass-500)]' : 'text-[var(--slate-500)]'}`}
                        title="Toggle featured"
                      >
                        <Star size={13} fill={img.featured ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 px-1">
                      <p className="text-xs text-[var(--slate-600)] truncate">{img.caption || '—'}</p>
                      <button onClick={() => remove(img._id)} className="text-[var(--slate-500)] hover:text-[var(--rust-500)] shrink-0" aria-label="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload image">
        <form onSubmit={handleUpload} className="space-y-4">
          <Field label="Image">
            <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] border border-dashed border-[var(--paper-200)] rounded-md px-3 py-2 cursor-pointer hover:border-[var(--brass-500)]">
              <ImagePlus size={16} />
              {file ? file.name : 'Choose an image'}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </Field>
          <Field label="Caption (optional)"><Input value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
          <Field label="Category"><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Sports Day, Facilities, Graduation" /></Field>
          {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
          <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Uploading…' : 'Upload'}</Button>
        </form>
      </Modal>
    </div>
  );
}
