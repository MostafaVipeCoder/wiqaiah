import React from 'react';
import './PainPoints.css';

const PainPoints = () => {
  const points = [
    "You don't need to drive to a clinic just to ask a simple question.",
    "You don't need to search for parking just to ask a question.",
    "You don't need to wait for hours in a room that smells like sanitizer."
  ];

  return (
    <section className="pain-section">
      <div className="container">
        <div className="pain-label">SOUND FAMILIAR?</div>
        <h2 className="pain-title">
          The old way of dental care is <em>outdated</em>.
        </h2>
        <div className="pain-list">
          {points.map((point, i) => (
            <div key={i} className="pain-item">
              <span className="strike">✕</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
        <p className="pain-punchline">
          You deserve a straight answer.<br />
          <em>From a real dentist. Right now.</em>
        </p>
      </div>
    </section>
  );
};

export default PainPoints;
