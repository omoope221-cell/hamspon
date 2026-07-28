import { useEffect, useState, useCallback } from 'react';
import { studentsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Badge } from '../../../components/ui/Primitives';
import { Input } from '../../../components/ui/Form';
import { Search } from 'lucide-react';

export default function StaffStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    studentsApi.getAll({ search, limit: 50 }).then((r) => setStudents(r.data)).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <PageHeader eyebrow="My Classes" title="Students" />
      <Card>
        <div className="relative max-w-xs mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
          <Input placeholder="Search students" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <DataTable
          loading={loading}
          rows={students}
          emptyTitle="No students found"
          emptyBody="Students in your assigned classes will appear here."
          columns={[
            { key: 'admissionNumber', header: 'Adm. No.', render: (r) => <span className="font-mono text-xs">{r.admissionNumber}</span> },
            { key: 'name', header: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
            { key: 'class', header: 'Class', render: (r) => r.class?.name },
            { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'sage' : 'rust'}>{r.status}</Badge> },
          ]}
        />
      </Card>
    </div>
  );
}
