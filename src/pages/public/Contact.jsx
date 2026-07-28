// Contact.jsx
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { publicApi } from "../../api/public";
import { ApiError } from "../../api/client";
import Reveal from "../../components/ui/Reveal";

export default function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await publicApi.submitContactForm(form);
      setDone(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Reveal className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase">Contact Us</h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            We'd love to hear from you. Reach out via phone, email, or visit our campus.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact info — sourced from Website Settings */}
          <div className="md:col-span-1 space-y-6">
            {settings.phones?.length > 0 && (
              <Reveal delay={0}>
                <div className="card-hover bg-gray-50 p-6 rounded-xl">
                  <Phone className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Phone</h3>
                  {settings.phones.map((p) => <p key={p} className="text-gray-600 mt-1">{p}</p>)}
                  {settings.whatsapp && <p className="text-gray-600">WhatsApp: {settings.whatsapp}</p>}
                </div>
              </Reveal>
            )}
            {(settings.email || settings.admissionsEmail) && (
              <Reveal delay={80}>
                <div className="card-hover bg-gray-50 p-6 rounded-xl">
                  <Mail className="h-8 w-8 text-pink-500 mb-3" />
                  <h3 className="font-bold text-gray-900">Email</h3>
                  {settings.email && <p className="text-gray-600 mt-1">{settings.email}</p>}
                  {settings.admissionsEmail && <p className="text-gray-600">{settings.admissionsEmail}</p>}
                </div>
              </Reveal>
            )}
            {settings.address && (
              <Reveal delay={160}>
                <div className="card-hover bg-gray-50 p-6 rounded-xl">
                  <MapPin className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Address</h3>
                  <p className="text-gray-600 mt-1 whitespace-pre-line">{settings.address}</p>
                </div>
              </Reveal>
            )}
            {settings.officeHours && (
              <Reveal delay={240}>
                <div className="card-hover bg-gray-50 p-6 rounded-xl">
                  <Clock className="h-8 w-8 text-pink-500 mb-3" />
                  <h3 className="font-bold text-gray-900">Office Hours</h3>
                  <p className="text-gray-600 mt-1 whitespace-pre-line">{settings.officeHours}</p>
                </div>
              </Reveal>
            )}
          </div>

          {/* Contact form */}
          <Reveal delay={100} className="md:col-span-2 bg-gray-50 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
            {done ? (
              <div className="flex flex-col items-center text-center py-10">
                <CheckCircle2 className="h-14 w-14 text-green-500 mb-4" />
                <p className="text-lg font-bold text-gray-900">Message sent</p>
                <p className="text-gray-500 mt-1">We've emailed you a confirmation and will be in touch soon.</p>
                <button onClick={() => setDone(false)} className="btn-animated mt-6 text-blue-600 font-semibold hover:text-pink-500">
                  Send another message
                </button>
              </div>
            ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="John Doe" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" id="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" id="subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="How can we help?" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea id="message" rows="5" required value={form.message} onChange={(e) => set('message', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="Your message..." />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="btn-animated inline-flex items-center px-8 py-3 bg-pink-500 text-white font-bold rounded-full shadow-lg hover:bg-pink-600 hover:shadow-xl disabled:opacity-60"
              >
                <Send className="mr-2 h-5 w-5" /> {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
            )}
          </Reveal>
        </div>

        {settings.googleMapsEmbed && (
          <Reveal delay={0} className="max-w-5xl mx-auto mt-10">
            <div className="rounded-2xl overflow-hidden shadow-md h-80">
              <iframe
                title="School location"
                src={settings.googleMapsEmbed}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
