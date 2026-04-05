import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Sun, Moon, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const userData = localStorage.getItem('swiftly_user');
  const user = userData ? JSON.parse(userData) : null;
  const navigate = useNavigate();
  const location = useLocation();

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('swiftly_theme') || 'light');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('swiftly_theme', theme);
  }, [theme]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('swiftly_token');
    localStorage.removeItem('swiftly_user');
    window.location.href = '/';
  };
  return (
    <header className="navbar-wrapper">
      <div className="container">
        <nav className="navbar glass-panel">
          <Link to="/" className="brand">
            <div className="brand-logo">
              <Zap size={24} color="var(--accent-primary)" />
            </div>
            <span className="brand-text">Swiftly</span>
          </Link>
          
          <div className="nav-links desktop-only">
             {user?.role !== 'provider' && user?.role !== 'admin' && <Link to="/services" className="nav-link">Services</Link>}
             {user?.role !== 'provider' && user?.role !== 'admin' && <Link to="/providers" className="nav-link">Providers</Link>}
             {user?.role !== 'admin' && <Link to="/about" className="nav-link">About</Link>}
             {user && user?.role !== 'admin' && (
               <Link to="/dashboard" className="nav-link dashboard-nav-item">Dashboard</Link>
             )}
             {user?.role === 'admin' && (
               <>
                 <Link to="/admin" className="nav-link text-error" style={{ fontWeight: 700 }}>Admin Panel</Link>
                 <Link to="/admin/joinings" className="nav-link text-primary" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    New Joinings 
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--accent-primary)', color: '#fff', borderRadius: '10px' }}>NEW</span>
                 </Link>
               </>
             )}
          </div>
          
          <div className="nav-actions">
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="desktop-only flex-row" style={{ gap: '1rem' }}>
              {user ? (
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost">Log In</Link>
                  <Link to="/register" className="btn btn-primary">Get Started</Link>
                </>
              )}
            </div>

            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
        <aside className={`mobile-sidebar glass-panel ${isMobileMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="sidebar-header">
             <span className="brand-text">Swiftly Menu</span>
             <button className="close-sidebar" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
          </div>
          
          <div className="sidebar-links">
            {user?.role !== 'provider' && user?.role !== 'admin' && <Link to="/services" className="sidebar-link" onClick={() => setIsMobileMenuOpen(false)}>Support & Services</Link>}
            {user?.role !== 'provider' && user?.role !== 'admin' && <Link to="/providers" className="sidebar-link" onClick={() => setIsMobileMenuOpen(false)}>Find Professionals</Link>}
            {user?.role !== 'admin' && <Link to="/about" className="sidebar-link" onClick={() => setIsMobileMenuOpen(false)}>About Swiftly</Link>}
            {user && user?.role !== 'admin' && (
              <Link to="/dashboard" className="sidebar-link active" onClick={() => setIsMobileMenuOpen(false)}>My Dashboard</Link>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="sidebar-link text-error" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
                <Link to="/admin/joinings" className="sidebar-link text-primary" onClick={() => setIsMobileMenuOpen(false)}>New Joining Queue</Link>
              </>
            )}
          </div>

          <div className="sidebar-footer">
            {user ? (
              <button onClick={handleLogout} className="btn btn-primary w-full">Logout Account</button>
            ) : (
              <div className="flex-column gap-md">
                <Link to="/login" className="btn btn-secondary w-full" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="btn btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Navbar;
