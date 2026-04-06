import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, CreditCard, User, Settings, LogOut, CheckCircle, XCircle, Phone, Save, ShieldCheck, MapPin, Bell, MessageSquare, Send, X } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import './Dashboard.css';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Delivery', 'Tutoring', 'Handyman', 'Beauty', 'Home Repair'];

const Dashboard = () => {
  const userData = localStorage.getItem('swiftly_user');
  const storedUser = userData ? JSON.parse(userData) : { role: 'customer', name: 'Guest' };
  const token = localStorage.getItem('swiftly_token');

  const [activeTab, setActiveTab] = useState('bookings');
  const [user, setUser] = useState(storedUser);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Settings Form State
  const [editName, setEditName] = useState(storedUser.name || '');
  const [editPhone, setEditPhone] = useState(storedUser.phone || '');
  const [editLocation, setEditLocation] = useState(storedUser.location || '');
  const [editCategory, setEditCategory] = useState(storedUser.category || '');
  
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Chat State
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    // Security check: Redirect admin users away from this dashboard
    if (storedUser.role === 'admin') {
      window.location.href = '/admin';
      return;
    }

    fetchData();

    // Socket.io initialization (Connect once on mount)
    const socket = io('https://swiftly-g3fg.onrender.com');
    
    if (storedUser.id || storedUser._id) {
      socketRef.current = socket;
      socket.emit('join', storedUser.id || storedUser._id);
    }

    socket.on('new_booking', (data) => {
      toast.success(data.message || 'New booking request!', {
        icon: '🔔',
        duration: 5000,
        position: 'top-right'
      });
      fetchData(); 
    });

    socket.on('status_update', (data) => {
      toast.success(data.message, {
        icon: '✨',
        duration: 5000,
        position: 'top-right'
      });
      fetchData(); 
    });

    socket.on('receive_message', (data) => {
      toast.success('New Message Received!', {
        icon: '💬',
        duration: 3000,
        position: 'top-right'
      });
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTab]); // Connect on tab switch or mount

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleOpenChat = async (booking) => {
    setActiveChat(booking);
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`/api/messages/${booking._id}`, config);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
    setLoading(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgData = {
      sender: user.id || user._id,
      recipient: user.role === 'customer' ? activeChat.provider?._id : activeChat.customer?._id,
      booking: activeChat._id,
      text: chatInput,
      createdAt: new Date().toISOString()
    };

    // Emit via Socket
    socketRef.current.emit('send_message', msgData);

    // Append to local state immediately
    setMessages(prev => [...prev, msgData]);
    setChatInput('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Always sync user data from server to check for approval status changes
      const userRes = await axios.get('/api/auth/me', config);
      setUser(userRes.data);
      localStorage.setItem('swiftly_user', JSON.stringify(userRes.data));

      if (activeTab === 'settings') {
        setEditName(userRes.data.name);
        setEditPhone(userRes.data.phone || '');
        setEditLocation(userRes.data.location || '');
        setEditCategory(userRes.data.category || '');
      } else {
        const bookingsRes = await axios.get(`/api/bookings/my?role=${userRes.data.role}`, config);
        setBookings(bookingsRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Auto-Logout on 401 Unauthorized (Stale Token Clean-up)
      if (err.response?.status === 401) {
        localStorage.removeItem('swiftly_token');
        localStorage.removeItem('swiftly_user');
        window.location.href = '/login';
      }
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/bookings/${id}/status`, { status }, config);
      fetchData();
      if (status === 'accepted') toast.success('Job accepted successfully!');
      if (status === 'completed') toast.success('Job marked as completed!');
    } catch (err) {
      console.error('Error updating status:', err);
      if (err.response?.status === 400) {
        toast.error(err.response.data.message, { duration: 5000 });
      } else {
        toast.error('Failed to update status');
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        name: editName,
        phone: editPhone,
        location: editLocation,
        category: editCategory
      };
      const res = await axios.put('/api/auth/profile', payload, config);
      
      setUser(res.data);
      localStorage.setItem('swiftly_user', JSON.stringify(res.data));
      setSaveMsg('Profile updated successfully!');
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('swiftly_token');
    localStorage.removeItem('swiftly_user');
    window.location.href = '/';
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: '#F59E0B', label: 'Pending' },
      'accepted': { color: '#3B82F6', label: 'Accepted' },
      'completed': { color: '#10B981', label: 'Completed' },
      'cancelled': { color: '#EF4444', label: 'Cancelled' }
    };
    const s = statusMap[status] || statusMap['pending'];
    return (
      <span className="status-badge" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="dashboard-layout container">
      <Toaster />
      <aside className="dashboard-sidebar glass-panel animate-fade-in-up">
        <div className="profile-section">
          <div className="profile-avatar">
            <User size={32} />
          </div>
          <div className="profile-info">
            <h3>{user.name}</h3>
            <div className="flex-row gap-xs">
              <p className="text-secondary uppercase-role">{user.role}</p>
              {user.role === 'provider' && user.category && (
                <span className="category-tag-mini">{user.category}</span>
              )}
            </div>
          </div>
        </div>

        <nav className="dashboard-nav">
          <button 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={20} /> {user.role === 'customer' ? 'My Bookings' : 'Requests'}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} /> Settings
          </button>
          
          <div className="nav-divider"></div>
          <button onClick={handleLogout} className="nav-item text-error"><LogOut size={20} /> Logout</button>
        </nav>
      </aside>

      <main className="dashboard-main animate-fade-in-scale delay-100">
        {user.role === 'provider' && user.isApproved === false && (
          <div className="glass-panel mb-lg p-md animate-fade-in-up" style={{ border: '1px solid var(--accent-primary)', background: 'rgba(59, 130, 246, 0.05)' }}>
            <div className="flex-row gap-sm" style={{ alignItems: 'center' }}>
               <ShieldCheck size={28} className="text-primary" />
               <div>
                  <h4 className="text-primary">Account Verification Pending</h4>
                  <p className="text-secondary text-sm">Our Super Admin team is reviewing your application. Once verified, you'll be visible to thousands of customers!</p>
               </div>
            </div>
          </div>
        )}
        {activeTab === 'bookings' ? (
          <>
            <header className="dashboard-header">
              <h2>{user.role === 'customer' ? 'My History' : 'Incoming Jobs'}</h2>
              <div className="stats-row">
                <div className="stat-card glass-panel">
                  <span className="text-muted">Total</span>
                  <h3>{bookings.length}</h3>
                </div>
                <div className="stat-card glass-panel">
                  <span className="text-muted">Active</span>
                  <h3>{bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length}</h3>
                </div>
              </div>
            </header>

            <section className="bookings-list">
              {loading ? (
                <div className="loading-state">Syncing with server...</div>
              ) : bookings.length > 0 ? (
                bookings.map(booking => (
                  <div key={booking._id} className="booking-card glass-panel">
                    <div className="booking-header">
                      <div>
                        <h4 className="text-primary">{booking.service?.category || 'General Service'}</h4>
                        <span className="text-muted" style={{fontSize: '0.8rem'}}>Booking ID: {booking._id.slice(-6)}</span>
                      </div>
                      {renderStatusBadge(booking.status)}
                    </div>
                    
                    <div className="booking-body-condensed">
                      <div className="info-grid">
                        <div className="info-row">
                          <Clock size={14} className="text-muted" />
                          <span>{new Date(booking.scheduledDate).toLocaleDateString()} {new Date(booking.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="info-row">
                          <User size={14} className="text-muted" />
                          <span>{user.role === 'customer' ? `Pro: ${booking.provider?.name}` : `Client: ${booking.customer?.name}`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="booking-footer" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <div className="action-buttons w-full">
                        {user.role === 'provider' && booking.status === 'pending' && (
                          <div className="flex-row gap-sm w-full">
                            <button onClick={() => handleStatusUpdate(booking._id, 'accepted')} className="btn btn-success flex-1" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                              <CheckCircle size={16} /> Accept
                            </button>
                            <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')} className="btn btn-error flex-1" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                              <XCircle size={16} /> Reject
                            </button>
                            <a 
                              href={`tel:${booking.customer?.phone}`} 
                              className="btn btn-ghost"
                              style={{ width: '44px', height: '44px', padding: 0, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}
                              title="Call Customer"
                            >
                              <Phone size={20} />
                            </a>
                          </div>
                        )}
                        {user.role === 'customer' && booking.status === 'pending' && (
                          <div className="flex-row gap-sm w-full">
                            <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')} className="btn btn-ghost text-error flex-1" style={{ fontSize: '0.85rem' }}>
                              Cancel Request
                            </button>
                            <a 
                              href={`tel:${booking.provider?.phone}`} 
                              className="btn btn-ghost"
                              style={{ width: '44px', height: '44px', padding: 0, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}
                              title="Call Provider"
                            >
                              <Phone size={20} />
                            </a>
                          </div>
                        )}
                        {booking.status === 'accepted' && (
                          <div className="w-full flex-column gap-sm">
                            <div className="text-success text-center" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              <CheckCircle size={14} /> Professional Booked
                            </div>
                            <div className="flex-row gap-sm w-full">
                              {user.role === 'provider' && (
                                <button 
                                  onClick={() => handleStatusUpdate(booking._id, 'completed')} 
                                  className="btn btn-primary flex-1" 
                                  style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                                >
                                  <CheckCircle size={16} /> Complete
                                </button>
                              )}
                              <button 
                                onClick={() => handleOpenChat(booking)} 
                                className="btn btn-secondary flex-1" 
                                style={{ fontWeight: 700, fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                              >
                                <MessageSquare size={16} /> Message
                              </button>
                              <a 
                                href={`tel:${user.role === 'customer' ? booking.provider?.phone : booking.customer?.phone}`} 
                                className="btn btn-ghost"
                                style={{ width: '44px', height: '44px', padding: 0, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}
                                title="Call now"
                              >
                                <Phone size={20} />
                              </a>
                            </div>
                          </div>
                        )}
                        {booking.status === 'completed' && (
                          <div className="w-full text-center">
                            <div className="text-success" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                              <CheckCircle size={16} /> Job Completed Successfully
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state glass-panel">
                  <Calendar size={48} className="text-muted mb-md" />
                  <h3>No activity yet</h3>
                  <p className="text-secondary">When {user.role === 'customer' ? 'you book' : 'clients request you'}, it will appear here.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="settings-view animate-fade-in-scale">
            <div className="settings-card-unified glass-panel">
              <header className="dashboard-header-compact text-center">
                <h2>Account Settings</h2>
                <p className="text-secondary">Update your profile details</p>
                <div className="nav-divider" style={{ margin: '1.5rem 0' }}></div>
              </header>

              {saveMsg && (
                <div className={`alert-msg ${saveMsg.includes('success') ? 'text-success' : 'text-error'}`} style={{ marginBottom: '2rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: saveMsg.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', textAlign: 'center', fontWeight: 600 }}>
                  {saveMsg}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="settings-form-unified">
                <div className="card-body">
                  <div className="input-group">
                    <label className="input-label">Public Name</label>
                    <input className="input-field-line" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full Name" />
                  </div>

                  <div className="input-group mt-md">
                    <label className="input-label">Service Address</label>
                    <textarea className="input-field-line" style={{ height: '60px', resize: 'none' }} value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Address..." />
                  </div>

                  {user.role === 'provider' && (
                    <div className="input-group mt-md">
                      <label className="input-label">Primary Specialty</label>
                      <select className="input-field-line" style={{ appearance: 'none' }} value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                        <option value="" disabled>Select Specialty</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="settings-footer mt-xl">
                  <button type="submit" className="btn btn-primary btn-lg w-full" disabled={saving}>
                    <Save size={18} /> {saving ? 'Saving...' : 'Update Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Chat Drawer */}
      {activeChat && (
        <div className="chat-drawer-overlay" onClick={() => setActiveChat(null)}>
          <div className="chat-drawer" onClick={e => e.stopPropagation()}>
            <header className="chat-header">
              <div>
                <h3 className="text-primary" style={{fontSize: '1.1rem'}}>{user.role === 'customer' ? activeChat.provider?.name : activeChat.customer?.name}</h3>
                <span className="text-secondary" style={{fontSize: '0.8rem'}}>{activeChat.service?.category} Request</span>
              </div>
              <button className="btn-ghost" onClick={() => setActiveChat(null)}><X size={20} /></button>
            </header>
            
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble ${msg.sender?._id === (user.id || user._id) || msg.sender === (user.id || user._id) ? 'message-sent' : 'message-received'}`}>
                  {msg.text}
                  <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-footer">
              <input 
                className="chat-input" 
                placeholder="Type a message..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{width: '44px', height: '44px', padding: 0, borderRadius: '50%'}}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
