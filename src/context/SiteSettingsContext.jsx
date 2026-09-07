import { createContext, useContext, useEffect, useState } from 'react';
import { publicApi } from '../api/public';

const SiteSettingsContext = createContext(null);

// Sane fallback so pages render sensibly even before the first fetch
// resolves, or if the Super Admin hasn't customized a section yet — never
// a blank page, never a crash on `settings.hero.title`.
const DEFAULTS = {
  schoolName: 'Hampsons Group of School',
  motto: 'Believe and Achieve',
  logo: '/logo-removebg-preview.png',
  favicon: null,
  email: 'info@hampsonsgroupofschool.edu.ng',
  admissionsEmail: 'admissions@hampsonsgroupofschool.edu.ng',
  phones: ['+234 800 123 4567'],
  whatsapp: null,
  address: '15 Educational Crescent, GRA Phase 2, Lagos, Nigeria',
  googleMapsEmbed: null,
  tourVideoUrl: '',
  officeHours: 'Mon–Fri: 8:00 AM – 4:00 PM',
  websiteUrl: 'http://localhost:5173',
  socialLinks: {},
  contactFormRecipientEmail: null,
  hero: {
    title: 'Hampsons Group of School',
    subtitle: "Nurturing Tomorrow's Leaders Today — world-class education blending academic excellence with character development, creativity, and innovation.",
    buttonText: 'Apply Now',
    buttonLink: '/admissions/apply',
    backgroundImages: [],
    backgroundVideo: null,
  },
  about: 'Hampsons Group of School is a leading primary and secondary school committed to providing a balanced education that develops intellectual curiosity, moral integrity, and a lifelong love of learning.',
  principalMessage: '',
  mission: 'To provide a nurturing, inclusive environment where every student is empowered to reach their full academic and personal potential.',
  vision: 'To be a leading centre of educational excellence, shaping confident, principled leaders for tomorrow.',
  coreValues: ['Integrity', 'Excellence', 'Respect', 'Innovation'],
  studentCount: '',
  yearsOfExcellence: '',
  statistics: [
    { label: 'Students', value: '1,200+' },
    { label: 'Teachers', value: '85+' },
    { label: 'Years of Excellence', value: '13+' },
    { label: 'University Placements', value: '98%' },
  ],
  testimonials: [],
  partners: [],
  cta: {
    title: 'Ready to Join the Hampsons Family?',
    subtitle: 'Applications for the current academic year are now open. Spaces are limited.',
    buttonText: 'Apply Now',
    buttonLink: '/admissions/apply',
  },
  admissions: {
    status: 'open',
    requirements: ['Completed application form', 'Copy of birth certificate or passport', 'Previous school reports (last 2 years)', 'Recent passport-size photograph'],
    process: [
      'Submit the online application form with student and guardian details.',
      'Prospective students take an age-appropriate entrance assessment.',
      'Shortlisted families are invited for an interview and campus tour.',
      'Successful applicants receive an offer and complete enrollment.',
    ],
    datesNote: '',
    forms: [],
    banner: null,
    admissionFeeAmount: 0,
    schoolVisitDate: null,
    examDate: null,
    examStartTime: '',
    examEndTime: '',
    examDurationMinutes: null,
    instructions: 'Payment and the entrance examination will both be conducted physically at the school.',
  },
  footer: {
    description: 'Nurturing excellence in education. We provide a holistic learning environment that fosters intellectual, social, and emotional growth.',
    quickLinks: [],
    copyrightText: '',
  },
  seo: { title: '', description: '', keywords: '', ogImage: null },
  theme: { primaryColor: '#2563EB', secondaryColor: '#EC4899' },
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await publicApi.getSettings();
      setSettings({ ...DEFAULTS, ...res.data });
    } catch {
      // Keep defaults — a settings-fetch failure shouldn't blank the site.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
