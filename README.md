# CodeView 🎨

Turn your code snippets into beautiful, presentation-ready slides in seconds.

CodeView is a powerful web application that allows developers and educators to create stunning mockups of their code. Whether you need a high-resolution PNG for Twitter/X or a fully editable Microsoft PowerPoint (.pptx) file for your next tech talk, CodeView has you covered.

## Features ✨

- **Live Code Preview**: See exactly what your slide will look like as you type.
- **Multiple Themes**: Choose from a curated selection of beautiful syntax highlighting themes (e.g., Stage Dark, Ocean Light, Monokai, Night Owl).
- **Responsive & Mobile Friendly**: Fully responsive interface that works perfectly on desktop and mobile devices.
- **Advanced Exporting**:
  - **Export to PNG**: High-resolution image capture (1920x1080) perfect for social media.
  - **Export to PPTX**: Generates a **native, editable PowerPoint presentation** where text and shapes remain fully customizable.
- **Customization Options**:
  - Toggle slide framing (Window vs Slide layout).
  - Adjust zoom scale and visible lines fit.
  - Add custom titles and captions.
  - Highlight specific lines of code to draw focus.
  - Toggle line numbers.

## Tech Stack 🛠️

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Syntax Highlighting**: [highlight.js](https://highlightjs.org/)
- **Exporting Libraries**: 
  - `html-to-image` (for PNG generation)
  - `pptxgenjs` (for PowerPoint generation)
- **Build Tool**: Vite

## Project Architecture 📁

The project is highly modular and organized:

- `src/App.tsx`: Top-level coordinator managing state and layout.
- `src/components/SidebarControls.tsx`: Configuration panel (inputs, themes, sliders).
- `src/components/SlidePreview.tsx`: Slide rendering sandbox and syntax highlighting.
- `src/lib/slideExporter.ts`: Export engine for handling PNG and PPTX file generation.
- `src/lib/themes.ts`: Theme configurations and color palettes.

## Getting Started 🚀

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/CodeView.git
   cd CodeView
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` to start creating slides!

## License 📄

This project is licensed under the MIT License.
