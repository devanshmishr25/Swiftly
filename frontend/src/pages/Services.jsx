import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Filter, Wrench, Zap, Trash2, Truck, BookOpen, Hammer, Scissors, PaintBucket, Thermometer, Box, X, ArrowRight, Users } from 'lucide-react';
import axios from 'axios';
import './Services.css';

const CATEGORIES = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Delivery', 'Tutoring', 'Handyman', 'Beauty', 'Home Repair'];

const iconMap = {
  Wrench: Wrench,
  Zap: Zap,
  Trash2: Trash2,
  Truck: Truck,
  BookOpen: BookOpen,
  Hammer: Hammer,
  Scissors: Scissors,
  PaintBucket: PaintBucket,
  Thermometer: Thermometer,
  Box: Box,
  Filter: Filter
};

const DEFAULT_SERVICES = [
  { _id: 's1', title: 'Expert Plumbing & Pipe Repair', category: 'Plumbing', location: 'Downtown', provider: { name: 'John Plumbs' }, icon: 'Wrench', description: 'Complete plumbing solutions including leak repairs, pipe fitting, and water heater maintenance.' },
  { _id: 's2', title: 'Lightman / Electrician', category: 'Electrical', location: 'City Center', provider: { name: 'Volt Masters' }, icon: 'Zap', description: 'Professional electrical wiring, fixture installation, and urgent short-circuit fixes for your home.' },
  { _id: 's3', title: 'Deep House Cleaning', category: 'Cleaning', location: 'West End', provider: { name: 'Sparkle Co.' }, icon: 'Trash2', description: 'Intensive deep cleaning of all rooms, carpet vacuuming, and specialized bathroom sanitation.' },
  { _id: 's4', title: 'Same Day Packages Courier', category: 'Delivery', location: 'All Boroughs', provider: { name: 'FastDash' }, icon: 'Truck', description: 'Fast, reliable and tracked delivery of your daily packages across the entire city.' },
  { _id: 's5', title: 'Math & Science Tutoring', category: 'Tutoring', location: 'North District', provider: { name: 'Smart Prep' }, icon: 'BookOpen', description: '1-on-1 tutoring sessions for high school students focusing on advanced mathematics and physics.' },
  { _id: 's6', title: 'General Handyman Fixes', category: 'Handyman', location: 'East Side', provider: { name: 'FixIt All' }, icon: 'Hammer', description: 'Mounting TVs, assembling IKEA furniture, and fixing squeaky doors around your property.' },
  { _id: 's7', title: 'At-Home Haircut & Grooming', category: 'Beauty', location: 'Mobile Service', provider: { name: 'Style On Wheels' }, icon: 'Scissors', description: 'Professional haircut, beard trim, and grooming services provided right in your living room.' },
  { _id: 's8', title: 'Interior & Exterior Painting', category: 'Home Repair', location: 'South End', provider: { name: 'Pro Painters' }, icon: 'PaintBucket', description: 'High-quality repainting of your home interior walls and exterior facades using premium durable paint.' },
  { _id: 's9', title: 'AC & Heating Repair', category: 'Home Repair', location: 'Downtown', provider: { name: 'Cool Breeze' }, icon: 'Thermometer', description: 'Emergency HVAC repairs, filter replacements, and regular seasonal maintenance.' },
  { _id: 's10', title: 'Movers & Packing Helpers', category: 'Delivery', location: 'City Wide', provider: { name: 'Muscle Move' }, icon: 'Box', description: 'Heavy lifting assistance and professional packing of your fragile belongings for moving day.' }
];

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);


  const fetchServices = async () => {
    setLoading(true);
    try {
      // Typically we fetch from DB here:
      // const res = await axios.get(`http://localhost:5000/api/services?category=${selectedCategory}`);
      
      // But since DB is mostly empty, we will locally filter our extremely rich daily-life service catalog!
      let filtered = DEFAULT_SERVICES;
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(s => s.category === selectedCategory);
      }
      if (search) {
        filtered = filtered.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()));
      }
      
      setServices(filtered);
    } catch (error) {
      console.error("Error fetching services", error);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServices();
  };

  return (
    <div className="services-page container">
      <div className="services-header animate-fade-in-up">
        <h1>Find Your <span className="text-gradient">Service</span></h1>
        <p className="text-secondary">Explore top-rated professionals for your daily life needs.</p>
      </div>

      <div className="search-section animate-fade-in-up delay-100">
        <form onSubmit={handleSearchSubmit} className="search-bar glass-panel">
          <Search className="search-icon" size={24} />
          <input 
            type="text" 
            placeholder="Search for plumber, electrician, cleaning..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="categories-pills">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="services-grid animate-fade-in-scale delay-200">
        {loading ? (
          <div className="loading-state">Loading amazing services...</div>
        ) : services.length > 0 ? (
          services.map(service => (
            <div 
              key={service._id} 
              className="service-card glass-panel"
              onClick={() => setSelectedServiceModal(service)}
            >
              <div className="service-header mb-md">
                <div className="card-icon-wrapper" style={{ marginBottom: 0 }}>
                  {React.createElement(iconMap[service.icon] || Filter, { size: 24 })}
                </div>
                <span className="category-badge">{service.category}</span>
              </div>
              <h3 style={{marginBottom: '1rem', flex: 1}}>{service.title}</h3>
              
              <div className="service-footer">
                <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); setSelectedServiceModal(service);}}>
                  View All Providers
                </button>
              </div>
            </div>
          ))
        ) : (
           <div className="empty-state glass-panel">
              <Filter size={48} className="text-muted mb-md" />
              <h3>No services found</h3>
              <p className="text-secondary">Try adjusting your search or category filter.</p>
           </div>
        )}
      </div>

      {/* Service Detail Modal */}
      {selectedServiceModal && (
        <div className="service-modal-overlay animate-fade-in" onClick={() => setSelectedServiceModal(null)}>
          <div className="service-modal glass-panel animate-fade-in-scale" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedServiceModal(null)}><X size={24} /></button>

            <header className="modal-icon-header">
              <div className="modal-icon-wrapper" style={{ marginBottom: '1.5rem' }}>
                {React.createElement(iconMap[selectedServiceModal.icon] || Filter, { size: 48, className: "text-accent" })}
              </div>
              <h2 className="modal-title">{selectedServiceModal.title}</h2>
              <div className="category-badge mb-md">
                {selectedServiceModal.category}
              </div>
              <div className="nav-divider" style={{ margin: '1.5rem 0' }}></div>
            </header>

            <div className="modal-body text-center">
              <p className="modal-desc text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                {selectedServiceModal.description}
              </p>

              {/* CTA - Condensed */}
              <div className="modal-footer-compact mt-lg">
                 <button
                  className="btn btn-primary w-full"
                  style={{ gap: '10px' }}
                  onClick={() => {
                    setSelectedServiceModal(null);
                    navigate(`/providers?category=${encodeURIComponent(selectedServiceModal.category)}`);
                  }}
                >
                  <Users size={18} /> Find Experts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
