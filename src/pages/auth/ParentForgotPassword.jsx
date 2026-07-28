import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { Button } from '../../components/ui/Primitives';
import { Field, Input } from '../../components/ui/Form';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3, DONE: 4 };

export default function ParentForgotPassword() {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyOtp(email, otp);
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-sm">
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
            Parent Password Reset
          </p>
        </div>

        {step === STEPS.EMAIL && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-sm text-gray-500 text-center -mt-2 mb-2">
              Enter the email address on your Parent account and we'll send you a verification code.
            </p>
            <Field label="Email Address">
              <Input
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            {error && <p className="text-sm text-pink-600 bg-pink-50 rounded-md px-3 py-2">{error}</p>}
            <Button type="submit" variant="brass" className="w-full" disabled={loading}>
              {loading ? 'Sending code…' : 'Send Verification Code'}
            </Button>
          </form>
        )}

        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-500 text-center -mt-2 mb-2">
              Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>.
            </p>
            <Field label="Verification Code">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center tracking-[0.5em] text-lg"
              />
            </Field>
            {error && <p className="text-sm text-pink-600 bg-pink-50 rounded-md px-3 py-2">{error}</p>}
            <Button type="submit" variant="brass" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Code'}
            </Button>
            <button
              type="button"
              onClick={() => setStep(STEPS.EMAIL)}
              className="w-full text-xs text-center text-gray-500 hover:text-blue-600"
            >
              Use a different email
            </button>
          </form>
        )}

        {step === STEPS.NEW_PASSWORD && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-500 text-center -mt-2 mb-2">
              Create a new password for your Parent account.
            </p>
            <Field label="New Password">
              <Input
                type="password"
                autoFocus
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Field label="Confirm New Password">
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            {error && <p className="text-sm text-pink-600 bg-pink-50 rounded-md px-3 py-2">{error}</p>}
            <Button type="submit" variant="brass" className="w-full" disabled={loading}>
              {loading ? 'Saving…' : 'Set New Password'}
            </Button>
          </form>
        )}

        {step === STEPS.DONE && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Button variant="brass" className="w-full" onClick={() => navigate('/parent/login', { replace: true })}>
              Go to Parent Login
            </Button>
          </div>
        )}

        {step !== STEPS.DONE && (
          <p className="text-xs text-center text-gray-500 mt-6">
            <Link to="/parent/login" className="text-blue-600 font-medium hover:underline">
              Back to Parent Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
