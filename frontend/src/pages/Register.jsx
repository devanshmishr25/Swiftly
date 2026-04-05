import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Phone } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const locationSearch = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(locationSearch.search);
    const roleParam = params.get('role');
    if (roleParam === 'provider' || roleParam === 'customer') {
      setRole(roleParam);
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
    try {
      const payload = { name, email, password, role, phone, location, category };
      const response = await axios.post('http://localhost:5000/api/auth/register', payload);
      console.log('Registration success:', response.data);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="auth-page">
       <div className="auth-container register glass-panel animate-fade-in-scale">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="text-secondary">Join Swiftly and simplify your daily needs</p>
        </div>

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
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                className="input-field with-icon" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <label className="input-label">Phone Number <span className="text-muted">(Required)</span></label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={20} />
              <input 
                type="tel" 
                className="input-field with-icon" 
                placeholder="00000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Service Address / Location</label>
            <div className="input-wrapper" style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Flat No, Street, Landmark..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleDetectLocation}
                disabled={isLocating}
                style={{ padding: '0 12px', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
              >
                {isLocating ? '...' : 'Live 📍'}
              </button>
            </div>
          </div>

          {role === 'provider' && (
            <div className="input-group">
              <label className="input-label">Service Category</label>
              <select 
                className="input-field auth-select" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required={role === 'provider'}
              >
                <option value="" disabled>Select your primary service</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Delivery">Delivery</option>
                <option value="Tutoring">Tutoring</option>
                <option value="Handyman">Handyman</option>
                <option value="Beauty">Beauty</option>
                <option value="Home Repair">Home Repair</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full mt-md">
            Create Account <ArrowRight size={18} />
          </button>
        </form>

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
