import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import Logo from './components/Logo';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-mailmind-card border-b border-mailmind-teal/20 shadow-soft">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex gap-3">
            <Link
              to="/"
              className={`px-5 py-2.5 rounded-xl font-medium transition-smooth ${
                location.pathname === '/'
                  ? 'bg-gradient-primary text-white shadow-glow-orange'
                  : 'text-mailmind-text-muted hover:text-mailmind-text-light hover:bg-mailmind-bg'
              }`}
            >
              Inbox Analyzer
            </Link>
            <Link
              to="/chat"
              className={`px-5 py-2.5 rounded-xl font-medium transition-smooth ${
                location.pathname === '/chat'
                  ? 'bg-gradient-primary text-white shadow-glow-orange'
                  : 'text-mailmind-text-muted hover:text-mailmind-text-light hover:bg-mailmind-bg'
              }`}
            >
              Chat Agent
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-mailmind-bg">
        <Navigation />
        <Routes>
          <Route path="/" element={<Inbox />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

