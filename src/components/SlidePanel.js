import React from 'react';
import './SlidePanel.css';

export default function SlidePanel({ slides, currentSlide, onSelect, onDelete, onAdd }) {
  return (
    <div className="slide-panel">
      <div className="slide-panel-header">
        <span>Slides ({slides.length})</span>
        <button className="add-slide-btn" onClick={onAdd} title="Add Slide">+</button>
      </div>
      <div className="slide-list">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide-thumb ${index === currentSlide ? 'active' : ''}`}
            onClick={() => onSelect(index)}
          >
            <div className="slide-thumb-number">{index + 1}</div>
            <div
              className="slide-thumb-preview"
              style={{ background: slide.background || '#fff' }}
            >
              {slide.elements.filter(el => el.type === 'text').slice(0, 3).map((el, i) => (
                <div
                  key={el.id}
                  className="thumb-text"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.w}%`,
                    fontSize: `${Math.max(4, el.fontSize * 0.18)}px`,
                    fontWeight: el.bold ? 'bold' : 'normal',
                    color: el.color || '#000',
                  }}
                >
                  {el.content}
                </div>
              ))}
              {slide.elements.length === 0 && (
                <div className="thumb-empty">Empty</div>
              )}
            </div>
            <div className="slide-thumb-title">{slide.title || `Slide ${index + 1}`}</div>
            {slides.length > 1 && (
              <button
                className="slide-delete-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                title="Delete this slide"
              >×</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
