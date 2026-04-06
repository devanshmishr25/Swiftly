import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight, Phone, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../utils/firebase';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const navigate = useNavigate();
  const locationSearch = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(locationSearch.search);
    const roleParam = params.get('role');
    if (roleParam === 'provider' || roleParam === 'customer') {
      setRole(roleParam);
    }
  }, [locationSearch]);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => { console.log("Recaptcha verified"); }
    });
  };

  const onSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phone.replace(/\s+/g, ''); 
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setOtpStep(true);
      alert('Official Firebase OTP sent to your mobile!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send SMS. Check your phone number format.');
      if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await confirmationResult.confirm(otp);
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();

      const payload = { 
        name, 
        phone, 
        password, 
        role, 
        location: location || "Not provided",
        category,
        isAutoVerified: true 
      };
      
      await axios.post('/api/auth/register', payload);
      alert('Verification successful! Account activated.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in-scale">
        {!otpStep ? (
          <>
            <div className="auth-header">
              <h2>Get Started</h2>
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

            <form onSubmit={onSendOTP} className="auth-form">
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

              <div id="recaptcha-container"></div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
                {loading ? 'Processing...' : 'Verify Mobile Number'} <ArrowRight size={18} />
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-header">
              <div className="flex-center mb-md">
                <CheckCircle className="text-accent" size={48} />
              </div>
              <h2>Verify Mobile</h2>
              <p className="text-secondary">Official Firebase OTP sent to {phone}</p>
            </div>

            <form onSubmit={onVerifyOTP} className="auth-form">
              {error && <div className="error-message" style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
              
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Please enter the 6-digit confirmation code below.
              </p>

              <div className="input-group">
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    className="input-field text-center" 
                    style={{ fontSize: '1.5rem', letterSpacing: '8px', paddingLeft: '0' }}
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '1.5rem' }}>
                {loading ? 'Confirming...' : 'Activate Account'} <ArrowRight size={18} />
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="text-primary link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
