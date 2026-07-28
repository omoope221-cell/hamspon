import { useEffect, useState, useCallback } from 'react';
import { resultsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Select } from '../../../components/ui/Form';

const STATUS_TONE = { draft: 'slate', submitted: 'brass', approved: 'sage', rejected: 'rust' };

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('submitted');

  const load = useCallback(() => {
    setLoading(true);
    resultsApi.getAll({ status: statusFilter, limit: 100 }).then((r) => setResults(r.data)).finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function approve(id) {
    await resultsApi.approve(id);
    load();
  }
  async function reject(id) {
    const reason = window.prompt('Reason for rejection (shown to the teacher):');
    if (reason === null) return;
    await resultsApi.reject(id, reason);
    load();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Register — Academics"
        title="Result Approvals"
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="submitted">Pending review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Drafts</option>
          </Select>
        }
      />

      <Card>
        <DataTable
          loading={loading}
          rows={results}
          emptyTitle="Nothing to review"
          emptyBody="Results submitted by teachers will appear here for approval."
          columns={[
            { key: 'student', header: 'Student', render: (r) => `${r.student?.firstName} ${r.student?.lastName}` },
            { key: 'class', header: 'Class', render: (r) => r.class?.name },
            { key: 'term', header: 'Term / Session', render: (r) => `${r.term}` },
            { key: 'average', header: 'Average', render: (r) => <span className="font-mono">{r.average}</span> },
            { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
            {
              key: 'actions', header: '', render: (r) => r.status === 'submitted' && (
                <div className="flex gap-2">
                  <Button variant="brass" className="!px-2 !py-1 text-xs" onClick={() => approve(r._id)}>Approve</Button>
                  <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => reject(r._id)}>Reject</Button>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
