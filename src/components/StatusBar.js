import React from 'react';
import './StatusBar.css';

export default function StatusBar({ status, slideCount, currentSlide }) {
  return (
    <div className="status-bar">
      <span className="status-message">{status}</span>
      {slideCount > 0 && (
        <span className="status-slides">
          Slide {currentSlide + 1} / {slideCount}
        </span>
      )}
    </div>
  );
}
