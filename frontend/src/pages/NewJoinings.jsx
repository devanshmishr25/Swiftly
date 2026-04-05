import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, CheckCircle, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import './AdminDashboard.css';

const NewJoinings = () => {
  const userData = localStorage.getItem('swiftly_user');
  const user = userData ? JSON.parse(userData) : null;
  const token = localStorage.getItem('swiftly_token');
  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const fetchPending = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/admin/pending', config);
      setPendingUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch pending joinings:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Approve ${name} as a professional provider?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/admin/approve/${id}`, {}, config);
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
      alert(`${name} is now live!`);
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject and delete ${name}'s application?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/admin/users/${id}`, config);
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
    } catch (err) {
      alert('Rejection failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="admin-dashboard-layout container animate-fade-in-up">
      <header className="admin-header glass-panel">
        <div className="flex-row gap-sm" style={{alignItems: 'center'}}>
           <ShieldCheck size={32} color="var(--accent-primary)" />
           <div>
             <h2>New Joining Queue</h2>
             <p className="text-secondary">Review and authorize new system professionals</p>
           </div>
        </div>
        <button onClick={fetchPending} className="btn btn-secondary">
          {loading ? 'Refreshing...' : <><RefreshCw size={18} /> Refresh</>}
        </button>
      </header>

      <section className="admin-users-list mt-xl glass-panel animate-fade-in-scale" style={{ minHeight: '60vh' }}>
        <div className="table-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
            <UserPlus size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>Pending Applications</h3>
          </div>
          
          <div style={{
            background: 'var(--accent-primary)',
            color: '#fff',
            padding: '0.4rem 1.2rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            animation: pendingUsers.length > 0 ? 'pulse-subtle 2s infinite' : 'none'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></span>
            {pendingUsers.length === 1 ? '1 APPLICATION WAITING' : `${pendingUsers.length} APPLICATIONS WAITING`}
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Specialty</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(u => (
                <tr key={u._id}>
                  <td style={{fontWeight: 700}}>
                    <Link to={`/admin/review/${u._id}`} className="text-primary hover-glow" style={{textDecoration: 'none'}}>
                      {u.name}
                    </Link>
                  </td>
                  <td><span className="category-tag-mini">{u.category}</span></td>
                  <td className="text-secondary text-sm">{u.email}<br/>{u.phone}</td>
                  <td className="text-secondary text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button 
                        onClick={() => handleApprove(u._id, u.name)} 
                        className="btn btn-success"
                        style={{padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700}}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(u._id, u.name)} 
                        className="btn btn-ghost text-error"
                        style={{padding: '0.4rem', borderRadius: '50%'}}
                        title="Reject & Delete"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && pendingUsers.length === 0 && (
            <div className="text-center p-xl">
               <div className="mb-md"><CheckCircle size={48} className="text-success" opacity={0.3} /></div>
               <h4 className="text-secondary">Clean Slate!</h4>
               <p className="text-muted">All provider applications have been processed.</p>
               <Link to="/admin" className="btn btn-primary mt-lg">Back to Admin Stats</Link>
            </div>
          )}
          {loading && <div className="text-center p-xl text-muted">Fetching latest applications...</div>}
        </div>
      </section>
    </div>
  );
};

export default NewJoinings;
