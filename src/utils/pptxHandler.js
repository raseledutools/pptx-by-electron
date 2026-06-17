import JSZip from 'jszip';
import PptxGenJS from 'pptxgenjs';

/**
 * Parse a base64-encoded PPTX file into our internal slide format.
 * Extracts text elements, slide backgrounds, and basic layout info.
 */
export async function parsePptx(base64Data) {
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const zip = await JSZip.loadAsync(bytes.buffer);
  const slides = [];

  // Find all slide XML files
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0]);
      const nb = parseInt(b.match(/\d+/)[0]);
      return na - nb;
    });

  for (let idx = 0; idx < slideFiles.length; idx++) {
    const slideFile = slideFiles[idx];
    const xmlStr = await zip.file(slideFile).async('string');

    const slide = {
      id: idx + 1,
      title: `Slide ${idx + 1}`,
      elements: [],
      background: '#ffffff',
      rawXml: xmlStr,
    };

    // Extract background color
    const bgMatch = xmlStr.match(/<a:srgbClr val="([0-9A-Fa-f]{6})"/);
    if (bgMatch) slide.background = '#' + bgMatch[1];

    // Extract text shapes
    const spMatches = [...xmlStr.matchAll(/<p:sp>([\s\S]*?)<\/p:sp>/g)];
    let elId = 1;

    for (const spMatch of spMatches) {
      const spXml = spMatch[1];

      // Get position/size (in EMUs, convert to %)
      const offMatch = spXml.match(/<a:off x="(\d+)" y="(\d+)"/);
      const extMatch = spXml.match(/<a:ext cx="(\d+)" cy="(\d+)"/);

      const EMU_PER_INCH = 914400;
      const SLIDE_W_EMU = 9144000; // standard 10 inch
      const SLIDE_H_EMU = 6858000; // standard 7.5 inch

      const x = offMatch ? (parseInt(offMatch[1]) / SLIDE_W_EMU) * 100 : 5;
      const y = offMatch ? (parseInt(offMatch[2]) / SLIDE_H_EMU) * 100 : 5;
      const w = extMatch ? (parseInt(extMatch[1]) / SLIDE_W_EMU) * 100 : 40;
      const h = extMatch ? (parseInt(extMatch[2]) / SLIDE_H_EMU) * 100 : 15;

      // Extract text runs
      const texts = [];
      const rMatches = [...spXml.matchAll(/<a:r>([\s\S]*?)<\/a:r>/g)];
      let fontSize = 24, bold = false, italic = false, color = '#000000';

      for (const rMatch of rMatches) {
        const rXml = rMatch[1];
        const tMatch = rXml.match(/<a:t>([\s\S]*?)<\/a:t>/);
        if (tMatch) {
          texts.push(tMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));
        }
        const szMatch = rXml.match(/sz="(\d+)"/);
        if (szMatch) fontSize = parseInt(szMatch[1]) / 100;
        if (rXml.includes('<a:b/>') || rXml.includes('b="1"')) bold = true;
        if (rXml.includes('<a:i/>') || rXml.includes('i="1"')) italic = true;
        const clrMatch = rXml.match(/<a:srgbClr val="([0-9A-Fa-f]{6})"/);
        if (clrMatch) color = '#' + clrMatch[1];
      }

      if (texts.length > 0) {
        const content = texts.join('');
        const el = {
          id: Date.now() + elId++,
          type: 'text',
          content,
          x: Math.max(0, Math.min(x, 90)),
          y: Math.max(0, Math.min(y, 90)),
          w: Math.max(10, Math.min(w, 95)),
          h: Math.max(5, Math.min(h, 50)),
          fontSize: Math.max(8, Math.min(fontSize, 96)),
          bold,
          italic,
          color,
          align: 'left',
        };

        // Check if it's the title
        if (spXml.includes('<p:ph type="title"') || spXml.includes('<p:ph type="ctrTitle"')) {
          slide.title = content;
          el.isTitle = true;
        }

        slide.elements.push(el);
      }
    }

    slides.push(slide);
  }

  return slides.length > 0 ? slides : [{ id: 1, title: 'Slide 1', elements: [], background: '#ffffff' }];
}

/**
 * Build a PPTX file from our internal slide format.
 * Returns base64-encoded PPTX data.
 */
export async function buildPptx(slides) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  for (const slideData of slides) {
    const slide = pptx.addSlide();

    // Set background
    if (slideData.background && slideData.background !== '#ffffff') {
      slide.background = { fill: slideData.background.replace('#', '') };
    }

    // Add elements
    for (const el of slideData.elements) {
      if (el.type === 'text') {
        slide.addText(el.content || '', {
          x: (el.x / 100) * 10,
          y: (el.y / 100) * 7.5,
          w: (el.w / 100) * 10,
          h: (el.h / 100) * 7.5,
          fontSize: el.fontSize || 24,
          bold: el.bold || false,
          italic: el.italic || false,
          color: (el.color || '#000000').replace('#', ''),
          align: el.align || 'left',
          fontFace: el.fontFace || 'Calibri',
          wrap: true,
        });
      }
    }
  }

  const base64 = await pptx.write({ outputType: 'base64' });
  return base64;
}
