import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Clean phone number
    const cleanPhone = phone.replace(/\s+/g, '');

    try {
      const payload = { 
        name, 
        email, 
        phone: cleanPhone, 
        password, 
        role, 
        category: role === 'provider' ? category : "",
        isAutoVerified: true // Keep verification easy
      };
      
      await axios.post('/api/auth/register', payload);
      alert('Registration successful! You can now login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create account. Try a different email or phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in-scale">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="text-secondary">Join the Swiftly marketplace today</p>
        </div>

        <div className="role-selector">
          <button 
            onClick={() => setRole('customer')} 
            className={`role-btn ${role === 'customer' ? 'active' : ''}`}
          >Customer</button>
          <button 
            onClick={() => setRole('provider')} 
            className={`role-btn ${role === 'provider' ? 'active' : ''}`}
          >Service Provider</button>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          {error && <div className="error-message" style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field with-icon" 
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                className="input-field with-icon" 
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field with-icon" 
                placeholder="+91 00000 00000"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('+91 ')) {
                    setPhone(val);
                  } else if (val === '' || val.length < 4) {
                    setPhone('+91 ');
                  }
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

          {role === 'provider' && (
            <div className="input-group animate-slide-up">
              <label className="input-label">Service Category</label>
              <select 
                className="input-field auth-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select your service</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrician">Electrician</option>
                <option value="Chef">Chef</option>
                <option value="Driver">Driver</option>
                <option value="Mechanic">Mechanic</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
            {loading ? 'Creating Account...' : 'Sign Up Now'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="text-primary link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
