import { useEffect, useState, useCallback } from 'react';
import { feesApi, paymentsApi, studentsApi, studentFeeBillsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { Card, Button, Badge } from '../../../components/ui/Primitives';
import { Field, Input, Select, Modal } from '../../../components/ui/Form';
import { Plus, Search } from 'lucide-react';
import { ApiError } from '../../../api/client';

const BILL_STATUS_TONE = { paid: 'sage', partial: 'brass', unpaid: 'rust' };

export default function StaffFees() {
  const [tab, setTab] = useState('payments');
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [form, setForm] = useState({ student: '', fee: '', amountPaid: '', method: 'cash', reference: '' });

  // Updating a Student Fee Bill's payment status
  const [editingBill, setEditingBill] = useState(null);
  const [billAmountPaid, setBillAmountPaid] = useState('');
  const [billError, setBillError] = useState('');
  const [billSaving, setBillSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([feesApi.getAll({ limit: 100 }), paymentsApi.getAll({ limit: 100 }), studentFeeBillsApi.getAll({ limit: 100 })])
      .then(([f, p, b]) => { setFees(f.data); setPayments(p.data); setBills(b.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (studentSearch.length < 2) return;
    const t = setTimeout(() => {
      studentsApi.getAll({ search: studentSearch, limit: 10 }).then((r) => setStudents(r.data));
    }, 300);
    return () => clearTimeout(t);
  }, [studentSearch]);

  async function handleRecord(e) {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      await paymentsApi.record({ ...form, amountPaid: Number(form.amountPaid) });
      setModalOpen(false);
      setForm({ student: '', fee: '', amountPaid: '', method: 'cash', reference: '' });
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to record payment.');
    } finally { setSaving(false); }
  }

  function openBillEdit(bill) {
    setEditingBill(bill);
    setBillAmountPaid(String(bill.amountPaid || 0));
    setBillError('');
  }

  async function handleUpdateBillStatus(e) {
    e.preventDefault();
    setBillError(''); setBillSaving(true);
    try {
      await studentFeeBillsApi.updatePaymentStatus(editingBill._id, Number(billAmountPaid));
      setEditingBill(null);
      load();
    } catch (err) {
      setBillError(err instanceof ApiError ? err.message : 'Failed to update payment status.');
    } finally { setBillSaving(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Fees & Payments"
        action={<Button variant="brass" onClick={() => setModalOpen(true)}><Plus size={16} /> Record payment</Button>}
      />

      <div className="flex gap-1 mb-4 border-b border-[var(--paper-200)]">
        {[
          { key: 'payments', label: 'Payments' },
          { key: 'fees', label: 'Fee Items' },
          { key: 'bills', label: 'Student Fee Bills' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-[var(--brass-500)] text-[var(--ink-900)]' : 'border-transparent text-[var(--slate-500)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === 'payments' && (
          <DataTable
            loading={loading}
            rows={payments}
            emptyTitle="No payments recorded yet"
            columns={[
              { key: 'student', header: 'Student', render: (r) => `${r.student?.firstName} ${r.student?.lastName}` },
              { key: 'feeType', header: 'Fee', render: (r) => r.fee?.feeType },
              { key: 'amountPaid', header: 'Amount', render: (r) => <span className="font-mono">₦{r.amountPaid.toLocaleString()}</span> },
              { key: 'method', header: 'Method', render: (r) => <Badge>{r.method.replace('_', ' ')}</Badge> },
              { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'completed' ? 'sage' : 'brass'}>{r.status}</Badge> },
            ]}
          />
        )}
        {tab === 'fees' && (
          <DataTable
            loading={loading}
            rows={fees}
            emptyTitle="No fee items configured"
            columns={[
              { key: 'feeType', header: 'Fee Type' },
              { key: 'class', header: 'Class', render: (r) => r.class?.name },
              { key: 'term', header: 'Term' },
              { key: 'amount', header: 'Amount', render: (r) => <span className="font-mono">₦{r.amount.toLocaleString()}</span> },
            ]}
          />
        )}
        {tab === 'bills' && (
          <>
            <DataTable
              loading={loading}
              rows={bills}
              emptyTitle="No student fee bills uploaded yet"
              onRowClick={openBillEdit}
              columns={[
                { key: 'student', header: 'Student', render: (r) => `${r.student?.firstName} ${r.student?.lastName}` },
                { key: 'class', header: 'Class', render: (r) => r.class?.name },
                { key: 'term', header: 'Term' },
                { key: 'total', header: 'Total', render: (r) => <span className="font-mono">₦{r.totalAmount.toLocaleString()}</span> },
                { key: 'paid', header: 'Paid', render: (r) => <span className="font-mono">₦{(r.amountPaid || 0).toLocaleString()}</span> },
                { key: 'status', header: 'Status', render: (r) => <Badge tone={BILL_STATUS_TONE[r.status]}>{r.status}</Badge> },
              ]}
            />
            <p className="text-xs text-[var(--slate-500)] mt-3">Click a row to record how much has been paid toward this student's bill.</p>
          </>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record a payment">
        <form onSubmit={handleRecord} className="space-y-4">
          <Field label="Student">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--slate-500)]" />
              <Input placeholder="Search by name…" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="pl-8" />
            </div>
            {students.length > 0 && (
              <Select required value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} className="mt-2">
                <option value="">Select from results</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
              </Select>
            )}
          </Field>
          <Field label="Fee item">
            <Select required value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })}>
              <option value="">Select fee</option>
              {fees.map((f) => <option key={f._id} value={f._id}>{f.feeType} — {f.class?.name} — ₦{f.amount.toLocaleString()}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount paid (₦)"><Input type="number" required min="0" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} /></Field>
            <Field label="Method">
              <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </Select>
            </Field>
          </div>
          <Field label="Reference (optional)"><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field>
          {formError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{formError}</p>}
          <Button type="submit" variant="brass" className="w-full" disabled={saving}>{saving ? 'Recording…' : 'Record payment'}</Button>
        </form>
      </Modal>

      <Modal open={!!editingBill} onClose={() => setEditingBill(null)} title={editingBill ? `${editingBill.student?.firstName} ${editingBill.student?.lastName}'s Bill` : ''}>
        {editingBill && (
          <form onSubmit={handleUpdateBillStatus} className="space-y-4">
            <p className="text-sm text-[var(--slate-600)]">Total: <span className="font-mono font-bold">₦{editingBill.totalAmount.toLocaleString()}</span></p>
            <Field label="Amount paid so far (₦)">
              <Input type="number" min="0" required value={billAmountPaid} onChange={(e) => setBillAmountPaid(e.target.value)} />
            </Field>
            <p className="text-xs text-[var(--slate-500)]">Status updates automatically — Paid, Partially Paid, or Unpaid — based on this amount vs. the total.</p>
            {billError && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{billError}</p>}
            <Button type="submit" variant="brass" className="w-full" disabled={billSaving}>{billSaving ? 'Saving…' : 'Update payment status'}</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
