import { useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const CONTENT = {
  'privacy-policy': {
    title: 'Privacy Policy',
    body: (schoolName) => `${schoolName} collects and stores personal information (such as student, parent/guardian, and staff details) solely to operate our admissions, academic, and administrative processes. We do not sell or share this information with third parties except where required for payment processing or by law. Information is stored securely and access is restricted by role. For questions about how your data is handled, please contact the school through the Contact page.`,
  },
  'terms-and-conditions': {
    title: 'Terms and Conditions',
    body: (schoolName) =>
      `By using this website and its portals, you agree to provide accurate information, keep your login credentials confidential, and use the Student and Staff Portals only for their intended purpose. ${schoolName} reserves the right to suspend accounts found to be in violation of these terms. Content on this site is the property of ${schoolName} unless otherwise stated.`,
  },
  'admissions-policy': {
    title: 'Admissions Policy',
    body: () =>
      `Admission is open to applicants of any location who complete the online admission form, submit the required payment, and pass the entrance examination. Applications are reviewed by the Super Admin, and applicants are notified of examination scheduling and outcomes by email. Admission is offered strictly on the basis of examination performance and available class capacity.`,
  },
};

export default function LegalPage() {
  const { slug } = useParams();
  const { settings } = useSiteSettings();
  const entry = CONTENT[slug];

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <p className="text-gray-500">Page not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <PageHeader eyebrow="Policy" title={entry.title} />
        <p className="text-gray-600 leading-relaxed mt-6">{entry.body(settings.schoolName)}</p>
      </div>
    </div>
  );
}
