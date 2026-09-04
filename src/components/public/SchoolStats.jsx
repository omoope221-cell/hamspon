import { Users, Award } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import Reveal from "../ui/Reveal";

// Order and icon/label are the only things fixed here — the actual
// numbers always come from settings (Admin Dashboard → Website
// Management → Statistics), never hardcoded. A stat is only shown once
// the admin has actually set a value for it.
const STAT_FIELDS = [
  { key: "studentCount", label: "Students", icon: Users },
  { key: "yearsOfExcellence", label: "Years of Excellence", icon: Award },
];

// Used by both Home.jsx and About.jsx so the two pages can never drift
// out of sync — same component, same data source (useSiteSettings),
// rendered once each place it's needed.
export default function SchoolStats({ className = "" }) {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <section className={`bg-blue-600 py-14 ${className}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center gap-16">
          {STAT_FIELDS.map((f) => (
            <div key={f.key} className="h-16 w-24 rounded-lg bg-blue-500/40 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const stats = STAT_FIELDS
    .map((f) => ({ ...f, value: settings?.[f.key] }))
    .filter((s) => s.value); // an unset stat is simply not shown — no placeholder number

  if (!stats.length) return null; // nothing configured yet — no section at all

  return (
    <section className={`bg-blue-600 py-14 ${className}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-center gap-x-16 gap-y-8 text-center">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Reveal key={stat.key} delay={i * 80}>
                <Icon className="h-8 w-8 mx-auto mb-2 text-blue-100" />
                <p className="text-4xl md:text-5xl font-extrabold text-white">{stat.value}</p>
                <p className="text-blue-100 text-sm mt-1 font-medium">{stat.label}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
