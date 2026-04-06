import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowRight, Phone } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const locationSearch = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(locationSearch.search);
    const roleParam = params.get('role');
    if (roleParam === 'provider' || roleParam === 'customer') {
      setRole(roleParam);
    }
    const stepParam = params.get('step');
    const userParam = params.get('userId');
    if (stepParam === 'verify' && userParam) {
      setUserId(userParam);
      setOtpStep(true);
    }
  }, [locationSearch]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (response.data && response.data.display_name) {
          setLocation(response.data.display_name);
        } else {
          setError('Could not determine address. Please type manually.');
        }
      } catch (err) {
        setError('Location detection failed. Please type manually.');
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setError('Permission denied or location unavailable.');
      setIsLocating(false);
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name, email, password, role, phone, location, category };
      const response = await axios.post('/api/auth/register', payload);
      setUserId(response.data.userId);
      setOtpStep(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-registration', { userId, otp });
      // Login immediately
      localStorage.setItem('swiftly_token', response.data.token);
      localStorage.setItem('swiftly_user', JSON.stringify(response.data.user));
      
      if (response.data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
       <div className="auth-container register glass-panel animate-fade-in-scale">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="text-secondary">Join Swiftly and simplify your daily needs</p>
        </div>

        {!otpStep ? (
          <form onSubmit={handleRegister} className="auth-form">
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <div className="role-selector">
              <button 
                type="button" 
                className={`role-btn ${role === 'customer' ? 'active' : ''}`}
                onClick={() => setRole('customer')}
              >User</button>
              <button 
                type="button" 
                className={`role-btn ${role === 'provider' ? 'active' : ''}`}
                onClick={() => setRole('provider')}
              >Provider</button>
            </div>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  className="input-field with-icon" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={20} />
                <input 
                  type="text" 
                  className="input-field with-icon" 
                  placeholder="+91 00000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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

            <div className="input-group">
              <label className="input-label">City / Location</label>
              <div className="input-wrapper" style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ flex: 1 }}
                  placeholder="Enter your city"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0 12px', whiteSpace: 'nowrap', borderRadius: '12px', fontSize: '0.8rem' }}
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                >
                  {isLocating ? 'Locating...' : 'Detect'}
                </button>
              </div>
            </div>

            {role === 'provider' && (
              <div className="input-group animate-fade-in-up">
                <label className="input-label">Specialization / Service</label>
                <select 
                  className="input-field" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select your service</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Salon">Salon & Beauty</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Mechanic">Mechanic</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
              {loading ? 'Creating...' : 'Sign Up'} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="auth-form animate-fade-in-scale">
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
               <h3 className="text-primary">Verify Mobile</h3>
               <p className="text-secondary">Please enter the 6-digit OTP sent to your phone.</p>
            </div>
            
            <div className="input-group">
              <label className="input-label">6-Digit OTP</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input 
                  type="text" 
                  className="input-field with-icon" 
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
              {loading ? 'Verifying...' : 'Verify & Continue'} <ArrowRight size={18} />
            </button>

            <button type="button" onClick={() => setOtpStep(false)} className="btn btn-ghost w-full" style={{ marginTop: '1rem' }}>
              Change Details
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p className="text-secondary">
            Already have an account? <Link to="/login" className="text-primary link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
