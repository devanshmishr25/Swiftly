import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
      
    try {
      const response = await axios.post('/api/auth/login', { identifier, password });
      
      localStorage.setItem('swiftly_token', response.data.token);
      localStorage.setItem('swiftly_user', JSON.stringify(response.data.user));
      
      if (response.data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email/phone or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in-scale">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="text-secondary">Sign in with your email or mobile number</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="error-message" style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
          
          <div className="input-group">
            <label className="input-label">Email or Mobile Number</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field with-icon" 
                placeholder="email@example.com or mobile"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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

          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
            {loading ? 'Authenticating...' : 'Sign In Now'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="text-primary link">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
