import RoleLogin from './RoleLogin';

export default function StaffLogin() {
  return (
    <RoleLogin
      accountType="staff"
      roleLabel="Staff"
      identifierLabel="Staff ID"
      identifierPlaceholder="e.g. HGS-STF-0001"
    />
  );
}
