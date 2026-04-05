import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Users, Trash2, TrendingUp, RefreshCw, Eraser, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const userData = localStorage.getItem('swiftly_user');
  const user = userData ? JSON.parse(userData) : null;
  const token = localStorage.getItem('swiftly_token');

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/admin/users', config)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch admin dashboard:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}? This will remove all their data forever.`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
      setUsers(users.filter(u => u._id !== id));
      fetchAdminData(); // Refresh stats after deletion
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleClearBookings = async (id, name) => {
    if (!window.confirm(`Are you sure you want to clear all bookings and chat history for ${name}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/users/${id}/bookings`, config);
      fetchAdminData();
      alert(`Successfully cleared all bookings for ${name}.`);
    } catch (err) {
      alert('Clear failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading || !stats) {
    return (
      <div className="container" style={{ paddingTop: '80px', display: 'flex', justifyContent: 'center' }}>
        <h3 className="text-secondary">Loading Super Admin Modules...</h3>
      </div>
    );
  }

  const totalUsers = stats.users.customer + stats.users.provider;
  const customerPct = totalUsers > 0 ? Math.round((stats.users.customer / totalUsers) * 100) : 0;
  const providerPct = totalUsers > 0 ? Math.round((stats.users.provider / totalUsers) * 100) : 0;

  const bookingDistData = [
    { name: 'Pending', value: stats.bookings.pending },
    { name: 'Accepted', value: stats.bookings.accepted },
    { name: 'Completed', value: stats.bookings.completed },
    { name: 'Cancelled', value: stats.bookings.cancelled }
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B'];

  return (
    <div className="admin-dashboard-layout container animate-fade-in-up">
      <header className="admin-header glass-panel">
        <div className="flex-row gap-sm" style={{alignItems: 'center'}}>
           <ShieldAlert size={32} color="var(--accent-primary)" />
           <div>
             <h2>Super Admin Center</h2>
             <p className="text-secondary">Global overview of Swiftly ecosystem</p>
           </div>
        </div>
        <button onClick={fetchAdminData} className="btn btn-secondary"><RefreshCw size={18} /> Refresh</button>
      </header>

      <section className="stats-grid mt-xl">
        <div className="stat-card glass-panel">
          <span className="text-muted">Total Users</span>
          <h3>{stats.users.customer + stats.users.provider}</h3>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-muted">Total Providers</span>
          <h3>{stats.users.provider}</h3>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-muted">Total Bookings</span>
          <h3 className="text-primary">{stats.bookings.total}</h3>
        </div>
        <Link to="/admin/joinings" className="stat-card glass-panel hover-glow" style={{ border: '1px solid var(--accent-primary)', textDecoration: 'none' }}>
          <span className="text-muted">Pending Joinings</span>
          <h3 style={{ color: 'var(--accent-primary)' }}>{stats.pendingJoinings}</h3>
        </Link>
      </section>



      <section className="charts-section mt-xl flex-row gap-lg" style={{flexWrap: 'wrap'}}>
        <div className="chart-wrapper glass-panel flex-1" style={{minWidth: 0, height: '350px', overflow: 'hidden'}}>
           <h4 className="mb-md text-center">User Demographics</h4>
           <div className="demographics-custom-ui" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '2rem' }}>
             
             <div className="demo-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
               <div className="demo-stat-box" style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10B981' }}>{customerPct}%</div>
                 <div className="text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', marginTop: '0.5rem' }}>Customers</div>
                 <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{stats.users.customer} total</div>
               </div>
               
               <div className="demo-vs" style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>VS</div>

               <div className="demo-stat-box" style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#8B5CF6' }}>{providerPct}%</div>
                 <div className="text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', marginTop: '0.5rem' }}>Providers</div>
                 <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{stats.users.provider} total</div>
               </div>
             </div>

             <div className="demo-bar-container" style={{ width: '100%', height: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', overflow: 'hidden', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)' }}>
               <div className="demo-bar customer-bar" style={{ width: `${customerPct}%`, backgroundColor: '#10B981', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
               <div className="demo-bar provider-bar" style={{ width: `${providerPct}%`, backgroundColor: '#8B5CF6', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
             </div>

           </div>
        </div>
        <div className="chart-wrapper glass-panel flex-1" style={{minWidth: 0, height: '350px', overflow: 'hidden'}}>
           <h4 className="mb-md text-center">Booking Logistics</h4>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={bookingDistData}>
               <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
               <XAxis dataKey="name" stroke="var(--text-secondary)" />
               <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
               <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: 'var(--bg-card)', border: 'none', borderRadius: '8px'}} />
               <Bar dataKey="value" fill="var(--accent-primary)" radius={[4,4,0,0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-users-list mt-xl mb-xl glass-panel">
        <div className="table-title-row">
          <div className="flex-row gap-md" style={{alignItems: 'center'}}>
            <h3><Users size={20} className="inline-icon" /> Ecosystem Members</h3>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="btn btn-ghost"
              style={{ padding: '0.4rem 1rem', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', background: 'rgba(255,255,255,0.02)' }}
            >
              <option value="all">All Ecosystem Roles</option>
              <option value="customer">Only Verified Customers</option>
              <option value="provider">Only Approved Providers</option>
            </select>
          </div>
          <span className="badge text-secondary" style={{letterSpacing: '1px', fontWeight: 600}}>{users.filter(u => roleFilter === 'all' || u.role === roleFilter).length} / {users.length}</span>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email / Phone</th>
                <th>Location / Category</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => roleFilter === 'all' || u.role === roleFilter).map(u => (
                <tr key={u._id}>
                  <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>{u.name}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td className="text-secondary text-sm">
                    {u.email}<br/>{u.phone}
                  </td>
                  <td className="text-secondary text-sm">
                    {u.location || 'N/A'}<br/>
                    {u.role === 'provider' && <span className="text-primary">{u.category}</span>}
                  </td>
                  <td className="text-secondary text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleClearBookings(u._id, u.name)} 
                        className="btn btn-ghost text-secondary"
                        style={{padding: '0.4rem', borderRadius: '50%'}}
                        title="Clear all bookings for user"
                      >
                        <Eraser size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u._id, u.name)} 
                        className="btn btn-ghost text-error"
                        style={{padding: '0.4rem', borderRadius: '50%'}}
                        title="Delete User permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="text-center text-muted p-lg">No users found.</div>}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
