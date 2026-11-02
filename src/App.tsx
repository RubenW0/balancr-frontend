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
          <NavLink to="/goals">Goals</NavLink>
          <NavLink to="/availability">Availability</NavLink>
        </nav>
      </header>
      <main>
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;
