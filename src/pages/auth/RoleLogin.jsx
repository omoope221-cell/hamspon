import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { ApiError } from '../../api/client';
import { Button } from '../../components/ui/Primitives';
import { Field, Input } from '../../components/ui/Form';
import { dashboardHomeFor } from '../../utils/roles';

// Shared form behind every dedicated, role-locked login page
// (/admin/login, /staff/login, /student/login). Each page passes its own
// fixed `accountType` (or, for Student, a small Primary/Secondary
// sub-choice) — there is no shared role picker, and a Super Admin can
// only ever authenticate through /admin/login.
//
// Per the official portal design: every portal is the SAME centered,
// single-column layout — logo, school name, "Online Portal", form. No
// split-screen, side illustration, or promotional copy of any kind.
export default function RoleLogin({
  accountType,
  roleLabel,
  Icon,
  identifierLabel,
  identifierPlaceholder,
  identifierType = 'text',
  subOptions, // optional: [{ value, label }] — e.g. Primary/Secondary Student
  showForgotPasswordLink = false, // true for Admin and Parent
  forgotPasswordPath = '/admin/forgot-password',
}) {
  const { login } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedType, setSelectedType] = useState(accountType || subOptions?.[0]?.value);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(selectedType, identifier, password);
      const dest = location.state?.from?.pathname || dashboardHomeFor(user);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo + school identity — centered, nothing else */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={settings.logo || '/logo-removebg-preview.png'}
            alt={`${settings.schoolName || 'School'} logo`}
            className="h-16 w-16 object-contain mb-3"
          />
          <h1 className="text-lg font-bold text-blue-600 leading-tight">
            {settings.schoolName}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-500 mt-1">
            {roleLabel} Online Portal
          </p>
        </div>

        {subOptions && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {subOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedType(opt.value)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  selectedType === opt.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-blue-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={identifierLabel}>
            <Input
              type={identifierType}
              autoFocus
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={identifierPlaceholder}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p className="text-sm text-pink-600 bg-pink-50 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" variant="brass" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          {showForgotPasswordLink ? (
            <p className="text-xs text-center text-gray-500">
              <Link to={forgotPasswordPath} className="text-blue-600 font-medium hover:underline">
                Forgot Password?
              </Link>
            </p>
          ) : (
            <p className="text-xs text-center text-gray-500">
              <span className="font-medium text-gray-600">Forgot Password?</span>
              <br />
              Please contact your Super Admin.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
