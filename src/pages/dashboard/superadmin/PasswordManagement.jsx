import { useState, useCallback, useEffect } from 'react';
import { usersApi } from '../../../api/resources';
import PageHeader from '../../../components/ui/PageHeader';
import { Card, Button, Badge, EmptyState, Spinner } from '../../../components/ui/Primitives';
import { Field, Input, Select } from '../../../components/ui/Form';
import { Search, KeyRound, History, Copy, Check } from 'lucide-react';

const ROLE_LABELS = {
  primary_student: 'Primary Student',
  secondary_student: 'Secondary Student',
  staff: 'Staff',
};

export default function PasswordManagement() {
  const [accountType, setAccountType] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [resettingId, setResettingId] = useState(null);
  const [tempPassword, setTempPassword] = useState(null); // { userId, password }
  const [copied, setCopied] = useState(false);

  const [logs, setLogs] = useState(null);
  const [logsLoading, setLogsLoading] = useState(true);

  const loadLogs = useCallback(() => {
    setLogsLoading(true);
    usersApi.getResetLogs({ limit: 50 }).then((r) => setLogs(r.data)).finally(() => setLogsLoading(false));
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  async function runSearch(e) {
    e?.preventDefault();
    setSearching(true);
    setHasSearched(true);
    setTempPassword(null);
    try {
      const params = { limit: 20 };
      if (accountType) params.accountType = accountType;
      else params.accountType = ['primary_student', 'secondary_student', 'staff'].join(',');
      if (search) params.search = search;
      const res = await usersApi.getAll(params);
      // If no accountType filter chosen, restrict client-side to student/staff only —
      // Admin accounts are never managed from this screen.
      const filtered = res.data.filter((u) => u.accountType !== 'super_admin');
      setResults(filtered);
    } finally {
      setSearching(false);
    }
  }

  async function handleReset(user) {
    if (!window.confirm(`Generate a new temporary password for ${user.fullName}? Their current password will stop working immediately.`)) return;
    setResettingId(user._id);
    setTempPassword(null);
    try {
      const res = await usersApi.resetPassword(user._id);
      setTempPassword({ userId: user._id, password: res.tempPassword });
      loadLogs();
    } finally {
      setResettingId(null);
    }
  }

  function copyTemp() {
    if (!tempPassword) return;
    navigator.clipboard?.writeText(tempPassword.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security"
        title="Password Management"
      />
      <p className="text-sm text-[var(--slate-500)] -mt-4">
        Search a Student or Staff account, then generate a new temporary password for them.
        Admin accounts reset their own password via the Admin Portal's Forgot Password flow.
      </p>

      <Card title="Search Accounts" eyebrow="Student & Staff">
        <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full sm:w-48">
            <Field label="Account Type">
              <Select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                <option value="">All (Student & Staff)</option>
                <option value="primary_student">Primary Student</option>
                <option value="secondary_student">Secondary Student</option>
                <option value="staff">Staff</option>
              </Select>
            </Field>
          </div>
          <div className="w-full flex-1">
            <Field label="Search">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, admission number, staff ID, or email"
              />
            </Field>
          </div>
          <Button type="submit" variant="brass" disabled={searching}>
            <Search size={15} /> {searching ? 'Searching…' : 'Search'}
          </Button>
        </form>
      </Card>

      {hasSearched && (
        <Card title="Results" eyebrow={`${results.length} account${results.length === 1 ? '' : 's'}`}>
          {searching ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : results.length === 0 ? (
            <EmptyState title="No matching accounts" body="Try a different name, ID, or email." />
          ) : (
            <div className="divide-y divide-[var(--paper-200)]">
              {results.map((user) => (
                <div key={user._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--ink-900)] truncate">{user.fullName}</p>
                    <p className="text-xs text-[var(--slate-500)] truncate">
                      {user.username || user.email} · <Badge tone="brass">{ROLE_LABELS[user.accountType] || user.accountType}</Badge>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      className="!px-3 !py-1.5 text-xs"
                      onClick={() => handleReset(user)}
                      disabled={resettingId === user._id}
                    >
                      <KeyRound size={13} /> {resettingId === user._id ? 'Resetting…' : 'Reset Password'}
                    </Button>
                    {tempPassword?.userId === user._id && (
                      <div className="flex items-center gap-2 bg-[var(--sage-100)] rounded-md px-2 py-1">
                        <code className="text-xs font-mono text-[var(--ink-900)]">{tempPassword.password}</code>
                        <button type="button" onClick={copyTemp} className="text-[var(--slate-600)] hover:text-[var(--ink-900)]">
                          {copied ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card title="Password Reset History" eyebrow={<span className="flex items-center gap-1"><History size={12} /> Recent activity</span>}>
        {logsLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !logs?.length ? (
          <EmptyState title="No password resets yet" body="Resets performed here, or via Admin OTP recovery, will show up in this log." />
        ) : (
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[var(--slate-500)] border-b border-[var(--paper-200)]">
                  <th className="py-2 pr-4">Date & Time</th>
                  <th className="py-2 pr-4">Performed By</th>
                  <th className="py-2 pr-4">Account Type</th>
                  <th className="py-2 pr-4">Account</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-[var(--paper-200)] last:border-0">
                    <td className="py-2 pr-4 text-[var(--slate-600)]">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4">{log.actor?.fullName || '—'}</td>
                    <td className="py-2 pr-4">
                      <Badge tone="brass">{log.details?.accountType || log.accountType || '—'}</Badge>
                    </td>
                    <td className="py-2 pr-4">{log.details?.targetName || log.details?.targetIdentifier || '—'}</td>
                    <td className="py-2 text-[var(--slate-600)]">
                      {log.action === 'auth.forgot_password_reset' ? 'Admin self-reset (OTP)' : 'Temporary password generated'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
