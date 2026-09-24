import { useEffect, useState } from 'react';
import { dashboardApi } from '../../../api/resources';
import { StatCard, Card, Spinner } from '../../../components/ui/Primitives';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

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

  const studentsBySection = stats?.studentsBySection || { primary: 0, secondary: 0, both: 0 };
  const staffBySection = stats?.staffBySection || { primary: 0, secondary: 0, both: 0 };

  // Kept as separate series (not summed into one bar) so Primary and
  // Secondary never read as one combined headcount.
  const chartData = [
    { name: 'Primary', Students: studentsBySection.primary, Staff: staffBySection.primary },
    { name: 'Secondary', Students: studentsBySection.secondary, Staff: staffBySection.secondary },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--brass-500)]">Register — Overview</p>
        <h1 className="font-display text-2xl font-semibold text-[var(--ink-900)]">School at a glance</h1>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] font-bold mb-2">Primary School</p>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Primary Students" value={studentsBySection.primary} index="01" />
          <StatCard label="Primary Staff" value={staffBySection.primary} index="02" />
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] font-bold mb-2">Secondary School</p>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Secondary Students" value={studentsBySection.secondary} index="03" />
          <StatCard label="Secondary Staff" value={staffBySection.secondary} index="04" />
        </div>
      </div>

      {staffBySection.both > 0 && (
        <p className="text-xs text-[var(--slate-500)]">
          Plus {staffBySection.both} staff member{staffBySection.both === 1 ? '' : 's'} marked "Both" sections (or with no section set yet) — not counted in either card above.
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Community breakdown" eyebrow="Headcount by school section" className="lg:col-span-2">
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--paper-200)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--slate-600)' }} axisLine={{ stroke: 'var(--paper-200)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--slate-600)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--paper-50)', border: '1px solid var(--paper-200)', borderRadius: 8, fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Students" fill="var(--brass-500)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Staff" fill="var(--sage-500)" radius={[4, 4, 0, 0]} />
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
