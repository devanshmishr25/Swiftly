import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, ArrowLeft, Wrench, Zap, Trash2, Truck,
  BookOpen, Hammer, Scissors, PaintBucket, Thermometer, Box,
  PhoneCall, BadgeCheck, Clock, X, Users, ArrowRight, Filter
} from 'lucide-react';
import axios from 'axios';
import './Providers.css';

const ICON_MAP = {
  Plumbing: Wrench,
  Electrical: Zap,
  Cleaning: Trash2,
  Delivery: Truck,
  Tutoring: BookOpen,
  Handyman: Hammer,
  Beauty: Scissors,
  'Home Repair': PaintBucket,
};

const CATEGORY_COLORS = {
  Plumbing: '#3B82F6',
  Electrical: '#F59E0B',
  Cleaning: '#10B981',
  Delivery: '#8B5CF6',
  Tutoring: '#EC4899',
  Handyman: '#14B8A6',
  Beauty: '#F97316',
  'Home Repair': '#6366F1',
};

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Delivery', 'Tutoring', 'Handyman', 'Beauty', 'Home Repair'];

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const ProviderCard = ({ provider, category, onBook, delay }) => {
  const CategoryIcon = ICON_MAP[category] || Wrench;
  const color = CATEGORY_COLORS[category] || '#6366F1';
  const initials = getInitials(provider.provider?.name);
  const provName = provider.provider?.name || 'Professional';

  return (
    <div
      className="provider-card glass-panel animate-fade-in-scale"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="card-accent-bar" style={{ background: color }} />
      <div className="card-avatar-row">
        <div className="avatar-circle" style={{ boxShadow: `0 0 0 3px ${color}40` }}>
          <span className="avatar-initials" style={{ color }}>{initials}</span>
        </div>
        <div className="card-verified-badge">
          <BadgeCheck size={16} style={{ color }} />
          <span>Verified</span>
        </div>
      </div>
      <h3 className="card-name">{provName}</h3>
      <div className="card-category-tag" style={{ background: `${color}18`, color }}>
        <CategoryIcon size={14} />
        <span>{category}</span>
      </div>
      
      <div className="card-divider" />
      
      <div className="card-actions">
        <button
          className="btn btn-primary book-btn w-full"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
          onClick={() => onBook(provider)}
        >
          Book Professional Now
        </button>
      </div>
    </div>
  );
};

const Providers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProv, setSelectedProv] = useState(null);
  
  const userData = localStorage.getItem('swiftly_user');
  const user = userData ? JSON.parse(userData) : null;

  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingHour, setBookingHour] = useState('10');
  const [bookingPeriod, setBookingPeriod] = useState('AM');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      fetchProviders(selectedCategory);
      setSearchParams({ category: selectedCategory });
    } else {
      setProviders([]);
    }
  }, [selectedCategory]);

  const fetchProviders = async (cat) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/services?category=${cat}`);
      setProviders(res.data);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    }
    setLoading(false);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('swiftly_token')}` } };
      // Convert 12h format to 24h for ISO
      let hour24 = parseInt(bookingHour);
      if (bookingPeriod === 'PM' && hour24 < 12) hour24 += 12;
      if (bookingPeriod === 'AM' && hour24 === 12) hour24 = 0;
      const hourStr = hour24.toString().padStart(2, '0');
      
      const finalScheduledDate = `${bookingDate}T${hourStr}:00:00Z`;

      const payload = {
        service: selectedProv._id,
        customer: user.id || user._id, 
        provider: selectedProv.provider?._id || selectedProv.provider, 
        scheduledDate: finalScheduledDate,
        totalPrice: selectedProv.price || 500,
        notes: notes
      };
      
      console.log('Sending Booking Payload:', payload);
      await axios.post('http://localhost:5000/api/bookings', payload, config);
      alert('Booking request sent successfully!');
      setSelectedProv(null);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book.');
    }
    setBookingLoading(false);
  };

  const accentColor = CATEGORY_COLORS[selectedCategory] || 'var(--accent-primary)';
  const CategoryIcon = ICON_MAP[selectedCategory] || Filter;

  return (
    <div className="providers-listing-page">
      <div className="listing-hero discovery-hero" style={{ '--accent': accentColor }}>
        <div className="listing-hero-bg" style={{ background: `radial-gradient(ellipse at 60% 50%, ${accentColor}18 0%, transparent 70%)` }} />
        <div className="container discovery-hero-content">
          <div className="hero-text-center animate-fade-in-up">
            <span className="category-badge mb-md">Find an Expert</span>
            <h1 className="hero-title">Who are you looking for?</h1>
            <p className="hero-sub text-secondary">Instantly connect with certified professionals in your area.</p>
            
            <div className="discovery-selector-wrapper mt-xl">
              <div className="discovery-dropdown-container glass-panel">
                <Filter className="dropdown-icon" size={20} />
                <select 
                  className="discovery-select"
                  style={{ color: selectedCategory ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" disabled style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>Choose a Service Category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container listing-body">
        {!selectedCategory ? (
          <div className="listing-empty-state animate-fade-in">
             <div className="discovery-prompt-box glass-panel text-center">
                <Users size={48} className="text-accent mb-md" />
                <h3>Ready to start?</h3>
                <p className="text-secondary">Select a category above to see our verified list of local professionals.</p>
             </div>
          </div>
        ) : loading ? (
          <div className="listing-loading">
            <div className="spinner" style={{ borderTopColor: accentColor }} />
            <p className="text-secondary">Finding {selectedCategory} experts...</p>
          </div>
        ) : (
          <div className="providers-grid-container">
            {providers.length > 0 ? (
              <div className="providers-grid">
                {providers.map((prov, i) => (
                  <ProviderCard
                    key={prov._id}
                    provider={prov}
                    category={selectedCategory}
                    onBook={() => setSelectedProv(prov)}
                    delay={i * 80}
                  />
                ))}
              </div>
            ) : (
              <div className="listing-empty glass-panel">
                <div className="empty-icon" style={{ background: `${accentColor}18` }}>
                  <CategoryIcon size={48} style={{ color: accentColor }} />
                </div>
                <h3>No providers yet in {selectedCategory}</h3>
                <p className="text-secondary">Register as a provider and start receiving bookings instantly.</p>
                {user?.role !== 'customer' && (
                   <Link to="/register" className="btn btn-primary mt-md">Become a {selectedCategory} Provider</Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {(!user || user.role === 'customer') && (
        <section className="providers-footer-cta container animate-fade-in-up" style={{ paddingBottom: 'var(--spacing-3xl)' }}>
          <div className="footer-cta-card glass-panel" style={{ 
            background: `linear-gradient(180deg, ${accentColor}10, transparent)`, 
            border: `1px solid ${accentColor}25`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            position: 'relative'
          }}>
            <div className="cta-content" style={{ maxWidth: '700px', zIndex: 2 }}>
              <div className="badge mb-sm" style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40`, fontWeight: 700, margin: '0 auto', fontSize: '0.75rem' }}>
                Join Our Network
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.1, fontWeight: 800 }}>Earn more on your own terms.</h2>
              <p className="text-secondary" style={{ fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Connect with local customers and build your business on Swiftly.
              </p>
              
              <Link 
                to="/register?role=provider" 
                className="btn btn-primary btn-md hover-lift-glow" 
                style={{ 
                  background: `linear-gradient(135deg, ${accentColor}, var(--accent-secondary))`,
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  boxShadow: `0 8px 30px ${accentColor}40`,
                  fontWeight: 800,
                  margin: '0 auto',
                  display: 'inline-flex'
                }}
              >
                 Start Earning Today <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Link>
            </div>
            
            {/* Ambient Background Glow */}
            <div style={{
              position: 'absolute',
              width: '80%',
              height: '80%',
              background: `radial-gradient(circle, ${accentColor}08 0%, transparent 60%)`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}></div>
          </div>
        </section>
      )}

      {selectedProv && (
        <div className="service-modal-overlay animate-fade-in" onClick={() => setSelectedProv(null)}>
          <div className="service-modal glass-panel animate-fade-in-scale" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProv(null)}><X size={24} /></button>
            <header className="modal-icon-header-compact">
               <h2 className="modal-title-sm">Book {selectedProv.provider?.name}</h2>
               <p className="text-secondary-sm">{selectedCategory} Professional</p>
            </header>
            <form onSubmit={handleBookSubmit} className="booking-form-compact mt-md">
              <div className="booking-sections-compact">
                <div className="booking-control-group">
                  <label className="input-label-sm">When do you need?</label>
                  <div className="binary-toggle-row">
                    {['Today', 'Tomorrow'].map(d => (
                      <button
                        key={d}
                        type="button"
                        className={`toggle-btn-pill ${bookingDate === (d === 'Today' ? new Date().toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0]) ? 'active' : ''}`}
                        onClick={() => setBookingDate(d === 'Today' ? new Date().toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="booking-control-group mt-md">
                  <label className="input-label-sm">Preferred Time</label>
                  <div className="time-select-row">
                    <div className="hour-select-wrapper">
                      <select 
                        className="hour-dropdown-minimal" 
                        value={bookingHour}
                        onChange={e => setBookingHour(e.target.value)}
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                          <option key={h} value={h}>{h}:00</option>
                        ))}
                      </select>
                    </div>
                    <div className="period-toggle-row">
                      {['AM', 'PM'].map(p => (
                        <button
                          key={p}
                          type="button"
                          className={`toggle-btn-pill ${bookingPeriod === p ? 'active' : ''}`}
                          onClick={() => setBookingPeriod(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="input-group mt-md">
                <label className="input-label-sm">Anything else? (Optional)</label>
                <textarea 
                  className="input-field-sm" 
                  style={{ height: '60px', resize: 'none' }} 
                  placeholder="Instructions for the professional..." 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                />
              </div>
              <div className="modal-footer-compact mt-lg">
                <button type="submit" className="btn btn-primary w-full" disabled={bookingLoading}>
                  {bookingLoading ? 'Confirming...' : 'Book Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Providers;
