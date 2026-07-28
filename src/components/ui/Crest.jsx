import { useSiteSettings } from '../../context/SiteSettingsContext';

export default function Crest({ size = 40, className = '' }) {
  const { settings } = useSiteSettings();
  return (
    <img
      src={settings.logo || '/logo-removebg-preview.png'}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
      role="img"
      alt={`${settings.schoolName || 'School'} logo`}
    />
  );
}
