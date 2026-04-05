import { Shield, Zap, TrendingUp, Users } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page container animate-fade-in">
      <header className="about-header text-center">
        <h1 className="text-primary">About Swiftly</h1>
        <p className="text-secondary subtitle" style={{ fontSize: '1.25rem' }}>
          Bridging the gap between daily needs and reliable local talent.
        </p>
      </header>

      <section className="about-section glass-panel">
        <h2>What Services We Provide</h2>
        <p className="text-secondary mb-md" style={{ lineHeight: '1.6' }}>
          Swiftly is a decentralized service marketplace tailored to solve your daily hurdles. Whether you need a quick fix around the house, reliable tutoring, or instant delivery, we provide an ecosystem that hosts a variety of professional services:
        </p>
        <div className="services-grid-mini">
          <div className="service-item">
            <Zap size={32} className="text-accent" />
            <h4>Instant Fixes</h4>
            <p>Plumbing, electrical work, and local mechanics available on demand.</p>
          </div>
          <div className="service-item">
            <Users size={32} className="text-accent" />
            <h4>Personal Assistants</h4>
            <p>House cleaning, grocery shopping errands, and personalized tutoring.</p>
          </div>
          <div className="service-item">
            <Shield size={32} className="text-accent" />
            <h4>Trusted Professionals</h4>
            <p>Every provider is vetted, ensuring safety and top-tier service quality.</p>
          </div>
        </div>
      </section>

      <section className="about-section glass-panel mt-xl">
        <h2>How Swiftly Benefits Your Future</h2>
        <p className="text-secondary mb-md" style={{ lineHeight: '1.6' }}>
          We aren't just connecting people today; we are building the foundation of tomorrow's gig economy. Here is how Swiftly scales into the future:
        </p>
        <div className="benefits-list">
          <div className="benefit-item flex gap-md">
            <TrendingUp size={36} className="text-accent flex-shrink-0" />
            <div>
              <h4>Economic Empowerment</h4>
              <p className="text-secondary" style={{ lineHeight: '1.6' }}>By allowing local professionals to easily build their digital storefronts, we are creating sustainable income streams for millions, bypassing traditional slow-moving agencies.</p>
            </div>
          </div>
          <div className="benefit-item flex gap-md mt-md">
             <Zap size={36} className="text-accent flex-shrink-0" />
             <div>
               <h4>Time Recovery</h4>
               <p className="text-secondary" style={{ lineHeight: '1.6' }}>In the future, automated matching algorithms will instantly dispatch the closest professional to your door before you even finish worrying about the problem. We give you your time back.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
