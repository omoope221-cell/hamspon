import { useEffect, useState } from 'react';
import { siteSettingsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Spinner } from '../../../components/ui/Primitives';
import { Field, Input, Textarea, Select } from '../../../components/ui/Form';
import { Plus, Trash2, ImagePlus, Save, X } from 'lucide-react';
import { ApiError } from '../../../api/client';

function ListEditor({ label, items, onChange, placeholder }) {
  function update(i, value) { const next = [...items]; next[i] = value; onChange(next); }
  function add() { onChange([...items, '']); }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }
  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((val, i) => (
          <div key={i} className="flex gap-2">
            <Input value={val} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} />
            <button type="button" onClick={() => remove(i)} className="text-[var(--slate-500)] hover:text-[var(--rust-500)] px-2"><X size={16} /></button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-xs text-[var(--brass-500)] hover:underline flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      </div>
    </Field>
  );
}

export default function AdmissionsManagement() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    siteSettingsApi.get().then((r) => setSettings(r.data)).finally(() => setLoading(false));
  }, []);

  function setAdmissions(patch) {
    setSettings((s) => ({ ...s, admissions: { ...s.admissions, ...patch } }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const res = await siteSettingsApi.update({ admissions: settings.admissions });
      setSettings(res.data);
      setMessage('Saved — the public Admissions page is up to date.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally { setSaving(false); }
  }

  async function handleBannerUpload(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    const res = await siteSettingsApi.uploadImage('admissionsBanner', fd);
    setSettings(res.data);
  }

  function updateForm(i, patch) {
    const next = [...settings.admissions.forms];
    next[i] = { ...next[i], ...patch };
    setAdmissions({ forms: next });
  }

  if (loading || !settings) return <div className="flex items-center justify-center py-24"><Spinner size={28} /></div>;
  const a = settings.admissions;

  return (
    <div>
      <PageHeader eyebrow="Website CMS" title="Admissions" />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">Controls the public Admissions page.</p>

      <form onSubmit={handleSave} className="space-y-6">
        {(message || error) && (
          <div className={`rounded-md px-3 py-2 text-sm ${error ? 'bg-[var(--rust-100)] text-[var(--rust-500)]' : 'bg-[var(--sage-100)] text-[var(--sage-500)]'}`}>
            {error || message}
          </div>
        )}

        <Card eyebrow="Status" title="Admission Status">
          <div className="mt-2 max-w-xs">
            <Field label="Current status">
              <Select value={a.status} onChange={(e) => setAdmissions({ status: e.target.value })}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Admission dates note"><Textarea rows={2} value={a.datesNote} onChange={(e) => setAdmissions({ datesNote: e.target.value })} placeholder="e.g. Applications for 2026/2027 open January 15 – March 30" /></Field>
          </div>
        </Card>

        <Card eyebrow="Payment & Exam" title="Admission Settings">
          <div className="mt-2 space-y-4">
            <p className="text-xs text-[var(--slate-500)]">
              Payment and the entrance exam both happen physically at the school — there is no online payment. These
              values are sent automatically in the instructions email every applicant receives when they submit their form.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Admission fee amount (₦)">
                <Input
                  type="number"
                  min="0"
                  value={a.admissionFeeAmount}
                  onChange={(e) => setAdmissions({ admissionFeeAmount: Number(e.target.value) })}
                />
              </Field>
              <Field label="Date to come to the school">
                <Input type="date" value={a.schoolVisitDate ? a.schoolVisitDate.slice(0, 10) : ''} onChange={(e) => setAdmissions({ schoolVisitDate: e.target.value })} />
              </Field>
              <Field label="Entrance exam date">
                <Input type="date" value={a.examDate ? a.examDate.slice(0, 10) : ''} onChange={(e) => setAdmissions({ examDate: e.target.value })} />
              </Field>
              <Field label="Exam duration (minutes)">
                <Input type="number" min="1" value={a.examDurationMinutes} onChange={(e) => setAdmissions({ examDurationMinutes: Number(e.target.value) })} />
              </Field>
              <Field label="Exam start time">
                <Input type="time" value={a.examStartTime} onChange={(e) => setAdmissions({ examStartTime: e.target.value })} />
              </Field>
              <Field label="Exam end time">
                <Input type="time" value={a.examEndTime} onChange={(e) => setAdmissions({ examEndTime: e.target.value })} />
              </Field>
            </div>
            <Field label="Instructions (shown in the applicant's email)">
              <Textarea rows={2} value={a.instructions} onChange={(e) => setAdmissions({ instructions: e.target.value })} />
            </Field>
            <p className="text-xs text-[var(--slate-500)]">
              This amount and schedule apply to every new applicant from the moment you save. Applicants who already
              applied keep the amount/date/time that was active when they submitted.
            </p>
          </div>
        </Card>

        <Card eyebrow="Content" title="Requirements & Process">
          <div className="mt-2 space-y-4">
            <ListEditor label="Admission requirements" items={a.requirements} onChange={(v) => setAdmissions({ requirements: v })} placeholder="e.g. Birth certificate" />
            <ListEditor label="Admission process (step by step)" items={a.process} onChange={(v) => setAdmissions({ process: v })} placeholder="e.g. Submit online application" />
          </div>
        </Card>

        <Card eyebrow="Downloads" title="Downloadable Forms">
          <div className="mt-2 space-y-3">
            {a.forms.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input placeholder="Label (e.g. Application Form PDF)" value={f.label || ''} onChange={(e) => updateForm(i, { label: e.target.value })} />
                <Input placeholder="URL" value={f.url || ''} onChange={(e) => updateForm(i, { url: e.target.value })} />
                <button type="button" onClick={() => setAdmissions({ forms: a.forms.filter((_, idx) => idx !== i) })} className="text-[var(--slate-500)] hover:text-[var(--rust-500)] px-2"><Trash2 size={15} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setAdmissions({ forms: [...a.forms, { label: '', url: '' }] })} className="text-xs text-[var(--brass-500)] hover:underline flex items-center gap-1">
              <Plus size={12} /> Add form
            </button>
          </div>
        </Card>

        <Card eyebrow="Visual" title="Admissions Banner">
          <div className="mt-2">
            {a.banner && <img src={a.banner} alt="Admissions banner" className="h-32 w-full max-w-md object-cover rounded-md mb-3" />}
            <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] border border-dashed border-[var(--paper-200)] rounded-md px-3 py-2 cursor-pointer hover:border-[var(--brass-500)] w-fit">
              <ImagePlus size={16} /> Upload banner image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerUpload(e.target.files?.[0])} />
            </label>
          </div>
        </Card>

        <div className="sticky bottom-4 flex justify-end">
          <Button type="submit" variant="brass" disabled={saving} className="shadow-lg">
            <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}