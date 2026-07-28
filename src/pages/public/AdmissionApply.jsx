import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { publicApi } from '../../api/public';
import { ApiError } from '../../api/client';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import Reveal from '../../components/ui/Reveal';

const BLANK = {
  studentFullName: '', dateOfBirth: '', gender: 'male', gradeApplyingFor: '', previousSchool: '',
  guardianName: '', guardianEmail: '', guardianPhone: '', guardianRelationship: '',
  address: '', state: '', country: '', notes: '',
};

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow";

export default function AdmissionApply() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState(BLANK);
  const [files, setFiles] = useState({ birthCertificate: null, reportCard: null, passportPhoto: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null); // { applicationNumber } once submitted

  const admissionsOpen = settings.admissions?.status !== 'closed';
  const feeNaira = (settings.admissions?.admissionFeeAmount || 0).toLocaleString();

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(files).forEach(([k, file]) => { if (file) fd.append(k, file); });
      const res = await publicApi.submitAdmissionApplication(fd);
      setSubmitted({ applicationNumber: res.data.applicationNumber });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!admissionsOpen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white px-4 text-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Admissions Are Currently Closed</h1>
          <p className="text-gray-600">Please check back later or contact the school for more information.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white px-4 text-center">
        <div className="max-w-lg">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Application Submitted</h1>
          <p className="text-gray-600 mb-2">
            Your application number is <strong>{submitted.applicationNumber}</strong>.
          </p>
          <p className="text-gray-600">
            We've emailed the guardian the amount to pay, the date to come to the school, and the entrance exam date
            and time. Payment and the exam are both completed physically at the school — please do not attempt to
            pay online.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="pt-28 pb-10 md:pt-32 md:pb-10 bg-white text-center">
        <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <img src={settings.logo} alt={`${settings.schoolName} logo`} className="h-16 w-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{settings.schoolName}</h1>
          <p className="text-blue-600 font-semibold uppercase tracking-wide text-sm">Admission Application</p>
          <p className="text-gray-500 text-sm mt-2">Admission fee: <strong>₦{feeNaira}</strong> — payable physically at the school, not online.</p>
        </Reveal>
      </section>

      <section className="py-8 md:py-12">
        <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Student Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Student full name" required>
                  <input required className={inputClass} value={form.studentFullName} onChange={(e) => set('studentFullName', e.target.value)} />
                </Field>
                <Field label="Date of birth" required>
                  <input type="date" required className={inputClass} value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
                </Field>
                <Field label="Gender" required>
                  <select required className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
                <Field label="Grade applying for" required>
                  <input required className={inputClass} placeholder="e.g. Grade 4" value={form.gradeApplyingFor} onChange={(e) => set('gradeApplyingFor', e.target.value)} />
                </Field>
              </div>
              <Field label="Previous school (if any)">
                <input className={inputClass} value={form.previousSchool} onChange={(e) => set('previousSchool', e.target.value)} />
              </Field>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Guardian Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Guardian full name" required>
                  <input required className={inputClass} value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} />
                </Field>
                <Field label="Relationship to student">
                  <input className={inputClass} placeholder="e.g. Mother" value={form.guardianRelationship} onChange={(e) => set('guardianRelationship', e.target.value)} />
                </Field>
                <Field label="Email address" required>
                  <input type="email" required className={inputClass} value={form.guardianEmail} onChange={(e) => set('guardianEmail', e.target.value)} />
                </Field>
                <Field label="Phone number" required>
                  <input required className={inputClass} value={form.guardianPhone} onChange={(e) => set('guardianPhone', e.target.value)} />
                </Field>
              </div>
              <Field label="Home address">
                <textarea rows={2} className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="State" required>
                  <input required className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)} />
                </Field>
                <Field label="Country" required>
                  <input required className={inputClass} value={form.country} onChange={(e) => set('country', e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Supporting Documents</h2>
              <p className="text-sm text-gray-500">All optional, but help us process your application faster.</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { key: 'birthCertificate', label: 'Birth Certificate' },
                  { key: 'reportCard', label: 'Previous Report Card' },
                  { key: 'passportPhoto', label: 'Passport Photograph' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex flex-col items-center justify-center gap-2 text-center text-sm text-gray-600 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-pink-400 transition-colors">
                    <UploadCloud className="h-6 w-6 text-blue-600" />
                    {files[key] ? files[key].name : label}
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFiles((f) => ({ ...f, [key]: e.target.files?.[0] || null }))} />
                  </label>
                ))}
              </div>
            </div>

            <Field label="Anything else we should know?">
              <textarea rows={3} className={inputClass} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </Field>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-animated w-full inline-flex items-center justify-center px-8 py-3.5 bg-pink-500 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 hover:shadow-xl disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        </Reveal>
      </section>
    </div>
  );
}