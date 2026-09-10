import { useEffect, useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { parentsApi } from '../../api/resources';

// Picks the right logo for who's actually looking at it:
//  - primary_student           → the Nursery & Primary School crest
//  - secondary_student         → the College (secondary) crest
//  - parent, all children in one section → that section's crest
//  - parent with mixed/no linked children, staff, admin, public visitor
//    → the general combined "Hampsons Schools" crest
// Every place that renders <Crest /> gets this automatically — nothing
// else needs to know which logo it is.
export default function Crest({ size = 40, className = '' }) {
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const [parentSection, setParentSection] = useState(undefined); // undefined = not resolved yet, null = mixed/unknown

  useEffect(() => {
    if (user?.accountType !== 'parent') { setParentSection(undefined); return; }
    let cancelled = false;
    parentsApi.getMe()
      .then((r) => {
        if (cancelled) return;
        const sections = [...new Set((r.data.children || []).map((c) => c.section).filter(Boolean))];
        setParentSection(sections.length === 1 ? sections[0] : null);
      })
      .catch(() => { if (!cancelled) setParentSection(null); });
    return () => { cancelled = true; };
  }, [user?.accountType]);

  let section = null;
  if (user?.accountType === 'primary_student') section = 'primary';
  else if (user?.accountType === 'secondary_student') section = 'secondary';
  else if (user?.accountType === 'parent') section = parentSection;

  const src =
    section === 'primary' ? (settings.logoPrimary || settings.logo)
    : section === 'secondary' ? (settings.logoSecondary || settings.logo)
    : settings.logo;

  return (
    <img
      src={src || '/logo-schools.png'}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
      role="img"
      alt={`${settings.schoolName || 'School'} logo`}
    />
  );
}
