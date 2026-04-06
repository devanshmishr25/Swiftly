import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('+91 ');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Auto-fill admin for testing if clicking the Quick Button
    const phoneToSubmit = identifier.trim();
      
    try {
      const response = await axios.post('/api/auth/login', { phone: phoneToSubmit, password });
      
      localStorage.setItem('swiftly_token', response.data.token);
      localStorage.setItem('swiftly_user', JSON.stringify(response.data.user));
      
      // Clear all state and hard refresh to dashboard/admin
      if (response.data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = () => {
    setIdentifier('+91 00000 00000');
    setPassword('Admin@123');
    setIsAdminMode(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in-scale">
        <div className="auth-header">
          <div className="flex-center mb-md">
            {isAdminMode ? <ShieldCheck size={48} className="text-primary" /> : <Phone size={48} className="text-accent" />}
          </div>
          <h2>{isAdminMode ? 'Super Admin Login' : 'Welcome Back'}</h2>
          <p className="text-secondary">{isAdminMode ? 'Official System Access' : 'Sign in with your mobile number'}</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="error-message" style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
          
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field with-icon" 
                placeholder="+91 00000 00000"
                value={identifier}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('+91 ')) setIdentifier(val);
                  else if (val === '' || val.length < 4) setIdentifier('+91 ');
                }}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field with-icon" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="input-action-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`btn w-full ${isAdminMode ? 'btn-secondary' : 'btn-primary'}`} style={{ marginTop: '1rem' }}>
            {loading ? 'Authenticating...' : isAdminMode ? 'Enter Admin Panel' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer" style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
          {!isAdminMode ? (
            <>
              <button onClick={loginAsAdmin} className="text-secondary text-sm" style={{ border: 'none', background: 'none', cursor: 'pointer', marginBottom: '1rem' }}>
                <ShieldCheck size={14} /> Secret Admin Login
              </button>
              <p>Don't have an account? <Link to="/register" className="text-primary link">Create Account</Link></p>
            </>
          ) : (
            <button onClick={() => setIsAdminMode(false)} className="text-primary text-sm" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
               Back to Customer Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
