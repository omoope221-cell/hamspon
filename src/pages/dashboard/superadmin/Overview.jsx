import { useEffect, useState } from 'react';
import { dashboardApi } from '../../../api/resources';
import { StatCard, Card, Spinner } from '../../../components/ui/Primitives';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.summary()
      .then((s) => setStats(s.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} />
      </div>
    );
  }

  const chartData = [
    { name: 'Students', count: stats?.studentCount ?? 0 },
    { name: 'Staff', count: stats?.staffCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--brass-500)]">Register — Overview</p>
        <h1 className="font-display text-2xl font-semibold text-[var(--ink-900)]">School at a glance</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <StatCard label="Active Students" value={stats?.studentCount ?? '—'} index="01" />
        <StatCard label="Active Staff" value={stats?.staffCount ?? '—'} index="02" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Community breakdown" eyebrow="Headcount" className="lg:col-span-2">
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--paper-200)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--slate-600)' }} axisLine={{ stroke: 'var(--paper-200)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--slate-600)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--paper-50)', border: '1px solid var(--paper-200)', borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="count" fill="var(--brass-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Revenue collected" eyebrow="Fees & Payments">
          <p className="font-display text-3xl font-semibold text-[var(--ink-900)]">
            ₦{(stats?.totalRevenue ?? 0).toLocaleString()}
          </p>
          <p className="text-sm text-[var(--slate-500)] mt-1">Total completed payments recorded to date.</p>
        </Card>
      </div>
    </div>
  );
}
