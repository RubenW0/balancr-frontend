import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <span className="app-title">Balancr</span>
      </header>
      <main>
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;
