import { useEffect, useState, useCallback } from 'react';
import { classesApi, subjectsApi, sessionsApi, studentsApi, resultsApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Badge, Spinner } from '../../../components/ui/Primitives';
import { Field, Select, Input, Textarea } from '../../../components/ui/Form';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../api/client';
import { downloadReportCard } from '../../../utils/downloadReportCard';
import { Trash2, Plus, FileDown } from 'lucide-react';

const AFFECTIVE_TRAITS = [
  ['punctuality', 'Punctuality'], ['neatness', 'Neatness'], ['honesty', 'Honesty'], ['respect', 'Respect'],
  ['leadership', 'Leadership'], ['cooperation', 'Cooperation'], ['initiative', 'Initiative'],
  ['responsibility', 'Responsibility'], ['selfControl', 'Self-Control'],
];
const PSYCHOMOTOR_TRAITS = [
  ['handwriting', 'Handwriting'], ['creativity', 'Creativity'], ['drawing', 'Drawing'], ['sports', 'Sports'],
  ['musicalSkills', 'Musical Skills'], ['practicalSkills', 'Practical Skills'], ['communication', 'Communication'],
];
const GRADE_SCALE = [
  ['80 – 100', 'A', 'Excellent'], ['70 – 79', 'B', 'Very Good'], ['60 – 69', 'C', 'Good'],
  ['50 – 59', 'D', 'Fair'], ['40 – 49', 'E', 'Pass'], ['0 – 39', 'F', 'Fail'],
];

function computeGrade(total) {
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 60) return 'C';
  if (total >= 50) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

function RatingSelect({ value, onChange }) {
  return (
    <Select value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
      <option value="">—</option>
      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
    </Select>
  );
}

const BLANK_CARD = () => ({
  scores: [], // { subject, subjectId, ca1, ca2, assignment, exam }
  teacherComment: '',
  daysPresent: '', totalDays: '',
  affectiveDomain: {}, psychomotorDomain: {},
  nextTermBegins: '', promotedTo: '', nextClass: '',
});

// The Class Teacher opens a report card by picking one student, sees the
// full template (student info, every subject they're taking, both
// behaviour domains, promotion status), can add/remove/edit subject rows
// freely, and saves the whole card in one go. Saving publishes it
// immediately to the student/parent portals.
export default function StaffResults() {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [term, setTerm] = useState('First Term');
  const [studentId, setStudentId] = useState('');
  const [addSubjectId, setAddSubjectId] = useState('');

  const [existing, setExisting] = useState(null); // the current Result document, if any
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCard, setLoadingCard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([classesApi.getAll({ limit: 200 }), subjectsApi.getAll({ limit: 200 }), sessionsApi.getAll({ limit: 20 })])
      .then(([c, s, ses]) => {
        const owned = c.data.filter((cls) => (cls.classTeacher?._id || cls.classTeacher) === user.staffProfile);
        setMyClasses(owned);
        if (owned.length) setClassId(owned[0]._id);
        setAllSubjects(s.data);
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

  const loadCard = useCallback(() => {
    if (!studentId || !sessionId || !term) { setExisting(null); setCard(null); return; }
    setLoadingCard(true); setError(''); setSuccess('');
    resultsApi.getAll({ student: studentId, session: sessionId, term, limit: 1 }).then((r) => {
      const result = r.data[0] || null;
      setExisting(result);
      setCard({
        scores: (result?.scores || []).map((s) => ({
          subjectId: s.subject?._id || s.subject, subjectName: s.subject?.name || '—',
          ca1: s.ca1 ?? 0, ca2: s.ca2 ?? 0, assignment: s.assignment ?? 0, exam: s.exam ?? 0,
          grade: s.grade, total: s.total, position: s.position,
        })),
        teacherComment: result?.teacherComment || '',
        daysPresent: result?.attendance?.daysPresent ?? '', totalDays: result?.attendance?.totalDays ?? '',
        affectiveDomain: result?.affectiveDomain || {}, psychomotorDomain: result?.psychomotorDomain || {},
        nextTermBegins: result?.nextTermBegins ? result.nextTermBegins.slice(0, 10) : '',
        promotedTo: result?.promotedTo || '', nextClass: result?.nextClass || '',
      });
    }).finally(() => setLoadingCard(false));
  }, [studentId, sessionId, term]);

  useEffect(() => { loadCard(); }, [loadCard]);

  function addSubjectRow() {
    if (!addSubjectId) return;
    const subj = allSubjects.find((s) => s._id === addSubjectId);
    if (!subj || card.scores.some((s) => s.subjectId === addSubjectId)) return;
    setCard((c) => ({ ...c, scores: [...c.scores, { subjectId: subj._id, subjectName: subj.name, ca1: 0, ca2: 0, assignment: 0, exam: 0 }] }));
    setAddSubjectId('');
  }
  function removeSubjectRow(subjectId) {
    setCard((c) => ({ ...c, scores: c.scores.filter((s) => s.subjectId !== subjectId) }));
  }
  function updateScoreField(subjectId, field, value) {
    setCard((c) => ({ ...c, scores: c.scores.map((s) => (s.subjectId === subjectId ? { ...s, [field]: value } : s)) }));
  }

  const previewTotal = (row) => Number(row.ca1 || 0) + Number(row.ca2 || 0) + Number(row.assignment || 0) + Number(row.exam || 0);
  const cardTotal = card ? card.scores.reduce((sum, r) => sum + previewTotal(r), 0) : 0;
  const cardAverage = card && card.scores.length ? +(cardTotal / card.scores.length).toFixed(2) : 0;

  async function handleSave() {
    if (!card.scores.length) { setError('Add at least one subject before saving.'); return; }
    setError(''); setSuccess(''); setSaving(true);
    try {
      await resultsApi.upsert({
        student: studentId, class: classId, session: sessionId, term,
        scores: card.scores.map((s) => ({ subject: s.subjectId, ca1: Number(s.ca1) || 0, ca2: Number(s.ca2) || 0, assignment: Number(s.assignment) || 0, exam: Number(s.exam) || 0 })),
        teacherComment: card.teacherComment,
        attendance: { daysPresent: card.daysPresent === '' ? null : Number(card.daysPresent), totalDays: card.totalDays === '' ? null : Number(card.totalDays) },
        affectiveDomain: card.affectiveDomain,
        psychomotorDomain: card.psychomotorDomain,
        nextTermBegins: card.nextTermBegins || null,
        promotedTo: card.promotedTo,
        nextClass: card.nextClass,
      });
      setSuccess('Saved — this report card is now visible in the student and parent portals.');
      loadCard();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save this report card.');
    } finally { setSaving(false); }
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
  const availableSubjects = card ? allSubjects.filter((s) => !card.scores.some((sc) => sc.subjectId === s._id)) : [];

  if (!loading && !myClasses.length) {
    return (
      <div>
        <PageHeader eyebrow="Class Teacher" title="Report Cards" />
        <Card>
          <p className="text-sm text-[var(--slate-500)] text-center py-8">
            You haven't been assigned as Class Teacher for any class yet — contact your Super Admin to be assigned
            before you can fill report cards.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Class Teacher" title="Report Cards" />
      <p className="text-sm text-[var(--slate-500)] -mt-4 mb-6">
        Select a student to open their report card. Add or remove subjects as needed, fill in everything, then save —
        it's visible to the student and parent right away.
      </p>

      <Card className="mb-4">
        <div className="grid sm:grid-cols-4 gap-4">
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

      {loadingCard ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : !card ? (
        <p className="text-sm text-[var(--slate-500)]">Select a student to open their report card.</p>
      ) : (
        <div className="space-y-4">
          {/* Student Information */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold">Student Information</h3>
              {existing && <Badge tone="sage">Published</Badge>}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
              <p><span className="text-[var(--slate-500)]">Name:</span> {student?.firstName} {student?.lastName}</p>
              <p><span className="text-[var(--slate-500)]">Admission No.:</span> {student?.admissionNumber}</p>
              <p><span className="text-[var(--slate-500)]">Class:</span> {selectedClass?.name}</p>
              <p><span className="text-[var(--slate-500)]">Arm:</span> {selectedClass?.arm || '—'}</p>
              <p><span className="text-[var(--slate-500)]">Gender:</span> {student?.gender || '—'}</p>
              <p><span className="text-[var(--slate-500)]">Date of Birth:</span> {student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <Field label="Days present"><Input type="number" min="0" value={card.daysPresent} onChange={(e) => setCard({ ...card, daysPresent: e.target.value })} /></Field>
              <Field label="Total days"><Input type="number" min="0" value={card.totalDays} onChange={(e) => setCard({ ...card, totalDays: e.target.value })} /></Field>
            </div>
          </Card>

          {/* Academic Performance */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Academic Performance</h3>
            <div className="overflow-x-auto thin-scroll mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--paper-200)]">
                    {['Subject', 'CA1 (10)', 'CA2 (10)', 'Assign. (10)', 'Exam (70)', 'Total (100)', 'Grade', 'Position', ''].map((h) => (
                      <th key={h} className="text-left font-mono text-[11px] uppercase tracking-wider text-[var(--slate-500)] py-2 px-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {card.scores.map((row) => (
                    <tr key={row.subjectId} className="border-b border-[var(--paper-200)] last:border-0">
                      <td className="py-2 px-2 whitespace-nowrap">{row.subjectName}</td>
                      {['ca1', 'ca2', 'assignment', 'exam'].map((field) => (
                        <td key={field} className="py-2 px-2">
                          <input
                            type="number" min="0" max={field === 'exam' ? 70 : 10}
                            value={row[field]}
                            onChange={(e) => updateScoreField(row.subjectId, field, e.target.value)}
                            className="w-14 rounded border border-[var(--paper-200)] px-2 py-1 text-sm"
                          />
                        </td>
                      ))}
                      <td className="py-2 px-2 font-mono">{previewTotal(row)}</td>
                      <td className="py-2 px-2"><Badge tone="brass">{computeGrade(previewTotal(row))}</Badge></td>
                      <td className="py-2 px-2">{row.position || '—'}</td>
                      <td className="py-2 px-2">
                        <button onClick={() => removeSubjectRow(row.subjectId)} className="text-[var(--rust-500)] hover:bg-[var(--rust-100)] rounded-md p-1" aria-label="Remove subject">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!card.scores.length && (
                    <tr><td colSpan={9} className="py-4 text-center text-[var(--slate-500)]">No subjects added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2">
              <Select value={addSubjectId} onChange={(e) => setAddSubjectId(e.target.value)} className="max-w-xs">
                <option value="">Add a subject…</option>
                {availableSubjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </Select>
              <Button variant="ghost" onClick={addSubjectRow} disabled={!addSubjectId}><Plus size={15} /> Add subject</Button>
            </div>
          </Card>

          {/* Result Summary */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Result Summary</h3>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
              <p><span className="text-[var(--slate-500)]">Total Score:</span> <span className="font-mono">{cardTotal}</span></p>
              <p><span className="text-[var(--slate-500)]">Average Score:</span> <span className="font-mono">{cardAverage}</span></p>
              <p><span className="text-[var(--slate-500)]">Grade:</span> <Badge tone="brass">{computeGrade(cardAverage)}</Badge></p>
              <p><span className="text-[var(--slate-500)]">Overall Position:</span> {existing?.positionInClass ? `${existing.positionInClass} of ${existing.classSize || '—'}` : 'Calculated after saving'}</p>
            </div>
            <Field label="Next term begins">
              <Input type="date" value={card.nextTermBegins} onChange={(e) => setCard({ ...card, nextTermBegins: e.target.value })} />
            </Field>
          </Card>

          {/* Grade Scale (reference) */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Grade Scale</h3>
            <table className="text-sm">
              <tbody>
                {GRADE_SCALE.map(([range, grade, remark]) => (
                  <tr key={grade}><td className="pr-6 py-0.5">{range}</td><td className="pr-6 py-0.5 font-bold">{grade}</td><td className="py-0.5 text-[var(--slate-500)]">{remark}</td></tr>
                ))}
              </tbody>
            </table>
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
              Head Teacher / Principal's Comment: {existing?.principalComment || '— set by the Super Admin/Principal, not editable here —'}
            </p>
          </Card>

          {/* Report Card Status */}
          <Card>
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass-600)] font-bold mb-3">Report Card Status</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Promoted to"><Input placeholder="e.g. JSS 3" value={card.promotedTo} onChange={(e) => setCard({ ...card, promotedTo: e.target.value })} /></Field>
              <Field label="Next class"><Input placeholder="e.g. JSS 3A" value={card.nextClass} onChange={(e) => setCard({ ...card, nextClass: e.target.value })} /></Field>
            </div>
          </Card>

          {error && <p className="text-sm text-[var(--rust-500)] bg-[var(--rust-100)] rounded-md px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-[var(--sage-600)] bg-[var(--sage-100)] rounded-md px-3 py-2">{success}</p>}

          <div className="flex gap-3">
            <Button variant="brass" onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Saving…' : existing ? 'Save Changes — Update Portal' : 'Save & Send to Parent/Student Portal'}
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
