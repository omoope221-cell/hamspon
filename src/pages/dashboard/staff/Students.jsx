import { useEffect, useState, useCallback, useMemo } from 'react';
import { studentsApi, classesApi, subjectResultsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Badge } from '../../../components/ui/Primitives';
import { Input, Select, Field } from '../../../components/ui/Form';
import { useAuth } from '../../../context/AuthContext';
import { Search } from 'lucide-react';

const label = (c) => `${c.name}${c.arm ? ` ${c.arm}` : ''}`;

// "My Classes & Subjects": pick one of your own class/subject assignments
// and see exactly the students you teach there. For senior classes that
// means only the students whose department takes your subject (e.g. the
// Commerce teacher sees the Commercial students, not the whole class).
export default function StaffStudents() {
  const { user } = useAuth();
  const [views, setViews] = useState([]); // [{ key, title, classId, subjectId? }]
  const [viewKey, setViewKey] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingViews, setLoadingViews] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([subjectResultsApi.myAssignments(), classesApi.getAll({ limit: 200 })])
      .then(([a, c]) => {
        const list = [];
        c.data
          .filter((cls) => (cls.classTeacher?._id || cls.classTeacher) === user.staffProfile)
          .forEach((cls) => list.push({ key: `class:${cls._id}`, title: `${label(cls)} — all students (Class Teacher)`, classId: cls._id }));
        a.data.forEach((x) => list.push({
          key: `${x.class._id}:${x.subject._id}`, title: `${label(x.class)} — ${x.subject.name}`, classId: x.class._id, subjectId: x.subject._id,
        }));
        setViews(list);
        if (list.length) setViewKey(list[0].key);
      })
      .finally(() => setLoadingViews(false));
  }, [user.staffProfile]);

  const view = useMemo(() => views.find((v) => v.key === viewKey), [views, viewKey]);

  const load = useCallback(() => {
    if (!view) { setStudents([]); return; }
    setLoading(true);
    const params = { search, class: view.classId, limit: 200 };
    if (view.subjectId) params.subject = view.subjectId;
    studentsApi.getAll(params).then((r) => setStudents(r.data)).finally(() => setLoading(false));
  }, [search, view]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <PageHeader eyebrow="My Classes & Subjects" title="Students" />
      <Card>
        {!loadingViews && !views.length ? (
          <p className="text-sm text-[var(--slate-500)] py-6 text-center">
            You haven't been assigned to a class or subject yet. Ask an admin to assign you from Classes &amp; Subjects.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <Field label="Class & Subject">
                <Select value={viewKey} onChange={(e) => setViewKey(e.target.value)}>
                  {views.map((v) => <option key={v.key} value={v.key}>{v.title}</option>)}
                </Select>
              </Field>
              <div className="relative self-end">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
                <Input placeholder="Search students" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <DataTable
              loading={loading || loadingViews}
              rows={students}
              emptyTitle="No students found"
              emptyBody="Students taking this subject will appear here."
              columns={[
                { key: 'admissionNumber', header: 'Adm. No.', render: (r) => <span className="font-mono text-xs">{r.admissionNumber}</span> },
                { key: 'name', header: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
                { key: 'class', header: 'Class', render: (r) => r.class?.name },
                { key: 'department', header: 'Department', render: (r) => (r.department ? <Badge tone="brass">{r.department}</Badge> : '—') },
                { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'sage' : 'rust'}>{r.status}</Badge> },
              ]}
            />
            <p className="text-xs text-[var(--slate-500)] mt-3">{students.length} student{students.length === 1 ? '' : 's'} shown.</p>
          </>
        )}
      </Card>
    </div>
  );
}
