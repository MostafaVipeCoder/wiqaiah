import React from 'react';
import './FAQ.css';

const FAQ = () => {
  const questions = [
    "Am I brushing my teeth the right way?",
    "Why do my teeth keep staining?",
    "How can I take care of my baby's teeth?",
    "What's the difference between a bridge and an implant?",
    "My child sucks their thumb — is this harmful?",
    "Is my child's diet making their teeth decay?",
    "Why is my gum bleeding when I brush?",
    "I missed my medication time — what should I do?"
  ];

  return (
    <section id="questions" className="faq-section section-padding">
      <div className="container">
        <div className="section-label">WHAT PEOPLE ASK</div>
        <h2 className="section-title">
          No question is too <em>small</em>
        </h2>
        <div className="q-grid">
          {questions.map((q, i) => (
            <div key={i} className="q-card">
              <div className="q-icon">?</div>
              <p>{q}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
