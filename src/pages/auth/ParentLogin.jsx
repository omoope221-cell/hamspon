import RoleLogin from './RoleLogin';

export default function ParentLogin() {
  return (
    <RoleLogin
      accountType="parent"
      roleLabel="Parent"
      identifierLabel="Email address"
      identifierPlaceholder="you@example.com"
      identifierType="email"
      showForgotPasswordLink
      forgotPasswordPath="/parent/forgot-password"
    />
  );
}
