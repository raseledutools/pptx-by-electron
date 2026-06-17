import React, { useState, useRef } from 'react';
import './SlideEditor.css';

const SLIDE_RATIO = 9 / 16;

export default function SlideEditor({ slide, selectedElement, onSelectElement, onUpdateElement, onBgChange }) {
  const [dragging, setDragging] = useState(null);
  const [editing, setEditing] = useState(null);
  const canvasRef = useRef(null);

  if (!slide) {
    return (
      <div className="slide-editor empty">
        <div className="empty-message">
          <div className="empty-icon">📊</div>
          <div>Open a PPTX file or create a new presentation</div>
          <div className="empty-sub">Use the toolbar above to get started</div>
        </div>
      </div>
    );
  }

  const getCanvasRect = () => canvasRef.current?.getBoundingClientRect();

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };

  // Drag element
  const handleMouseDown = (e, el) => {
    e.stopPropagation();
    if (editing === el.id) return;
    onSelectElement(el);
    const rect = getCanvasRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startElX = el.x;
    const startElY = el.y;

    const onMove = (me) => {
      const dx = ((me.clientX - startX) / rect.width) * 100;
      const dy = ((me.clientY - startY) / rect.height) * 100;
      onUpdateElement({
        ...el,
        x: Math.max(0, Math.min(startElX + dx, 100 - el.w)),
        y: Math.max(0, Math.min(startElY + dy, 100 - el.h)),
      });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setDragging(null);
    };

    setDragging(el.id);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Double click to edit text
  const handleDoubleClick = (e, el) => {
    e.stopPropagation();
    setEditing(el.id);
    onSelectElement(el);
  };

  const handleTextChange = (el, newContent) => {
    onUpdateElement({ ...el, content: newContent });
  };

  const handleTextBlur = () => setEditing(null);

  return (
    <div className="slide-editor">
      <div className="canvas-wrapper">
        <div
          ref={canvasRef}
          className="slide-canvas"
          style={{ background: slide.background || '#ffffff' }}
          onClick={handleCanvasClick}
        >
          {slide.elements.map((el) => (
            <div
              key={el.id}
              className={`slide-element ${selectedElement?.id === el.id ? 'selected' : ''} ${dragging === el.id ? 'dragging' : ''}`}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.w}%`,
                minHeight: `${el.h}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, el)}
              onDoubleClick={(e) => handleDoubleClick(e, el)}
            >
              {el.type === 'text' && (
                editing === el.id ? (
                  <textarea
                    autoFocus
                    value={el.content}
                    onChange={(e) => handleTextChange(el, e.target.value)}
                    onBlur={handleTextBlur}
                    className="text-editor-input"
                    style={{
                      fontSize: `${el.fontSize * 0.85}px`,
                      fontWeight: el.bold ? 'bold' : 'normal',
                      fontStyle: el.italic ? 'italic' : 'normal',
                      color: el.color || '#000000',
                      textAlign: el.align || 'left',
                    }}
                  />
                ) : (
                  <div
                    className="text-display"
                    style={{
                      fontSize: `${el.fontSize * 0.85}px`,
                      fontWeight: el.bold ? 'bold' : 'normal',
                      fontStyle: el.italic ? 'italic' : 'normal',
                      color: el.color || '#000000',
                      textAlign: el.align || 'left',
                    }}
                  >
                    {el.content || 'Double-click to edit'}
                  </div>
                )
              )}
              {selectedElement?.id === el.id && !editing && (
                <div className="resize-hint">Drag to move • Double-click to edit</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
