import React from 'react';
import './HowItWorks.css';

const Step = ({ number, title, text }) => (
  <div className="step-card">
    <div className="step-num">{number}</div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

const HowItWorks = () => {
  const steps = [
    { number: '01', title: 'Book your slot', text: 'Choose a time that works for you. Takes 60 seconds on this page.' },
    { number: '02', title: 'Join the video call', text: 'Your 20-minute session with Dr. Muhammad. Ask anything, get real clarity.' },
    { number: '03', title: 'Get your risk report', text: 'Receive a personalized caries risk assessment after your session.' },
    { number: '04', title: 'Join the community', text: 'Exclusive access to a members-only group with dental tips, Q&As, and content.' }
  ];

  return (
    <section id="how" className="how-section section-padding">
      <div className="container">
        <div className="section-label">THE PROCESS</div>
        <h2 className="section-title">
          Three steps to <em>peace of mind</em>
        </h2>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <Step key={i} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
