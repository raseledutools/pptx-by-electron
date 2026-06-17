import React from 'react';
import './PropertiesPanel.css';

export default function PropertiesPanel({ element, slide, onUpdateElement, onBgChange }) {
  const update = (key, value) => {
    if (!element) return;
    onUpdateElement({ ...element, [key]: value });
  };

  return (
    <div className="properties-panel">
      <div className="props-header">Properties</div>

      {/* Slide background */}
      {slide && (
        <div className="props-section">
          <div className="props-label">Slide Background</div>
          <div className="props-row">
            <input
              type="color"
              value={slide.background || '#ffffff'}
              onChange={(e) => onBgChange(e.target.value)}
              title="Background Color"
            />
            <span className="props-value">{slide.background || '#ffffff'}</span>
          </div>
        </div>
      )}

      <div className="props-divider" />

      {!element ? (
        <div className="props-empty">
          <div>Select an element</div>
          <div className="props-empty-sub">to edit its properties</div>
        </div>
      ) : (
        <>
          <div className="props-section">
            <div className="props-label">Text Content</div>
            <textarea
              className="props-textarea"
              value={element.content || ''}
              onChange={(e) => update('content', e.target.value)}
              rows={4}
            />
          </div>

          <div className="props-section">
            <div className="props-label">Font Size</div>
            <div className="props-row">
              <input
                type="range" min="8" max="96" step="1"
                value={element.fontSize || 24}
                onChange={(e) => update('fontSize', parseInt(e.target.value))}
              />
              <span className="props-value">{element.fontSize || 24}pt</span>
            </div>
          </div>

          <div className="props-section">
            <div className="props-label">Text Color</div>
            <div className="props-row">
              <input
                type="color"
                value={element.color || '#000000'}
                onChange={(e) => update('color', e.target.value)}
              />
              <span className="props-value">{element.color || '#000000'}</span>
            </div>
          </div>

          <div className="props-section">
            <div className="props-label">Style</div>
            <div className="props-row">
              <button
                className={`style-btn ${element.bold ? 'active' : ''}`}
                onClick={() => update('bold', !element.bold)}
                title="Bold"
              ><b>B</b></button>
              <button
                className={`style-btn ${element.italic ? 'active' : ''}`}
                onClick={() => update('italic', !element.italic)}
                title="Italic"
              ><i>I</i></button>
            </div>
          </div>

          <div className="props-section">
            <div className="props-label">Alignment</div>
            <div className="props-row">
              {['left', 'center', 'right'].map(a => (
                <button
                  key={a}
                  className={`style-btn ${element.align === a ? 'active' : ''}`}
                  onClick={() => update('align', a)}
                  title={a}
                >
                  {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                </button>
              ))}
            </div>
          </div>

          <div className="props-section">
            <div className="props-label">Position & Size</div>
            <div className="props-grid">
              <div>
                <div className="props-sublabel">X (%)</div>
                <input type="number" min="0" max="90" value={Math.round(element.x)}
                  onChange={(e) => update('x', parseFloat(e.target.value))} />
              </div>
              <div>
                <div className="props-sublabel">Y (%)</div>
                <input type="number" min="0" max="90" value={Math.round(element.y)}
                  onChange={(e) => update('y', parseFloat(e.target.value))} />
              </div>
              <div>
                <div className="props-sublabel">W (%)</div>
                <input type="number" min="5" max="100" value={Math.round(element.w)}
                  onChange={(e) => update('w', parseFloat(e.target.value))} />
              </div>
              <div>
                <div className="props-sublabel">H (%)</div>
                <input type="number" min="5" max="100" value={Math.round(element.h)}
                  onChange={(e) => update('h', parseFloat(e.target.value))} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
