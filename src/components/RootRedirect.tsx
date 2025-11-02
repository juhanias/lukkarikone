import { Navigate, useSearchParams } from 'react-router-dom';
import { useCalendarStore } from '../state/state-management';
import Landing from '../pages/Landing';

/**
 * Smart root component that redirects to /app if user has a calendar configured,
 * unless they explicitly want to see the landing page (via ?landing query param)
 */
export default function RootRedirect() {
  const [searchParams] = useSearchParams();
  const { getActiveCalendar } = useCalendarStore();
  const activeCalendar = getActiveCalendar();

  const hasActiveCalendar = Boolean(activeCalendar);
  const forceLanding = searchParams.has('landing');

  if (hasActiveCalendar && !forceLanding) {
    return <Navigate to="/app" replace />;
  }

  // Show landing page if no calendar configured or user explicitly requested it
  return <Landing />;
}
