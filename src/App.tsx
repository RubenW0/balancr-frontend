import { BrowserRouter, Link } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <span className="app-title">Balancr</span>
        <nav className="app-nav">
          <Link to="/tasks">Tasks</Link>
          <Link to="/fixed-events">Fixed Events</Link>
        </nav>
      </header>
      <main>
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;
