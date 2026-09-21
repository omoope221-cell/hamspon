import { useEffect, useState, useCallback } from 'react';
import { classesApi, sessionsApi, studentsApi, resultsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Badge, Spinner, EmptyState } from '../../../components/ui/Primitives';
import { Field, Select, Input, Textarea } from '../../../components/ui/Form';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../api/client';
import { downloadReportCard } from '../../../utils/downloadReportCard';
import { FileDown, Send } from 'lucide-react';

const AFFECTIVE_TRAITS = [
  ['punctuality', 'Punctuality'], ['neatness', 'Neatness'], ['honesty', 'Honesty'], ['respect', 'Respect'],
  ['leadership', 'Leadership'], ['cooperation', 'Cooperation'], ['initiative', 'Initiative'],
  ['responsibility', 'Responsibility'], ['selfControl', 'Self-Control'],
];
const PSYCHOMOTOR_TRAITS = [
  ['handwriting', 'Handwriting'], ['creativity', 'Creativity'], ['drawing', 'Drawing'], ['sports', 'Sports'],
  ['musicalSkills', 'Musical Skills'], ['practicalSkills', 'Practical Skills'], ['communication', 'Communication'],
];

const STATUS_TONE = { draft: 'slate', submitted: 'brass', approved: 'sage', rejected: 'rust' };
const STATUS_LABEL = { draft: 'Draft', submitted: 'Awaiting admin review', approved: 'Published', rejected: 'Sent back by admin' };
const SUBJECT_STATUS_TONE = { not_started: 'slate', in_progress: 'brass', submitted: 'sage' };
const SUBJECT_STATUS_LABEL = { not_started: 'Not started', in_progress: 'In progress', submitted: 'Submitted' };

function RatingSelect({ value, onChange }) {
  return (
    <Select value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
      <option value="">—</option>
      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
    </Select>
  );
}

const BLANK_CARD = () => ({
  teacherComment: '',
  daysPresent: '', totalDays: '',
  affectiveDomain: {}, psychomotorDomain: {},
  nextTermBegins: '', promotedTo: '', nextClass: '',
});

// The Class Teacher's review screen. Scores are entered by Subject
// Teachers (see EnterResults.jsx) and can only ever be viewed here, never
// edited — this page only writes the comment, promotion status, and
// behaviour ratings, then submits the whole thing to Admin for
// approval/publishing. The backend enforces the same rule regardless of
// what this UI does or doesn't show.
export default function StaffResults() {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [term, setTerm] = useState('First Term');
  const [studentId, setStudentId] = useState('');

  const [matrix, setMatrix] = useState([]);
  const [existing, setExisting] = useState(null); // the current Result document, if any
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([classesApi.getAll({ limit: 200 }), sessionsApi.getAll({ limit: 20 })])
      .then(([c, ses]) => {
        const owned = c.data.filter((cls) => (cls.classTeacher?._id || cls.classTeacher) === user.staffProfile);
        setMyClasses(owned);
        if (owned.length) setClassId(owned[0]._id);
        setSessions(ses.data);
        const current = ses.data.find((x) => x.isCurrent);
        if (current) setSessionId(current._id);
      })
      .finally(() => setLoading(false));
  }, [user.staffProfile]);

  useEffect(() => {
    if (!classId) { setStudents([]); return; }
    studentsApi.getAll({ class: classId, limit: 200 }).then((r) => {
      setStudents(r.data);
      setStudentId(r.data[0]?._id || '');
    });
  }, [classId]);

  const loadMatrix = useCallback(() => {
    if (!classId || !sessionId || !term) { setMatrix([]); return; }
    setLoadingMatrix(true);
    resultsApi.reviewMatrix({ class: classId, session: sessionId, term })
      .then((r) => setMatrix(r.data))
      .finally(() => setLoadingMatrix(false));
  }, [classId, sessionId, term]);

  useEffect(() => { loadMatrix(); }, [loadMatrix]);

  const loadCard = useCallback(() => {
    if (!studentId || !sessionId || !term) { setExisting(null); setCard(null); return; }
    setLoadingCard(true); setError(''); setSuccess('');
    resultsApi.getAll({ student: studentId, session: sessionId, term, limit: 1 }).then((r) => {
      const result = r.data[0] || null;
      setExisting(result);
      setCard({
        ...BLANK_CARD(),
        teacherComment: result?.teacherComment || '',
        daysPresent: result?.attendance?.daysPresent ?? '', totalDays: result?.attendance?.totalDays ?? '',
        affectiveDomain: result?.affectiveDomain || {}, psychomotorDomain: result?.psychomotorDomain || {},
        nextTermBegins: result?.nextTermBegins ? result.nextTermBegins.slice(0, 10) : '',
        promotedTo: result?.promotedTo || '', nextClass: result?.nextClass || '',
      });
    }).finally(() => setLoadingCard(false));
  }, [studentId, sessionId, term]);

  useEffect(() => { loadCard(); }, [loadCard]);

  async function handleSaveComment() {
    setError(''); setSuccess(''); setSaving(true);
    try {
      const result = await resultsApi.upsert({
        student: studentId, class: classId, session: sessionId, term,
        teacherComment: card.teacherComment,
        attendance: { daysPresent: card.daysPresent === '' ? null : Number(card.daysPresent), totalDays: card.totalDays === '' ? null : Number(card.totalDays) },
        affectiveDomain: card.affectiveDomain,
        psychomotorDomain: card.psychomotorDomain,
        nextTermBegins: card.nextTermBegins || null,
        promotedTo: card.promotedTo,
        nextClass: card.nextClass,
      });
      setSuccess('Comment saved.');
      setExisting(result.data);
      loadMatrix();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally { setSaving(false); }
  }

  async function handleSubmit() {
    if (!existing) return;
    if (!window.confirm('Submit this result for admin review? You can still save the comment again while it\'s under review, but it will lock once approved.')) return;
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const res = await resultsApi.submit(existing._id);
      setExisting(res.data);
      setSuccess('Submitted for admin review.');
      loadMatrix();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit.');
    } finally { setSubmitting(false); }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadReportCard(existing._id, `${student?.firstName || 'report'}-${term}`.replace(/\s+/g, '-'));
    } catch {
      window.alert('Failed to download the report card. Please try again.');
    } finally { setDownloading(false); }
  }

  const student = students.find((s) => s._id === studentId);
  const selectedClass = myClasses.find((c) => c._id === classId);
  const matrixRow = matrix.find((m) => m.student._id === studentId);

  if (!loading && !myClasses.length) {
    return (
      <div>
        <PageHeader eyebrow="Class Teacher" title="Review Results" />
        <Card>
          <p className="text-sm text-[var(--slate-500)] text-center py-8">
            You haven't been assigned as Class Teacher for any class yet — contact your Super Admin to be assigned
            before you can review report cards.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Class Teacher" title="Review Results" />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Scores are entered by each subject's teacher — you can't edit them here. Review what's been submitted, add
        your comment, and send the result to Admin for approval once every subject is in.
      </p>

      <Card className="mb-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Class">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {myClasses.map((c) => <option key={c._id} value={c._id}>{c.name}{c.arm ? ` ${c.arm}` : ''}</option>)}
            </Select>
          </Field>
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
        </div>
      </Card>

      {/* Class overview — who's complete, who's missing subjects */}
      <Card className="mb-4">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Class Overview</h3>
        {loadingMatrix ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : !matrix.length ? (
          <EmptyState title="No students in this class" />
        ) : (
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--paper-200)]">
                  {['Student', 'Subjects', 'Comment', 'Status', ''].map((h) => (
                    <th key={h} className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr
                    key={row.student._id}
                    onClick={() => setStudentId(row.student._id)}
                    className={`border-b border-[var(--paper-200)] last:border-0 cursor-pointer hover:bg-[var(--paper-100)] ${row.student._id === studentId ? 'bg-[var(--paper-100)]' : ''}`}
                  >
                    <td className="py-2 px-2 whitespace-nowrap">{row.student.firstName} {row.student.lastName}</td>
                    <td className="py-2 px-2">{row.subjectsCompleted}/{row.subjectsTotal} submitted</td>
                    <td className="py-2 px-2">{row.hasComment ? <Badge tone="sage">Added</Badge> : <Badge tone="slate">Missing</Badge>}</td>
                    <td className="py-2 px-2"><Badge tone={STATUS_TONE[row.resultStatus]}>{STATUS_LABEL[row.resultStatus]}</Badge></td>
                    <td className="py-2 px-2 text-xs text-[var(--brass-600)]">Review →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {loadingCard ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : !card ? (
        <p className="text-sm text-[var(--slate-500)]">Select a student above to review their result.</p>
      ) : (
        <div className="space-y-4">
          {/* Student Information */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold">Student Information</h3>
              {existing && <Badge tone={STATUS_TONE[existing.status]}>{STATUS_LABEL[existing.status]}</Badge>}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
              <p><span className="text-[var(--slate-500)]">Name:</span> {student?.firstName} {student?.lastName}</p>
              <p><span className="text-[var(--slate-500)]">Admission No.:</span> {student?.admissionNumber}</p>
              <p><span className="text-[var(--slate-500)]">Class:</span> {selectedClass?.name}</p>
              <p><span className="text-[var(--slate-500)]">Arm:</span> {selectedClass?.arm || '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <Field label="Days present"><Input type="number" min="0" value={card.daysPresent} onChange={(e) => setCard({ ...card, daysPresent: e.target.value })} /></Field>
              <Field label="Total days"><Input type="number" min="0" value={card.totalDays} onChange={(e) => setCard({ ...card, totalDays: e.target.value })} /></Field>
            </div>
          </Card>

          {/* Academic Performance — read-only, entered by each subject teacher */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Academic Performance</h3>
            <div className="overflow-x-auto thin-scroll mb-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--paper-200)]">
                    {['Subject', 'Teacher', 'Total (100)', 'Grade', 'Status'].map((h) => (
                      <th key={h} className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(matrixRow?.subjects || []).map((s) => (
                    <tr key={s.subject._id || s.subject} className="border-b border-[var(--paper-200)] last:border-0">
                      <td className="py-2 px-2 whitespace-nowrap">{s.subject?.name || '—'}</td>
                      <td className="py-2 px-2 whitespace-nowrap text-[var(--slate-500)]">
                        {s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : '—'}
                        {s.viaClassTeacher && <span className="text-xs"> (as Class Teacher)</span>}
                      </td>
                      <td className="py-2 px-2 font-mono">{s.total ?? '—'}</td>
                      <td className="py-2 px-2">{s.total != null && <Badge tone="brass">{s.total >= 80 ? 'A' : s.total >= 70 ? 'B' : s.total >= 60 ? 'C' : s.total >= 50 ? 'D' : s.total >= 40 ? 'E' : 'F'}</Badge>}</td>
                      <td className="py-2 px-2"><Badge tone={SUBJECT_STATUS_TONE[s.status]}>{SUBJECT_STATUS_LABEL[s.status]}</Badge></td>
                    </tr>
                  ))}
                  {!matrixRow?.subjects?.length && (
                    <tr><td colSpan={5} className="py-4 text-center text-[var(--slate-500)]">No subjects assigned to this class yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--slate-500)] mt-2">
              Subject teachers add/remove subjects for this class from Classes &amp; Subjects — not from here.
            </p>
          </Card>

          {/* Result Summary */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Result Summary</h3>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
              <p><span className="text-[var(--slate-500)]">Total Score:</span> <span className="font-mono">{existing?.totalScore ?? 0}</span></p>
              <p><span className="text-[var(--slate-500)]">Average Score:</span> <span className="font-mono">{existing?.average ?? 0}</span></p>
              <p><span className="text-[var(--slate-500)]">Overall Position:</span> {existing?.positionInClass ? `${existing.positionInClass} of ${existing.classSize || '—'}` : 'Calculated once published'}</p>
            </div>
            <Field label="Next term begins">
              <Input type="date" value={card.nextTermBegins} onChange={(e) => setCard({ ...card, nextTermBegins: e.target.value })} />
            </Field>
          </Card>

          {/* Affective Domain */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Affective Domain (1–5)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {AFFECTIVE_TRAITS.map(([key, label]) => (
                <Field key={key} label={label}>
                  <RatingSelect value={card.affectiveDomain[key]} onChange={(v) => setCard({ ...card, affectiveDomain: { ...card.affectiveDomain, [key]: v } })} />
                </Field>
              ))}
            </div>
          </Card>

          {/* Psychomotor Domain */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Psychomotor Domain (1–5)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {PSYCHOMOTOR_TRAITS.map(([key, label]) => (
                <Field key={key} label={label}>
                  <RatingSelect value={card.psychomotorDomain[key]} onChange={(v) => setCard({ ...card, psychomotorDomain: { ...card.psychomotorDomain, [key]: v } })} />
                </Field>
              ))}
            </div>
          </Card>

          {/* Comments */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Comments</h3>
            <Field label="Class Teacher's Comment">
              <Textarea rows={2} value={card.teacherComment} onChange={(e) => setCard({ ...card, teacherComment: e.target.value })} />
            </Field>
            <p className="text-xs text-[var(--slate-500)] mt-2">
              Head Teacher / Principal's Comment: {existing?.principalComment || '— set by the admin during review, not editable here —'}
            </p>
          </Card>

          {/* Promotion */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Report Card Status</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Promoted to"><Input placeholder="e.g. JSS 3" value={card.promotedTo} onChange={(e) => setCard({ ...card, promotedTo: e.target.value })} /></Field>
              <Field label="Next class"><Input placeholder="e.g. JSS 3A" value={card.nextClass} onChange={(e) => setCard({ ...card, nextClass: e.target.value })} /></Field>
            </div>
          </Card>

          {error && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-[var(--sage-600)] bg-[var(--sage-100)] rounded-md px-3 py-2">{success}</p>}

          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={handleSaveComment} disabled={saving}>
              {saving ? 'Saving…' : 'Save Comment'}
            </Button>
            <Button
              variant="brass" onClick={handleSubmit}
              disabled={!existing || submitting || existing.status === 'submitted' || existing.status === 'approved'}
            >
              <Send size={15} /> {existing?.status === 'approved' ? 'Published' : existing?.status === 'submitted' ? 'Awaiting review' : submitting ? 'Submitting…' : 'Submit Result'}
            </Button>
            {existing && (
              <Button variant="ghost" onClick={handleDownload} disabled={downloading}>
                <FileDown size={15} /> {downloading ? 'Preparing…' : 'Download PDF'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
