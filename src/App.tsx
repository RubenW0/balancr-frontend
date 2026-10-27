import { BrowserRouter, NavLink } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <span className="app-title">Balancr</span>
        <nav className="app-nav">
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/fixed-events">Fixed Events</NavLink>
          <NavLink to="/activity-goals">Activity Goals</NavLink>
        </nav>
      </header>
      <main>
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;
