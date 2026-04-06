import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP & Reset
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/request-otp', { phone: phone.trim() });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', { 
        phone: phone.trim(), 
        otp: otp.trim(), 
        newPassword 
      });
      setMessage(res.data.message);
      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in-scale" style={{ maxWidth: '450px' }}>
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%' }}>
               <ShieldCheck size={32} color="var(--accent-primary)" />
            </div>
          </div>
          <h2>{step === 1 ? 'Forgot Password?' : 'Reset Password'}</h2>
          <p className="text-secondary">
            {step === 1 
              ? "Enter your registered mobile number and we'll send you an OTP code." 
              : `6-digit code sent to ${phone}`}
          </p>
        </div>

        {error && (
          <div style={{ 
            color: '#ef4444', 
            background: 'rgba(239, 68, 68, 0.1)', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '1rem', 
            fontSize: 'var(--text-sm)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {message && !error && (
          <div style={{ 
            color: '#10b981', 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '1rem', 
            fontSize: 'var(--text-sm)',
            textAlign: 'center'
          }}>
            <CheckCircle size={14} style={{ marginRight: '5px' }} /> {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="auth-form">
            <div className="input-group">
              <label className="input-label">Mobile Number</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={20} />
                <input 
                  type="text" 
                  className="input-field with-icon" 
                  placeholder="Enter your registered phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Sending...' : 'Send OTP'} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="input-group">
              <label className="input-label">6-Digit OTP</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input 
                  type="text" 
                  className="input-field with-icon" 
                  placeholder="000 000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required 
                  autoFocus
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                Note: Check your server logs (free tier) for the OTP code.
              </p>
            </div>

            <div className="input-group">
              <label className="input-label">New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input 
                  type="password" 
                  className="input-field with-icon" 
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Updating...' : 'Reset Password'} <ArrowRight size={18} />
            </button>
            <button type="button" onClick={() => setStep(1)} className="btn btn-ghost w-full" style={{ marginTop: '10px' }}>
              Back
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          <p className="text-secondary">
             Remember your password? <Link to="/login" className="text-primary link">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
