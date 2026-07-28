import { BellRing } from 'lucide-react';
import ScaffoldPage from './ScaffoldPage';

// Distinct from the bell icon in the header (a user's own inbox) — this
// is where Admin composes and sends notifications out to roles/classes.
export default function AdminNotifications() {
  return (
    <ScaffoldPage
      eyebrow="Administration"
      title="Notifications"
      description="Compose and broadcast notifications to specific roles, classes, or the whole school — used to send announcements to staff and students."
      Icon={BellRing}
    />
  );
}
