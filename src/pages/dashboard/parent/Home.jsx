import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { parentsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Spinner, Badge, EmptyState } from '../../../components/ui/Primitives';
import { FileText, Receipt } from 'lucide-react';

export default function ParentHome() {
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentsApi.getMe().then((r) => setParent(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>;

  return (
    <div>
      <PageHeader eyebrow="Welcome" title={`Hi, ${parent?.firstName || 'there'}`} />

      {!parent?.children?.length ? (
        <Card>
          <EmptyState
            title="No children linked yet"
            body="Your account isn't linked to a student record yet. Contact the school's Super Admin to have your child linked to your account."
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {parent.children.map((child) => (
            <Card key={child._id} title={`${child.firstName} ${child.lastName}`} eyebrow={child.admissionNumber}>
              <div className="flex items-center gap-2 mb-4">
                <Badge tone={child.section === 'primary' ? 'sage' : 'brass'}>{child.section}</Badge>
                <Badge>{child.class?.name}{child.class?.arm ? ` ${child.class.arm}` : ''}</Badge>
              </div>
              <div className="flex gap-3">
                <Link to="/parent/dashboard/results" className="flex items-center gap-1.5 text-sm text-[var(--brass-600)] hover:underline">
                  <FileText size={14} /> View results
                </Link>
                <Link to="/parent/dashboard/fees" className="flex items-center gap-1.5 text-sm text-[var(--brass-600)] hover:underline">
                  <Receipt size={14} /> View fees
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
