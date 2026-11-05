import { BrowserRouter, NavLink } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.3 3h3.4l.5 2.6 1.6.9 2.5-.9 1.7 2.9-2 1.8v1.4l2 1.8-1.7 2.9-2.5-.9-1.6.9-.5 2.6h-3.4l-.5-2.6-1.6-.9-2.5.9-1.7-2.9 2-1.8v-1.4l-2-1.8 1.7-2.9 2.5.9 1.6-.9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <span className="app-title">Balancr</span>
        <nav className="app-nav">
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/goals">Goals</NavLink>
        </nav>
        <NavLink to="/availability" className="app-settings-link" title="Availability" aria-label="Availability">
          <GearIcon />
        </NavLink>
      </header>
      <main>
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;
