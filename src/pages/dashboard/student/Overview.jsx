import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, Spinner } from '../../../components/ui/Primitives';
import PageHeader from '../../../components/ui/PageHeader';
import { Link } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';

// Department is only meaningful for Senior Secondary — we don't have a
// dedicated JSS/SSS field on Class, so this reads the school's own class
// naming convention (e.g. "SS 1", "SSS 2") to tell Junior from Senior.
// Primary always hides it; JSS shows it only if one was actually set.
function departmentVisibility(section, className) {
  if (section !== 'secondary') return 'hidden';
  const name = (className || '').toUpperCase();
  const isSenior = /\bSSS?\s?\d/.test(name) && !/\bJSS?\s?\d/.test(name);
  return isSenior ? 'shown' : 'optional';
}

export default function StudentOverview() {
  const { user, refreshMe } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profile = user?.studentProfile;

  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>;

  const deptVisibility = departmentVisibility(profile?.section, profile?.class?.name);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My Desk" title={`Hi, ${(profile?.firstName || user?.fullName?.split(' ')[0]) || 'there'}`} />

      <Card>
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          {profile?.passportPhoto ? (
            <img
              src={profile.passportPhoto}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-24 h-24 rounded-full object-cover border border-[var(--paper-200)] shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--paper-200)] flex items-center justify-center shrink-0">
              <UserIcon size={36} className="text-[var(--slate-500)]" />
            </div>
          )}

          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 flex-1 w-full">
            {[
              ['Full Name', profile ? `${profile.firstName} ${profile.lastName}` : user?.fullName],
              ['Admission Number', profile?.admissionNumber],
              ['Gender', profile?.gender ? profile.gender[0].toUpperCase() + profile.gender.slice(1) : null],
              ['Date of Birth', profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null],
              ['Current Class', profile?.class ? `${profile.class.name}${profile.class.arm ? ` ${profile.class.arm}` : ''}` : null],
              ['Academic Session', profile?.session?.name],
              ...(deptVisibility !== 'hidden' ? [['Department', profile?.department || (deptVisibility === 'optional' ? 'Not set' : '—')]] : []),
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)]">{label}</dt>
                <dd className="text-sm text-[var(--ink-900)] mt-0.5">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      <Card title="Academic Results" eyebrow="Quick link">
        <p className="text-sm text-[var(--slate-600)] mb-3">
          View, print, or download your published results.
        </p>
        <Link to="/student/dashboard/results" className="text-sm font-medium text-pink-500 hover:underline">
          Go to My Results →
        </Link>
      </Card>

      <Card title="My Fees" eyebrow="Quick link">
        <p className="text-sm text-[var(--slate-600)] mb-3">
          View your fee items, total, and payment status.
        </p>
        <Link to="/student/dashboard/fees" className="text-sm font-medium text-pink-500 hover:underline">
          Go to My Fees →
        </Link>
      </Card>
    </div>
  );
}
