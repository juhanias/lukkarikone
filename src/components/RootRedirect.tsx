import { Navigate, useSearchParams } from 'react-router-dom';
import useConfigStore, { type ConfigState } from '../state/state-management';
import Landing from '../pages/Landing';

/**
 * Smart root component that redirects to /app if user has a calendar URL configured,
 * unless they explicitly want to see the landing page (via ?landing query param)
 */
export default function RootRedirect() {
  const [searchParams] = useSearchParams();
  const calendarUrl = useConfigStore((state: ConfigState) => state.config.calendarUrl);

  const hasCalendarUrl = Boolean(calendarUrl?.trim());
  const forceLanding = searchParams.has('landing');

  if (hasCalendarUrl && !forceLanding) {
    return <Navigate to="/app" replace />;
  }

  // Show landing page if no calendar URL or user explicitly requested it
  return <Landing />;
}
