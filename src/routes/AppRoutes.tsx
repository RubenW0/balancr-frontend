import { Navigate, Route, Routes } from 'react-router-dom';
import { TasksPage } from '../pages/TasksPage';
import { FixedEventsPage } from '../pages/FixedEventsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/fixed-events" element={<FixedEventsPage />} />
    </Routes>
  );
}
