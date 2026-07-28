// Mirrors backend/config/roles.js at the level the frontend needs:
// dashboard routing + sidebar menus per account type / staff role.

export const ACCOUNT_TYPE_LABELS = {
  super_admin: 'Super Admin',
  staff: 'Staff',
  parent: 'Parent',
  primary_student: 'Primary Student',
  secondary_student: 'Secondary Student',
};

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'parent', label: 'Parent' },
  { value: 'primary_student', label: 'Primary Student' },
  { value: 'secondary_student', label: 'Secondary Student' },
];

// Where to land right after login.
export function dashboardHomeFor(user) {
  switch (user.accountType) {
    case 'super_admin':
      return '/admin/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'primary_student':
    case 'secondary_student':
      return '/student/dashboard';
    default:
      return '/login';
  }
}

// Each role has its own dedicated login screen (see pages/auth/*Login.jsx).
// Used by ProtectedRoute to send a signed-out visitor to the right form,
// and by DashboardLayout/AdminDashboardLayout after sign-out.
export function loginPathFor(accountType) {
  switch (accountType) {
    case 'super_admin':
      return '/admin/login';
    case 'staff':
      return '/staff/login';
    case 'parent':
      return '/parent/login';
    case 'primary_student':
    case 'secondary_student':
      return '/student/login';
    default:
      return '/login';
  }
}

export function roleDisplayName(user) {
  if (!user) return '';
  if (user.accountType === 'super_admin') return 'Super Admin';
  if (user.accountType === 'staff') {
    return (user.staffRole || 'staff')
      .split('_')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  }
  return ACCOUNT_TYPE_LABELS[user.accountType] || user.accountType;
}

export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.accountType === 'super_admin') return true;
  return (user.permissions || []).includes(permission);
}
