import { Navigate, Route, Routes } from 'react-router-dom';
import { FixedEventsPage } from '../pages/FixedEventsPage';
import { ActivityGoalsPage } from '../pages/ActivityGoalsPage';
import { CalendarPage } from '../pages/CalendarPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/fixed-events" replace />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/fixed-events" element={<FixedEventsPage />} />
      <Route path="/activity-goals" element={<ActivityGoalsPage />} />
    </Routes>
  );
}
