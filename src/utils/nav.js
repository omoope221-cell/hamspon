import {
  LayoutDashboard, Users, GraduationCap, UserCog, School,
  ClipboardList, FileText, Receipt, HeartHandshake, Newspaper,
  Settings, Globe, Image, BellRing, HelpCircle, Crown, KeyRound,
} from 'lucide-react';

const base = (accountType) => `/${accountType}/dashboard`;

export function navFor(user) {
  if (!user) return [];

  // Super Admin — kept to the exact module list from the spec, plus Leadership Management.
  if (user.accountType === 'super_admin') {
    const b = base('admin');
    return [
      { to: `${b}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: `${b}/admissions`, label: 'Admission Management', icon: GraduationCap },
      { to: `${b}/admissions/applications`, label: 'Admission Applications', icon: ClipboardList },
      { to: `${b}/students`, label: 'Student Management', icon: Users },
      { to: `${b}/staff`, label: 'Staff Management', icon: UserCog },
      { to: `${b}/parents`, label: 'Parent Management', icon: HeartHandshake },
      { to: `${b}/classes`, label: 'Classes & Subjects', icon: School },
      { to: `${b}/results`, label: 'Result Management', icon: FileText },
      { to: `${b}/website`, label: 'Website Management', icon: Globe },
      { to: `${b}/gallery`, label: 'Gallery Management', icon: Image },
      { to: `${b}/news-events`, label: 'News & Events', icon: Newspaper },
      { to: `${b}/leadership`, label: 'Leadership Management', icon: Crown },
      { to: `${b}/faqs`, label: 'FAQ Management', icon: HelpCircle },
      { to: `${b}/notifications`, label: 'Notification Management', icon: BellRing },
      { to: `${b}/passwords`, label: 'Password Management', icon: KeyRound },
      { to: `${b}/settings`, label: 'Settings', icon: Settings },
    ];
  }

  // Staff — role-based modules only. Teachers get results + assigned subjects/classes.
  // Administrative staff get their assigned modules + notifications.
  // Account officers get financial modules only.
  if (user.accountType === 'staff') {
    const b = base('staff');

    if (user.staffRole === 'accountant' || user.staffRole === 'bursar') {
      return [
        { to: `${b}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: `${b}/fees`, label: 'Fees & Payments', icon: Receipt },
      ];
    }

    if (user.staffRole === 'teacher') {
      return [
        { to: `${b}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: `${b}/students`, label: 'My Classes & Subjects', icon: GraduationCap },
        { to: `${b}/enter-results`, label: 'Enter Results', icon: ClipboardList },
        { to: `${b}/results`, label: 'Review Results', icon: FileText },
        { to: `${b}/student-fees`, label: 'Student Fees', icon: Receipt },
      ];
    }

    if (['principal', 'vice_principal', 'head_teacher'].includes(user.staffRole)) {
      return [
        { to: `${b}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: `${b}/students`, label: 'My Classes & Subjects', icon: GraduationCap },
        { to: `${b}/result-approvals`, label: 'Result Approvals', icon: ClipboardList },
      ];
    }

    // Administrative staff (default): dashboard + notifications only.
    return [
      { to: `${b}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
    ];
  }

  // Parent — their children's results and fees only.
  if (user.accountType === 'parent') {
    const b = base('parent');
    return [
      { to: `${b}`, label: 'My Children', icon: LayoutDashboard, end: true },
      { to: `${b}/results`, label: "Children's Results", icon: FileText },
      { to: `${b}/fees`, label: "Children's Fees", icon: Receipt },
    ];
  }

  // primary_student / secondary_student — results and fees only, per spec.
  const b = base('student');
  return [
    { to: `${b}`, label: 'My Profile', icon: LayoutDashboard, end: true },
    { to: `${b}/results`, label: 'My Results', icon: FileText },
    { to: `${b}/fees`, label: 'My Fees', icon: Receipt },
  ];
}