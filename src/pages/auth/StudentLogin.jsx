import RoleLogin from './RoleLogin';

// Students are one portal but two backend account types. The sub-toggle
// still only ever authenticates a student account — never staff/admin.
export default function StudentLogin() {
  return (
    <RoleLogin
      roleLabel="Student"
      identifierLabel="Admission Number"
      identifierPlaceholder="e.g. HMP0001"
      subOptions={[
        { value: 'primary_student', label: 'Primary' },
        { value: 'secondary_student', label: 'Secondary' },
      ]}
    />
  );
}
