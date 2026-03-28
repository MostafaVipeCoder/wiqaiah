import React from 'react';
import './Webinars.css';

const WebinarCard = ({ topic, date, live, spots, price, iconColor }) => (
  <div className="webinar-card">
    <div className="webinar-header" style={{ backgroundImage: `linear-gradient(135deg, ${iconColor}22, ${iconColor}44)` }}>
      <div className="webinar-badges">
        {live && <span className="live-badge">LIVE BY DR. MUHAMMAD</span>}
        {spots && <span className="spots-badge">{spots} spots left</span>}
      </div>
      <div className="webinar-price">${price}</div>
    </div>
    <div className="webinar-content">
      <h3 className="webinar-topic">{topic}</h3>
      <div className="webinar-meta">
        <span className="meta-item">🗓 {date}</span>
        <span className="meta-item">🕒 60 min · Zoom</span>
      </div>
      <button className="book-btn">Book Webinar Session</button>
    </div>
  </div>
);

const Webinars = () => {
  const webinars = [
    {
      topic: "Children's Oral Health: Diet, Decay & Prevention",
      date: "Thu, Apr 3 · 6:00 PM",
      live: true,
      spots: 12,
      price: 9,
      iconColor: "#FF63B0"
    },
    {
      topic: "Understanding Gum Disease: Causes & Real Care",
      date: "Mon, Apr 7 · 5:30 PM",
      live: true,
      spots: 8,
      price: 9,
      iconColor: "#4D70FB"
    },
    {
      topic: "Oral Hygiene Masterclass: Simple Tools & Real Results",
      date: "Sat, Apr 12 · 11:00 AM",
      live: true,
      price: 9,
      iconColor: "#FFB84C"
    }
  ];

  return (
    <section id="sessions" className="webinars-section section-padding">
      <div className="container">
        <div className="webinars-top">
          <div className="webinars-info">
            <div className="section-label">LIVE ONLINE WEBINARS</div>
            <h2 className="section-title">Group sessions on <em>topics that matter</em></h2>
            <p>Same expert. Broader topic. A fraction of the price.</p>
          </div>
          <a href="#" className="view-all">View all sessions →</a>
        </div>
        <div className="webinar-grid">
          {webinars.map((w, i) => (
            <WebinarCard key={i} {...w} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Webinars;
