import { Link, useLocation } from 'react-router-dom';
import { Zap, Globe, Mail, MessageCircle, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const userData = localStorage.getItem('swiftly_user');
  const user = userData ? JSON.parse(userData) : null;

  // We do not want the footer on authentication pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <footer className="website-footer">
      <div className="footer-glow"></div>
      <div className="container">
        


        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <div className="brand-logo">
                <Zap size={24} color="var(--accent-primary)" />
              </div>
              <span className="brand-text text-primary">Swiftly</span>
            </Link>
            <p className="text-secondary mt-sm mb-md" style={{ lineHeight: '1.6' }}>
              Your one-stop platform for daily services. We connect you with verified local talent for all your modern needs.
            </p>
            <div className="social-links mt-md">
              <a href="#" className="social-icon"><Globe size={18} /></a>
              <a href="#" className="social-icon"><Mail size={18} /></a>
              <a href="#" className="social-icon"><MessageCircle size={18} /></a>
              <a href="#" className="social-icon"><Phone size={18} /></a>
            </div>
          </div>

          {user?.role !== 'provider' && user?.role !== 'admin' && (
            <div className="footer-links">
              <h4>Services</h4>
              <Link to="/services">Plumbing</Link>
              <Link to="/services">Cleaning</Link>
              <Link to="/services">Delivery</Link>
              <Link to="/services">Tutoring</Link>
            </div>
          )}

          <div className="footer-links">
            <h4>Company</h4>
            {user?.role !== 'admin' && <Link to="/about">About Us</Link>}
            {user?.role !== 'provider' && user?.role !== 'admin' && <Link to="/providers">For Providers</Link>}
            <Link to="/contact">Contact</Link>
            <Link to="/careers">Careers</Link>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="text-muted">© {new Date().getFullYear()} Swiftly Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span className="text-muted">Made with passion for local communities.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
