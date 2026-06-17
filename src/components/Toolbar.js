import React from 'react';
import './Toolbar.css';

export default function Toolbar({
  onNew, onOpen, onSave, onSaveAs,
  onAddText, onDeleteElement, onAddSlide,
  hasSlides, hasSelection, isDirty, fileName,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-brand">
        <span className="brand-icon">📊</span>
        <span className="brand-name">PPTX Editor Lite</span>
      </div>

      <div className="toolbar-divider" />

      {/* File group */}
      <div className="toolbar-group">
        <button className="tb-btn" onClick={onNew} title="New Presentation (Ctrl+N)">
          <span>🆕</span><span className="tb-label">New</span>
        </button>
        <button className="tb-btn" onClick={onOpen} title="Open PPTX (Ctrl+O)">
          <span>📂</span><span className="tb-label">Open</span>
        </button>
        <button className="tb-btn" onClick={onSave} disabled={!hasSlides} title="Save (Ctrl+S)">
          <span>{isDirty ? '💾*' : '💾'}</span><span className="tb-label">Save</span>
        </button>
        <button className="tb-btn" onClick={onSaveAs} disabled={!hasSlides} title="Save As (Ctrl+Shift+S)">
          <span>📥</span><span className="tb-label">Save As</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Slide group */}
      <div className="toolbar-group">
        <button className="tb-btn" onClick={onAddSlide} disabled={!hasSlides} title="Add Slide">
          <span>➕</span><span className="tb-label">Add Slide</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Edit group */}
      <div className="toolbar-group">
        <button className="tb-btn" onClick={onAddText} disabled={!hasSlides} title="Add Text Box">
          <span>🔤</span><span className="tb-label">Text</span>
        </button>
        <button className="tb-btn danger" onClick={onDeleteElement} disabled={!hasSelection} title="Delete Selected">
          <span>🗑️</span><span className="tb-label">Delete</span>
        </button>
      </div>

      <div className="toolbar-spacer" />

      {fileName && (
        <div className="toolbar-filename">
          {isDirty && <span className="dirty-dot">●</span>}
          <span>{fileName}</span>
        </div>
      )}
    </div>
  );
}
