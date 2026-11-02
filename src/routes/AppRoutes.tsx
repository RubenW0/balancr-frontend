import { Navigate, Route, Routes } from 'react-router-dom';
import { AvailabilityPage } from '../pages/AvailabilityPage';
import { CalendarPage } from '../pages/CalendarPage';
import { GoalsPage } from '../pages/GoalsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/calendar" replace />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/availability" element={<AvailabilityPage />} />
      {/* Old addresses: fixed events are now added in the calendar, activity goals became Goals. */}
      <Route path="/fixed-events" element={<Navigate to="/calendar" replace />} />
      <Route path="/activity-goals" element={<Navigate to="/goals" replace />} />
    </Routes>
  );
}
