import RoleLogin from './RoleLogin';

// Super Admin's ONLY entry point. Not reachable via the Staff or Student
// login — the backend matches accountType exactly, so those credentials
// cannot authenticate here and vice versa. The only portal that supports
// self-service password recovery (OTP-based, via /admin/forgot-password).
export default function AdminLogin() {
  return (
    <RoleLogin
      accountType="super_admin"
      roleLabel="Admin"
      identifierLabel="Email Address"
      identifierType="email"
      identifierPlaceholder="admin@hampsonsgroupofschools.edu.ng"
      showForgotPasswordLink
    />
  );
}
