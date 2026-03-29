import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <div className="spinner-glow"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
