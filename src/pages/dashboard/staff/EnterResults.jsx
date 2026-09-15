import { useEffect, useState, useCallback, useMemo } from 'react';
import { sessionsApi, subjectResultsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Badge, Spinner, EmptyState } from '../../../components/ui/Primitives';
import { Field, Select } from '../../../components/ui/Form';
import { ApiError } from '../../../api/client';
import { Save, Send } from 'lucide-react';

const STATUS_TONE = { not_started: 'slate', in_progress: 'brass', submitted: 'sage' };
const STATUS_LABEL = { not_started: 'Not started', in_progress: 'In progress', submitted: 'Submitted' };

function computeGrade(total) {
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 60) return 'C';
  if (total >= 50) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

// A Subject Teacher's home base: pick one of their (class, subject)
// assignments, enter every student's CA1/CA2/Assignment/Exam, save row
// by row, then submit the whole class+subject once every student has a
// score. The backend only ever returns assignments this teacher
// actually has (Class.subjectTeachers) — there's no way to reach a
// class/subject that isn't theirs from this screen, and the backend
// re-checks the same assignment on every save regardless.
export default function EnterResults() {
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [term, setTerm] = useState('First Term');
  const [assignmentKey, setAssignmentKey] = useState('');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([subjectResultsApi.myAssignments(), sessionsApi.getAll({ limit: 20 })])
      .then(([a, ses]) => {
        setAssignments(a.data);
        if (a.data.length) setAssignmentKey(`${a.data[0].class._id}:${a.data[0].subject._id}`);
        setSessions(ses.data);
        const current = ses.data.find((x) => x.isCurrent);
        setSessionId(current ? current._id : a.data[0]?.session || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const current = useMemo(() => {
    if (!assignmentKey) return null;
    const [classId, subjectId] = assignmentKey.split(':');
    return assignments.find((a) => a.class._id === classId && a.subject._id === subjectId);
  }, [assignmentKey, assignments]);

  const loadSheet = useCallback(() => {
    if (!current || !sessionId || !term) { setRows([]); return; }
    setLoadingSheet(true); setError(''); setSuccess('');
    subjectResultsApi
      .getClassSheet({ class: current.class._id, subject: current.subject._id, session: sessionId, term })
      .then((r) => {
        setRows(
          r.data.map((row) => ({
            studentId: row.student._id,
            name: `${row.student.firstName} ${row.student.lastName}`,
            admissionNumber: row.student.admissionNumber,
            ca1: row.entry?.ca1 ?? 0, ca2: row.entry?.ca2 ?? 0, assignment: row.entry?.assignment ?? 0, exam: row.entry?.exam ?? 0,
            total: row.entry?.total ?? 0,
            status: row.status,
            dirty: false,
          }))
        );
      })
      .finally(() => setLoadingSheet(false));
  }, [current, sessionId, term]);

  useEffect(() => { loadSheet(); }, [loadSheet]);

  function updateField(studentId, field, value) {
    setRows((r) => r.map((row) => (row.studentId === studentId ? { ...row, [field]: value, dirty: true } : row)));
  }

  async function saveRow(row) {
    if (row.status === 'submitted') return;
    setError(''); setSuccess(''); setSavingId(row.studentId);
    try {
      const body = {
        student: row.studentId, class: current.class._id, subject: current.subject._id, session: sessionId, term,
        ca1: Number(row.ca1) || 0, ca2: Number(row.ca2) || 0, assignment: Number(row.assignment) || 0, exam: Number(row.exam) || 0,
      };
      const res = await subjectResultsApi.upsert(body);
      setRows((r) => r.map((x) => (x.studentId === row.studentId
        ? { ...x, total: res.data.total, status: 'in_progress', dirty: false }
        : x)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save score.');
    } finally {
      setSavingId(null);
    }
  }

  const allEntered = rows.length > 0 && rows.every((r) => r.status !== 'not_started');
  const allSubmitted = rows.length > 0 && rows.every((r) => r.status === 'submitted');

  async function handleSubmitClass() {
    if (!window.confirm(`Submit ${current.subject.name} scores for ${current.class.name}${current.class.arm ? ` ${current.class.arm}` : ''}? You won't be able to edit them afterwards unless an admin reopens them.`)) return;
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await subjectResultsApi.submit({ class: current.class._id, subject: current.subject._id, session: sessionId, term });
      setSuccess('Scores submitted for review.');
      loadSheet();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Subject Teacher" title="Enter Results" />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Only the classes and subjects you're assigned to teach show up here. Save each student as you go, then
        submit once every student in the class has a score.
      </p>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : !assignments.length ? (
        <Card>
          <EmptyState
            title="No subject assignments yet"
            body="You haven't been assigned to teach any subject in any class. Ask an admin to assign you from Classes & Subjects."
          />
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Class & Subject">
                <Select value={assignmentKey} onChange={(e) => setAssignmentKey(e.target.value)}>
                  {assignments.map((a) => (
                    <option key={`${a.class._id}:${a.subject._id}`} value={`${a.class._id}:${a.subject._id}`}>
                      {a.class.name}{a.class.arm ? ` ${a.class.arm}` : ''} — {a.subject.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Session">
                <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                  {sessions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </Select>
              </Field>
              <Field label="Term">
                <Select value={term} onChange={(e) => setTerm(e.target.value)}>
                  <option>First Term</option>
                  <option>Second Term</option>
                  <option>Third Term</option>
                </Select>
              </Field>
            </div>
          </Card>

          {error && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2 mb-3">{error}</p>}
          {success && <p className="text-sm text-[var(--sage-600)] bg-[var(--sage-100)] rounded-md px-3 py-2 mb-3">{success}</p>}

          <Card>
            {loadingSheet ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : !rows.length ? (
              <EmptyState title="No students in this class" />
            ) : (
              <div className="overflow-x-auto thin-scroll">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--paper-200)]">
                      {['Student', 'CA1 (10)', 'CA2 (10)', 'Assign. (10)', 'Exam (70)', 'Total', 'Grade', 'Status', ''].map((h) => (
                        <th key={h} className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const locked = row.status === 'submitted';
                      const total = Number(row.ca1 || 0) + Number(row.ca2 || 0) + Number(row.assignment || 0) + Number(row.exam || 0);
                      return (
                        <tr key={row.studentId} className="border-b border-[var(--paper-200)] last:border-0">
                          <td className="py-2 px-2 whitespace-nowrap">
                            {row.name}
                            <span className="block text-xs text-[var(--slate-500)]">{row.admissionNumber}</span>
                          </td>
                          {['ca1', 'ca2', 'assignment', 'exam'].map((field) => (
                            <td key={field} className="py-2 px-2">
                              <input
                                type="number" min="0" max={field === 'exam' ? 70 : 10}
                                value={row[field]} disabled={locked}
                                onChange={(e) => updateField(row.studentId, field, e.target.value)}
                                className="w-14 rounded border border-[var(--paper-200)] px-2 py-1 text-sm disabled:bg-[var(--paper-100)] disabled:text-[var(--slate-500)]"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-2 font-mono">{total}</td>
                          <td className="py-2 px-2"><Badge tone="brass">{computeGrade(total)}</Badge></td>
                          <td className="py-2 px-2"><Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge></td>
                          <td className="py-2 px-2">
                            {!locked && (
                              <Button
                                variant="ghost" className="!px-2 !py-1 text-xs"
                                disabled={savingId === row.studentId || !row.dirty}
                                onClick={() => saveRow(row)}
                              >
                                <Save size={13} /> {savingId === row.studentId ? 'Saving…' : 'Save'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {!!rows.length && (
            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="brass"
                disabled={!allEntered || allSubmitted || submitting}
                onClick={handleSubmitClass}
              >
                <Send size={15} /> {allSubmitted ? 'Already submitted' : submitting ? 'Submitting…' : 'Submit class scores'}
              </Button>
              {!allEntered && !allSubmitted && (
                <p className="text-xs text-[var(--slate-500)]">Save every student's score before you can submit.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
