import { useEffect, useState, useCallback } from 'react';
import { classesApi, sessionsApi, studentsApi, studentFeeBillsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Badge, Spinner } from '../../../components/ui/Primitives';
import { Field, Input, Select, Textarea } from '../../../components/ui/Form';
import { Plus, Trash2 } from 'lucide-react';
import { ApiError } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

const BLANK_ROW = () => ({ feeName: '', amount: '' });

export default function StaffStudentFees() {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [term, setTerm] = useState('First Term');
  const [studentId, setStudentId] = useState('');

  const [rows, setRows] = useState([BLANK_ROW()]);
  const [remarks, setRemarks] = useState('');
  const [existingBill, setExistingBill] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([classesApi.getAll({ limit: 200 }), sessionsApi.getAll({ limit: 20 })]).then(([c, ses]) => {
      const owned = c.data.filter((cls) => (cls.classTeacher?._id || cls.classTeacher) === user.staffProfile);
      setMyClasses(owned);
      if (owned.length) setClassId(owned[0]._id);
      setSessions(ses.data);
      const current = ses.data.find((s) => s.isCurrent);
      if (current) setSessionId(current._id);
    });
  }, [user.staffProfile]);

  useEffect(() => {
    if (!classId) { setStudents([]); return; }
    studentsApi.getAll({ class: classId, limit: 200 }).then((r) => {
      setStudents(r.data);
      setStudentId(r.data[0]?._id || '');
    });
  }, [classId]);

  const loadExisting = useCallback(() => {
    if (!studentId || !sessionId || !term) { setExistingBill(null); setRows([BLANK_ROW()]); setRemarks(''); return; }
    setLoadingBill(true);
    studentFeeBillsApi.getAll({ student: studentId, session: sessionId, term }).then((r) => {
      const bill = r.data[0] || null;
      setExistingBill(bill);
      setRows(bill ? bill.items.map((i) => ({ feeName: i.feeName, amount: i.amount })) : [BLANK_ROW()]);
      setRemarks(bill?.remarks || '');
    }).finally(() => setLoadingBill(false));
  }, [studentId, sessionId, term]);

  useEffect(() => { loadExisting(); }, [loadExisting]);

  function updateRow(i, field, value) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }
  function addRow() { setRows((prev) => [...prev, BLANK_ROW()]); }
  function removeRow(i) { setRows((prev) => prev.filter((_, idx) => idx !== i)); }

  const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  async function handleUpload(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const cleanRows = rows.filter((r) => r.feeName.trim() && r.amount !== '');
    if (!cleanRows.length) { setError('Add at least one fee item with a name and amount.'); return; }
    setSaving(true);
    try {
      await studentFeeBillsApi.upsert({
        student: studentId, class: classId, session: sessionId, term,
        items: cleanRows.map((r) => ({ feeName: r.feeName.trim(), amount: Number(r.amount) })),
        remarks,
      });
      setSuccess('Fees uploaded — visible to the student and parent immediately.');
      loadExisting();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload fees.');
    } finally {
      setSaving(false);
    }
  }

  if (!myClasses.length) {
    return (
      <div>
        <PageHeader eyebrow="Class Teacher" title="Student Fees" />
        <Card><p className="text-sm text-[var(--slate-500)] text-center py-8">You haven't been assigned as Class Teacher for any class yet.</p></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Class Teacher" title="Student Fees" />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Build an itemized fee bill for one student at a time. Uploading is visible to the student and parent right away.
      </p>

      <Card className="mb-4">
        <div className="grid sm:grid-cols-4 gap-4">
          <Field label="Session">
            <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">Select</option>
              {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Term">
            <Select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option>First Term</option><option>Second Term</option><option>Third Term</option>
            </Select>
          </Field>
          <Field label="Class">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {myClasses.map((c) => <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ''}</option>)}
            </Select>
          </Field>
          <Field label="Student">
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
            </Select>
          </Field>
        </div>
      </Card>

      {loadingBill ? (
        <div className="flex justify-center py-10"><Spinner size={26} /></div>
      ) : studentId && sessionId ? (
        <Card>
          {existingBill && (
            <div className="mb-4 flex items-center gap-2">
              <Badge tone="brass">Editing existing bill</Badge>
              <Badge tone={existingBill.status === 'paid' ? 'sage' : existingBill.status === 'partial' ? 'brass' : 'rust'}>{existingBill.status}</Badge>
            </div>
          )}
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--paper-200)]">
                    <th className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2">Fee Name</th>
                    <th className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2">Amount (₦)</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-[var(--paper-200)] last:border-0">
                      <td className="py-2 px-2">
                        <Input placeholder="e.g. School Fees, PTA Levy" value={row.feeName} onChange={(e) => updateRow(i, 'feeName', e.target.value)} />
                      </td>
                      <td className="py-2 px-2">
                        <Input type="number" min="0" value={row.amount} onChange={(e) => updateRow(i, 'amount', e.target.value)} />
                      </td>
                      <td className="py-2 px-2">
                        <button type="button" onClick={() => removeRow(i)} disabled={rows.length === 1} className="text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md p-1 disabled:opacity-30" aria-label="Remove row">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addRow} className="flex items-center gap-1.5 text-sm text-[var(--brass-600)] hover:underline">
              <Plus size={14} /> Add fee row
            </button>

            <Field label="Remarks (optional)">
              <Textarea rows={2} placeholder="e.g. Please pay before resumption." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </Field>

            <div className="flex items-center justify-between border-t border-[var(--paper-200)] pt-4">
              <p className="text-sm text-[var(--slate-600)]">Total: <span className="font-mono font-bold">₦{total.toLocaleString()}</span></p>
              <Button type="submit" variant="brass" disabled={saving}>{saving ? 'Uploading…' : 'Upload Fees'}</Button>
            </div>

            {error && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-[var(--sage-600)] bg-[var(--sage-100)] rounded-md px-3 py-2">{success}</p>}
          </form>
        </Card>
      ) : (
        <p className="text-sm text-[var(--slate-500)]">Select a session and student to begin.</p>
      )}
    </div>
  );
}
