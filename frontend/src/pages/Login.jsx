import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('+91 ');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const body = { phone: identifier.trim(), password };
      
    try {
      const response = await axios.post('/api/auth/login', body);
      console.log('Login success:', response.data);
      // Store token and user data
      localStorage.setItem('swiftly_token', response.data.token);
      localStorage.setItem('swiftly_user', JSON.stringify(response.data.user));
      // Hard redirect based on role so Navbar updates
      if (response.data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 && err.response?.data?.userId) {
        // Redirect to registration with userId to finish verification
        navigate(`/register?userId=${err.response.data.userId}&step=verify`);
        return;
      }
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in-scale">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="text-secondary">Sign in with your mobile number</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field with-icon" 
                placeholder="+91 00000 00000"
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
                type="password" 
                className="input-field with-icon" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="auth-action-row">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" title="Recover your account" className="forgot-link" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-secondary">
            Don't have an account? <Link to="/register" className="text-primary link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
