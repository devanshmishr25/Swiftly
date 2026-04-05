import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, User, Mail, Phone, MapPin, Calendar, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import './Auth.css'; // Reuse glass effects

const ProviderReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('swiftly_token');
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProviderDetail = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`/api/admin/users/${id}`, config);
        setProvider(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load provider details');
      } finally {
        setLoading(false);
      }
    };
    fetchProviderDetail();
  }, [id, token]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this professional?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/approve/${id}`, {}, config);
      alert('Provider has been approved successfully!');
      navigate('/admin');
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject and delete this application?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/admin/users/${id}`, config);
      alert('Application rejected and account deleted.');
      navigate('/admin');
    } catch (err) {
      alert('Rejection failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="container p-xl text-center"><h3>Verifying Credentials...</h3></div>;
  if (error) return <div className="container p-xl text-center text-error"><h3>{error}</h3><Link to="/admin" className="btn btn-secondary mt-md">Back to Admin</Link></div>;

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in-up" style={{maxWidth: '600px'}}>
        <header className="mb-xl">
           <button onClick={() => navigate('/admin')} className="btn btn-ghost mb-md">
             <ArrowLeft size={18} /> Back to Queue
           </button>
           <h2 className="flex-row gap-sm" style={{alignItems: 'center'}}>
             <ShieldCheck size={28} className="text-primary" />
             Review Application
           </h2>
           <p className="text-secondary">Verify professional documents and details</p>
        </header>

        <section className="review-card">
           <div className="provider-profile-summary mb-lg p-md glass-panel" style={{display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)'}}>
              <div className="avatar-large" style={{width: '80px', height: '80px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                 <User size={40} color="#fff" />
              </div>
              <div>
                 <h3>{provider.name}</h3>
                 <span className="badge" style={{background: 'var(--bg-primary)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)'}}>
                   {provider.category} Professional
                 </span>
              </div>
           </div>

           <div className="review-details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
              <div className="detail-item">
                 <label className="text-muted text-xs uppercase" style={{letterSpacing: '1px'}}>Email Address</label>
                 <div className="flex-row gap-xs mt-xs">
                    <Mail size={16} className="text-primary" />
                    <span>{provider.email}</span>
                 </div>
              </div>
              <div className="detail-item">
                 <label className="text-muted text-xs uppercase" style={{letterSpacing: '1px'}}>Phone Number</label>
                 <div className="flex-row gap-xs mt-xs">
                    <Phone size={16} className="text-primary" />
                    <span>{provider.phone}</span>
                 </div>
              </div>
              <div className="detail-item">
                 <label className="text-muted text-xs uppercase" style={{letterSpacing: '1px'}}>Service Location</label>
                 <div className="flex-row gap-xs mt-xs">
                    <MapPin size={16} className="text-primary" />
                    <span>{provider.location}</span>
                 </div>
              </div>
              <div className="detail-item">
                 <label className="text-muted text-xs uppercase" style={{letterSpacing: '1px'}}>Joined Date</label>
                 <div className="flex-row gap-xs mt-xs">
                    <Calendar size={16} className="text-primary" />
                    <span>{new Date(provider.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>

           <div className="approval-actions mt-xl pt-xl flex-row gap-md" style={{borderTop: '1px solid var(--border-color)'}}>
              <button onClick={handleApprove} className="btn btn-primary flex-1" style={{padding: '1rem', fontWeight: 700}}>
                 <CheckCircle size={20} /> Approve Professional
              </button>
              <button onClick={handleReject} className="btn btn-secondary text-error" style={{padding: '1rem 1.5rem'}}>
                 <XCircle size={20} /> Reject
              </button>
           </div>
        </section>
      </div>
    </div>
  );
};

export default ProviderReview;
