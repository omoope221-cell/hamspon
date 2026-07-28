import { useEffect, useState } from 'react';
import { dashboardApi } from '../../../api/resources';
import { useAuth } from '../../../context/AuthContext';
import { StatCard, Spinner } from '../../../components/ui/Primitives';
import PageHeader from '../../../components/ui/PageHeader';

export default function StaffOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.summary().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={28} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Staff Room" title={`Welcome back, ${user?.fullName?.split(' ')[0]}`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.staffRole === 'teacher' ? (
          <>
            <StatCard label="Assigned classes" value={stats?.classCount ?? '—'} index="01" />
            <StatCard label="Students taught" value={stats?.studentCount ?? '—'} index="02" />
          </>
        ) : (
          <>
            <StatCard label="Active students" value={stats?.studentCount ?? '—'} index="01" />
            <StatCard label="Active staff" value={stats?.staffCount ?? '—'} index="02" />
          </>
        )}
      </div>
    </div>
  );
}
