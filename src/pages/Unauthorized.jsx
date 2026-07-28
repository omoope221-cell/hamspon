import { Link } from 'react-router-dom';
import Crest from '../components/ui/Crest';
import { Button } from '../components/ui/Primitives';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--paper-100)] text-center p-6">
      <Crest size={48} className="mb-4" />
      <h1 className="font-display text-2xl font-semibold text-[var(--ink-900)] mb-2">Access restricted</h1>
      <p className="text-sm text-[var(--slate-600)] max-w-sm mb-6">
        Your account doesn't have permission to view this page. If you think this is a mistake, contact the school administrator.
      </p>
      <Link to="/login"><Button variant="brass">Back to sign in</Button></Link>
    </div>
  );
}
