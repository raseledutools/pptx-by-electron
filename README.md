# 📊 PPTX Editor Lite

> Lightweight, open-source PowerPoint (.pptx) editor built with Electron + React.
> Windows EXE builds automatically via GitHub Actions.

![GitHub Actions](https://github.com/YOUR_USERNAME/pptx-editor-lite/actions/workflows/build.yml/badge.svg)

---

## ✨ Features

- 📂 **Open PPTX** — Import any `.pptx` file
- 👁️ **View Slides** — Slide panel with visual thumbnails
- ✏️ **Edit Text** — Double-click any text to edit inline
- 🎨 **Style Text** — Font size, color, bold, italic, alignment
- 📐 **Move Elements** — Drag and drop text boxes
- 🖼️ **Background Color** — Change per-slide background
- ➕ **Add/Delete Slides** — Full slide management
- 💾 **Save PPTX** — Export back to `.pptx` format
- 🪟 **Windows EXE** — Installable + portable build

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm 9+

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/pptx-editor-lite.git
cd pptx-editor-lite

# 2. Install
npm install

# 3. Run in browser (test)
npm start

# 4. Run as Electron app
npm run electron-dev
```

---

## 🏗️ Build Windows EXE Locally

```bash
# Build React first, then package
npm run package
```

Output: `dist/PPTX Editor Lite Setup 1.0.0.exe` (installer)  
Output: `dist/PPTX Editor Lite 1.0.0.exe` (portable)

---

## 🤖 Auto Build via GitHub Actions

Push to `main` → GitHub Actions automatically builds the EXE.

1. Fork this repo
2. Go to **Actions** tab → enable workflows
3. Push any change to `main`
4. Download EXE from **Actions → Artifacts**

### Release EXE:
```bash
git tag v1.0.0
git push origin v1.0.0
```
→ Auto-creates GitHub Release with `.exe` attached.

---

## 📁 Project Structure

```
pptx-editor-lite/
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Secure IPC bridge
├── src/
│   ├── components/
│   │   ├── Toolbar.js   # Top toolbar
│   │   ├── SlidePanel.js # Left slide list
│   │   ├── SlideEditor.js # Main canvas
│   │   ├── PropertiesPanel.js # Right properties
│   │   └── StatusBar.js # Bottom status
│   ├── utils/
│   │   └── pptxHandler.js # Parse & build PPTX
│   ├── App.js
│   └── index.js
├── public/
│   └── index.html
├── .github/
│   └── workflows/
│       └── build.yml    # Auto Windows EXE build
└── package.json
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Electron 28 | Desktop wrapper |
| React 18 | UI framework |
| PptxGenJS | PPTX generation |
| JSZip | PPTX parsing (ZIP) |
| electron-builder | EXE packaging |

---

## 📜 License

MIT — free to fork, modify, and distribute.
