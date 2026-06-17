import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import SlidePanel from './components/SlidePanel';
import SlideEditor from './components/SlideEditor';
import PropertiesPanel from './components/PropertiesPanel';
import StatusBar from './components/StatusBar';
import { parsePptx, buildPptx } from './utils/pptxHandler';
import './App.css';

function App() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState('Ready — Open a PPTX file or create a new presentation');

  const isElectron = !!window.electronAPI;

  // Handle open
  const handleOpen = useCallback(async () => {
    try {
      if (isElectron) {
        const result = await window.electronAPI.openFile();
        if (!result) return;
        setStatus('Parsing PPTX...');
        const parsed = await parsePptx(result.data);
        setSlides(parsed);
        setCurrentSlide(0);
        setFileName(result.name);
        setFilePath(result.path);
        setIsDirty(false);
        setSelectedElement(null);
        setStatus(`Opened: ${result.name} — ${parsed.length} slide(s)`);
      } else {
        // Browser fallback
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pptx';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (ev) => {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(ev.target.result)));
            const parsed = await parsePptx(base64);
            setSlides(parsed);
            setCurrentSlide(0);
            setFileName(file.name);
            setFilePath(null);
            setIsDirty(false);
            setSelectedElement(null);
            setStatus(`Opened: ${file.name} — ${parsed.length} slide(s)`);
          };
          reader.readAsArrayBuffer(file);
        };
        input.click();
      }
    } catch (err) {
      setStatus('Error opening file: ' + err.message);
    }
  }, [isElectron]);

  // Handle save
  const handleSave = useCallback(async (saveAs = false) => {
    if (slides.length === 0) return;
    try {
      setStatus('Building PPTX...');
      const base64 = await buildPptx(slides);

      if (isElectron) {
        let savePath = filePath;
        if (!savePath || saveAs) {
          savePath = await window.electronAPI.saveFileDialog({
            defaultName: fileName || 'presentation.pptx',
          });
          if (!savePath) { setStatus('Save cancelled'); return; }
        }
        await window.electronAPI.writeFile({ filePath: savePath, data: base64 });
        setFilePath(savePath);
        setFileName(savePath.split(/[\\/]/).pop());
        setIsDirty(false);
        setStatus(`Saved: ${savePath.split(/[\\/]/).pop()}`);
      } else {
        // Browser fallback
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'presentation.pptx';
        a.click();
        URL.revokeObjectURL(url);
        setIsDirty(false);
        setStatus('Downloaded: ' + (fileName || 'presentation.pptx'));
      }
    } catch (err) {
      setStatus('Error saving: ' + err.message);
    }
  }, [slides, filePath, fileName, isElectron]);

  // New presentation
  const handleNew = useCallback(() => {
    const blank = [{ id: 1, title: 'New Slide', elements: [], background: '#ffffff' }];
    setSlides(blank);
    setCurrentSlide(0);
    setFileName('Untitled.pptx');
    setFilePath(null);
    setIsDirty(false);
    setSelectedElement(null);
    setStatus('New presentation created');
  }, []);

  // Add slide
  const handleAddSlide = useCallback(() => {
    const newSlide = {
      id: Date.now(),
      title: `Slide ${slides.length + 1}`,
      elements: [],
      background: '#ffffff',
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlide(slides.length);
    setIsDirty(true);
    setStatus(`Added slide ${slides.length + 1}`);
  }, [slides.length]);

  // Delete slide
  const handleDeleteSlide = useCallback((index) => {
    if (slides.length <= 1) { setStatus('Cannot delete the last slide'); return; }
    setSlides(prev => prev.filter((_, i) => i !== index));
    setCurrentSlide(prev => Math.min(prev, slides.length - 2));
    setIsDirty(true);
    setStatus('Slide deleted');
  }, [slides.length]);

  // Update element on current slide
  const handleUpdateElement = useCallback((updatedEl) => {
    setSlides(prev => prev.map((slide, i) => {
      if (i !== currentSlide) return slide;
      return {
        ...slide,
        elements: slide.elements.map(el => el.id === updatedEl.id ? updatedEl : el),
      };
    }));
    setSelectedElement(updatedEl);
    setIsDirty(true);
  }, [currentSlide]);

  // Add text element
  const handleAddText = useCallback(() => {
    const el = {
      id: Date.now(),
      type: 'text',
      content: 'Click to edit text',
      x: 10, y: 10, w: 80, h: 15,
      fontSize: 24, bold: false, italic: false,
      color: '#000000', align: 'left',
    };
    setSlides(prev => prev.map((slide, i) =>
      i === currentSlide ? { ...slide, elements: [...slide.elements, el] } : slide
    ));
    setSelectedElement(el);
    setIsDirty(true);
    setStatus('Text box added');
  }, [currentSlide]);

  // Update slide background
  const handleBgChange = useCallback((color) => {
    setSlides(prev => prev.map((slide, i) =>
      i === currentSlide ? { ...slide, background: color } : slide
    ));
    setIsDirty(true);
  }, [currentSlide]);

  // Delete selected element
  const handleDeleteElement = useCallback(() => {
    if (!selectedElement) return;
    setSlides(prev => prev.map((slide, i) =>
      i === currentSlide
        ? { ...slide, elements: slide.elements.filter(el => el.id !== selectedElement.id) }
        : slide
    ));
    setSelectedElement(null);
    setIsDirty(true);
    setStatus('Element deleted');
  }, [selectedElement, currentSlide]);

  // Electron menu listeners
  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI.onMenuOpen(() => handleOpen());
    window.electronAPI.onMenuSave(() => handleSave(false));
    window.electronAPI.onMenuSaveAs(() => handleSave(true));
  }, [handleOpen, handleSave, isElectron]);

  const currentSlideData = slides[currentSlide] || null;

  return (
    <div className="app">
      <Toolbar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={() => handleSave(false)}
        onSaveAs={() => handleSave(true)}
        onAddText={handleAddText}
        onDeleteElement={handleDeleteElement}
        onAddSlide={handleAddSlide}
        hasSlides={slides.length > 0}
        hasSelection={!!selectedElement}
        isDirty={isDirty}
        fileName={fileName}
      />
      <div className="workspace">
        <SlidePanel
          slides={slides}
          currentSlide={currentSlide}
          onSelect={setCurrentSlide}
          onDelete={handleDeleteSlide}
          onAdd={handleAddSlide}
        />
        <SlideEditor
          slide={currentSlideData}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          onUpdateElement={handleUpdateElement}
          onBgChange={handleBgChange}
        />
        <PropertiesPanel
          element={selectedElement}
          slide={currentSlideData}
          onUpdateElement={handleUpdateElement}
          onBgChange={handleBgChange}
        />
      </div>
      <StatusBar status={status} slideCount={slides.length} currentSlide={currentSlide} />
    </div>
  );
}

export default App;
