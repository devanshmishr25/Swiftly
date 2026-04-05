import { ArrowRight, Search, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const userData = localStorage.getItem('swiftly_user');
  const user = userData ? JSON.parse(userData) : null;

  return (
    <div className="landing-page">
      <section className="hero-section container">
        <div className="hero-content animate-fade-in-up">
          <div className="badge glass-panel delay-100">
            ✨ The future of local services
          </div>
          <h1 className="hero-title delay-200">
            Get Daily Help <br/>
            <span className="text-gradient">Faster & Smarter.</span>
          </h1>
          <p className="hero-subtitle delay-300">
            Connect with reliable local service providers and instant delivery agents in seconds. From plumbers to groceries, we've got you covered.
          </p>
            <div className="hero-actions delay-400">
              {user ? (
                <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} className={`btn btn-lg hero-dashboard-btn ${user.role === 'admin' ? 'btn-error' : 'btn-primary'}`}>
                  {user.role === 'admin' ? 'Go to Admin Panel' : 'Go to Dashboard'} <ArrowRight size={20} />
                </Link>
              ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Exploring <ArrowRight size={20} />
                </Link>
                <Link to="/register?role=provider" className="btn btn-secondary btn-lg">
                  Become a Provider
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="hero-visual animate-fade-in-scale delay-300">
          <div className="visual-circle glow-circle-1"></div>
          <div className="visual-circle glow-circle-2"></div>
          <div className="mockup-card glass-panel main-mockup">
            <div className="mockup-header">
               <div className="mockup-avatar"></div>
               <div>
                 <h4>Alex Johnson</h4>
                 <p className="text-muted">Electrician • ⭐ 4.9</p>
               </div>
            </div>
            <div className="mockup-body">
              <div className="mockup-line"></div>
              <div className="mockup-line short"></div>
            </div>
            <button className="btn btn-primary w-full mt-sm">Book Now</button>
          </div>
          <div className="mockup-card glass-panel side-mockup floating">
             <div className="flex-row">
               <div className="icon-box"><Clock size={20} color="var(--accent-primary)"/></div>
               <div>
                 <h5>Arriving in 15m</h5>
                 <p className="text-muted">Grocery Delivery</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      <section className="features-section container animate-fade-in-up delay-400">
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Search size={28} /></div>
          <h3>Find Anyone instantly</h3>
          <p className="text-secondary">Smart search and location-based matching helps you find the right person quickly.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Clock size={28} /></div>
          <h3>Lightning Fast</h3>
          <p className="text-secondary">Book instantly and track your service provider or delivery agent on a live map.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><ShieldCheck size={28} /></div>
          <h3>Verified & Secure</h3>
          <p className="text-secondary">Every professional is verified. Secure connections and identity protection for all users.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
