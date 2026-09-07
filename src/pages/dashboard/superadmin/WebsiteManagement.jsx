import { useEffect, useState } from 'react';
import { siteSettingsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Spinner } from '../../../components/ui/Primitives';
import { Field, Input, Textarea } from '../../../components/ui/Form';
import { Plus, Trash2, ImagePlus, Save, X } from 'lucide-react';
import { ApiError } from '../../../api/client';

function ListEditor({ label, items, onChange, placeholder }) {
  function update(i, value) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }
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

export default function WebsiteManagement() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    siteSettingsApi.get().then((r) => setSettings(r.data)).finally(() => setLoading(false));
  }, []);

  function set(path, value) {
    setSettings((s) => {
      const next = structuredClone(s);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const res = await siteSettingsApi.update(settings);
      setSettings(res.data);
      setMessage('Saved — changes are live on the public website.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save settings.');
    } finally { setSaving(false); }
  }

  async function handleImageUpload(target, file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await siteSettingsApi.uploadImage(target, fd);
      setSettings(res.data);
      setMessage('Image uploaded.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload image.');
    }
  }

  async function handleVideoUpload(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('video', file);
    setError(''); setUploadingVideo(true);
    try {
      const res = await siteSettingsApi.uploadVideo(fd);
      setSettings(res.data);
      setMessage('Tour video uploaded.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload video.');
    } finally {
      setUploadingVideo(false);
    }
  }

  async function removeHeroImage(index) {
    const res = await siteSettingsApi.removeHeroImage(index);
    setSettings(res.data);
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-24"><Spinner size={28} /></div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Website CMS" title="Website Management" />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Everything here reflects instantly on the public website — no code changes needed.
      </p>

      <form onSubmit={handleSave} className="space-y-6">
        {(message || error) && (
          <div className={`rounded-md px-3 py-2 text-sm ${error ? 'bg-[var(--rust-100)] text-[var(--rust-500)]' : 'bg-[var(--sage-100)] text-[var(--sage-500)]'}`}>
            {error || message}
          </div>
        )}

        <Card eyebrow="Identity" title="School Identity & Contact">
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <Field label="School name"><Input value={settings.schoolName} onChange={(e) => set('schoolName', e.target.value)} /></Field>
            <Field label="Motto"><Input value={settings.motto} onChange={(e) => set('motto', e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={settings.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="Admissions email"><Input type="email" value={settings.admissionsEmail} onChange={(e) => set('admissionsEmail', e.target.value)} /></Field>
            <Field label="WhatsApp number"><Input value={settings.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} /></Field>
            <Field label="Office hours"><Input value={settings.officeHours || ''} onChange={(e) => set('officeHours', e.target.value)} /></Field>
            <Field label="Website URL"><Input value={settings.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} /></Field>
            <Field label="Contact form recipient email"><Input type="email" value={settings.contactFormRecipientEmail || ''} onChange={(e) => set('contactFormRecipientEmail', e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Address"><Textarea rows={2} value={settings.address || ''} onChange={(e) => set('address', e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Google Maps embed URL"><Input value={settings.googleMapsEmbed || ''} onChange={(e) => set('googleMapsEmbed', e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <Field label="School tour video" hint="Upload an .mp4 file (max 100MB). Shown on the public Gallery page.">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded-md border border-[var(--paper-200)] text-sm hover:bg-[var(--paper-100)]">
                  {uploadingVideo ? 'Uploading…' : settings.tourVideoUrl ? 'Replace video' : 'Upload video'}
                  <input type="file" accept="video/mp4" className="hidden" disabled={uploadingVideo} onChange={(e) => handleVideoUpload(e.target.files?.[0])} />
                </label>
                {settings.tourVideoUrl && !uploadingVideo && (
                  <span className="text-xs text-[var(--sage-600)]">✓ Video uploaded</span>
                )}
              </div>
              {settings.tourVideoUrl && (
                <video src={settings.tourVideoUrl} controls className="mt-3 w-full max-w-sm rounded-lg border border-[var(--paper-200)]" />
              )}
            </Field>
          </div>
          <div className="mt-4">
            <ListEditor label="Phone numbers" items={settings.phones} onChange={(v) => set('phones', v)} placeholder="+234 800 000 0000" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Facebook"><Input value={settings.socialLinks?.facebook || ''} onChange={(e) => set('socialLinks.facebook', e.target.value)} /></Field>
            <Field label="Twitter / X"><Input value={settings.socialLinks?.twitter || ''} onChange={(e) => set('socialLinks.twitter', e.target.value)} /></Field>
            <Field label="Instagram"><Input value={settings.socialLinks?.instagram || ''} onChange={(e) => set('socialLinks.instagram', e.target.value)} /></Field>
            <Field label="LinkedIn"><Input value={settings.socialLinks?.linkedin || ''} onChange={(e) => set('socialLinks.linkedin', e.target.value)} /></Field>
            <Field label="YouTube"><Input value={settings.socialLinks?.youtube || ''} onChange={(e) => set('socialLinks.youtube', e.target.value)} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-[var(--ink-900)] mb-2">Logo</p>
              {settings.logo && <img src={settings.logo} alt="Logo" className="h-14 w-14 object-contain mb-2 rounded bg-[var(--paper-100)] p-1" />}
              <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] border border-dashed border-[var(--paper-200)] rounded-md px-3 py-2 cursor-pointer hover:border-[var(--brass-500)] w-fit">
                <ImagePlus size={16} /> Upload logo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('logo', e.target.files?.[0])} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink-900)] mb-2">Favicon</p>
              {settings.favicon && <img src={settings.favicon} alt="Favicon" className="h-8 w-8 object-contain mb-2 rounded bg-[var(--paper-100)] p-1" />}
              <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] border border-dashed border-[var(--paper-200)] rounded-md px-3 py-2 cursor-pointer hover:border-[var(--brass-500)] w-fit">
                <ImagePlus size={16} /> Upload favicon
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('favicon', e.target.files?.[0])} />
              </label>
            </div>
          </div>
        </Card>

        <Card eyebrow="Homepage" title="Hero Section">
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <Field label="Hero title"><Input value={settings.hero.title} onChange={(e) => set('hero.title', e.target.value)} /></Field>
            <Field label="Hero button text"><Input value={settings.hero.buttonText} onChange={(e) => set('hero.buttonText', e.target.value)} /></Field>
            <Field label="Hero button link"><Input value={settings.hero.buttonLink} onChange={(e) => set('hero.buttonLink', e.target.value)} /></Field>
            <Field label="Background video URL (optional)"><Input value={settings.hero.backgroundVideo || ''} onChange={(e) => set('hero.backgroundVideo', e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Hero subtitle"><Textarea rows={2} value={settings.hero.subtitle} onChange={(e) => set('hero.subtitle', e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-[var(--ink-900)] mb-2">Background images (rotates automatically)</p>
            <div className="flex flex-wrap gap-3 mb-2">
              {settings.hero.backgroundImages.map((img, i) => (
                <div key={i} className="relative img-frame h-20 w-32 rounded-md">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeHeroImage(i)} className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 text-[var(--rust-500)]"><X size={12} /></button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] border border-dashed border-[var(--paper-200)] rounded-md px-3 py-2 cursor-pointer hover:border-[var(--brass-500)] w-fit">
              <ImagePlus size={16} /> Add hero image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('heroImage', e.target.files?.[0])} />
            </label>
          </div>
        </Card>

        <Card eyebrow="Homepage" title="About, Mission & Values">
          <div className="space-y-4 mt-2">
            <Field label="About the school"><Textarea rows={3} value={settings.about} onChange={(e) => set('about', e.target.value)} /></Field>
            <Field label="Principal's message"><Textarea rows={3} value={settings.principalMessage} onChange={(e) => set('principalMessage', e.target.value)} /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Mission"><Textarea rows={2} value={settings.mission} onChange={(e) => set('mission', e.target.value)} /></Field>
              <Field label="Vision"><Textarea rows={2} value={settings.vision} onChange={(e) => set('vision', e.target.value)} /></Field>
            </div>
            <ListEditor label="Core values" items={settings.coreValues} onChange={(v) => set('coreValues', v)} placeholder="e.g. Integrity" />
          </div>
        </Card>

        <Card eyebrow="Homepage" title="Statistics">
          <p className="text-xs text-[var(--slate-500)] mb-3">
            Shown on both the Home page and the About page — leave a field blank to hide that statistic.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Number of students"><Input placeholder="e.g. 2,500+" value={settings.studentCount || ''} onChange={(e) => set('studentCount', e.target.value)} /></Field>
            <Field label="Years of excellence"><Input placeholder="e.g. 13+" value={settings.yearsOfExcellence || ''} onChange={(e) => set('yearsOfExcellence', e.target.value)} /></Field>
          </div>
        </Card>

        <Card eyebrow="Homepage" title="Testimonials">
          <div className="space-y-4 mt-2">
            {settings.testimonials.map((t, i) => (
              <div key={i} className="border border-[var(--paper-200)] rounded-md p-3 space-y-2">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input placeholder="Name" value={t.name || ''} onChange={(e) => {
                    const next = [...settings.testimonials]; next[i] = { ...next[i], name: e.target.value }; set('testimonials', next);
                  }} />
                  <Input placeholder="Role (e.g. Parent)" value={t.role || ''} onChange={(e) => {
                    const next = [...settings.testimonials]; next[i] = { ...next[i], role: e.target.value }; set('testimonials', next);
                  }} />
                </div>
                <Textarea rows={2} placeholder="Quote" value={t.quote || ''} onChange={(e) => {
                  const next = [...settings.testimonials]; next[i] = { ...next[i], quote: e.target.value }; set('testimonials', next);
                }} />
                <button type="button" onClick={() => set('testimonials', settings.testimonials.filter((_, idx) => idx !== i))} className="text-xs text-[var(--rust-500)] hover:underline flex items-center gap-1">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => set('testimonials', [...settings.testimonials, { name: '', role: '', quote: '' }])} className="text-xs text-[var(--brass-500)] hover:underline flex items-center gap-1">
              <Plus size={12} /> Add testimonial
            </button>
          </div>
        </Card>

        <Card eyebrow="Homepage" title="Call-to-Action Section">
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <Field label="CTA title"><Input value={settings.cta.title} onChange={(e) => set('cta.title', e.target.value)} /></Field>
            <Field label="CTA button text"><Input value={settings.cta.buttonText} onChange={(e) => set('cta.buttonText', e.target.value)} /></Field>
            <Field label="CTA button link"><Input value={settings.cta.buttonLink} onChange={(e) => set('cta.buttonLink', e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <Field label="CTA subtitle"><Textarea rows={2} value={settings.cta.subtitle} onChange={(e) => set('cta.subtitle', e.target.value)} /></Field>
          </div>
        </Card>

        <Card eyebrow="Site-wide" title="Footer">
          <div className="space-y-4 mt-2">
            <Field label="School description"><Textarea rows={2} value={settings.footer.description} onChange={(e) => set('footer.description', e.target.value)} /></Field>
            <Field label="Copyright text"><Input value={settings.footer.copyrightText} onChange={(e) => set('footer.copyrightText', e.target.value)} placeholder="© 2026 Hampsons Group of School. All rights reserved." /></Field>
          </div>
        </Card>

        <Card eyebrow="SEO & Theme" title="Search & Brand Colors">
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <Field label="SEO title"><Input value={settings.seo.title} onChange={(e) => set('seo.title', e.target.value)} /></Field>
            <Field label="SEO keywords"><Input value={settings.seo.keywords} onChange={(e) => set('seo.keywords', e.target.value)} /></Field>
            <Field label="Primary color"><Input type="color" value={settings.theme.primaryColor} onChange={(e) => set('theme.primaryColor', e.target.value)} /></Field>
            <Field label="Secondary color"><Input type="color" value={settings.theme.secondaryColor} onChange={(e) => set('theme.secondaryColor', e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <Field label="SEO description"><Textarea rows={2} value={settings.seo.description} onChange={(e) => set('seo.description', e.target.value)} /></Field>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-[var(--ink-900)] mb-2">Open Graph image</p>
            {settings.seo.ogImage && <img src={settings.seo.ogImage} alt="OG" className="h-20 w-36 object-cover mb-2 rounded" />}
            <label className="flex items-center gap-2 text-sm text-[var(--slate-600)] border border-dashed border-[var(--paper-200)] rounded-md px-3 py-2 cursor-pointer hover:border-[var(--brass-500)] w-fit">
              <ImagePlus size={16} /> Upload OG image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('ogImage', e.target.files?.[0])} />
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
