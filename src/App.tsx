/**
 * @file App.tsx
 * @description Main dashboard coordinator and shell structure.
 * Manages the top-level application states (code, styling, theme, framing, lines fit, zoom).
 * Handles dynamic rendering container scale calculations, mobile responsiveness overlays,
 * and ties controls to PNG and PPTX download flows.
 */

import { useState, useEffect, useRef, useMemo } from "react"
import { SlidePreview } from "./components/SlidePreview"
import { SidebarControls } from "./components/SidebarControls"
import { SLIDE_THEMES, type SlideTheme } from "./lib/themes"
import { Sparkles, Layout, Sliders, X, RotateCw } from "lucide-react"
import { cn } from "./lib/utils"
import { exportPng, exportPptx } from "./lib/slideExporter"

const DEFAULT_CODE = `import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return { user, loading };
}`;



export default function App() {
  // State
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("__auto__");
  const [themeId, setThemeId] = useState("stage-dark");
  const [framing, setFraming] = useState<"slide" | "window">("window");
  const [visibleLines, setVisibleLines] = useState(16);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [highlightedLines, setHighlightedLines] = useState("4-15");
  const [title, setTitle] = useState("Custom React Hook");
  const [caption, setCaption] = useState("hooks/useAuth.ts");
  const [fontFamily, setFontFamily] = useState("'JetBrains Mono', monospace");

  // Export Loading States
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Layout scale observer
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  // Get active theme
  const activeTheme = SLIDE_THEMES.find((t) => t.id === themeId) || SLIDE_THEMES[0];

  // Compute recommended visible lines based on actual code line count
  const recommendedLines = useMemo(() => {
    const lineCount = code.split("\n").length;
    const base = showDetails ? lineCount + 1 : lineCount + 3;
    return Math.max(5, Math.min(45, base));
  }, [code, showDetails]);

  // Auto-adjust visible lines when code changes or details are toggled
  useEffect(() => {
    setVisibleLines(recommendedLines);
  }, [recommendedLines]);

  // Dynamic Scale Calculator
  useEffect(() => {
    if (!previewContainerRef.current) return;

    const calculateScale = () => {
      const container = previewContainerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Fit 1920x1080 slide inside container with responsive padding
      const isMobile = window.innerWidth < 1024;
      const padding = isMobile ? 16 : 48;
      const targetWidth = containerWidth - padding;
      const targetHeight = containerHeight - padding;

      // Swap slide dimensions if rotated 90deg to calculate proper bounds scale
      const slideWidth = isRotated ? 1080 : 1920;
      const slideHeight = isRotated ? 1920 : 1080;

      const widthScale = targetWidth / slideWidth;
      const heightScale = targetHeight / slideHeight;

      // Select min scale factor to prevent cropping
      const finalScale = Math.min(widthScale, heightScale);
      setScale(Math.max(0.1, Math.min(1.0, finalScale)));
    };

    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(previewContainerRef.current);
    calculateScale();

    return () => resizeObserver.disconnect();
  }, [isRotated]);

  // PNG Export Handler
  const handleDownloadPng = async () => {
    const node = document.getElementById("capture-slide");
    if (!node) return;

    setIsExportingPng(true);
    try {
      await exportPng({ node, caption });
    } catch (error) {
      console.error("Failed to generate slide image:", error);
      alert("Error generating PNG. Please check the browser console for details.");
    } finally {
      setIsExportingPng(false);
    }
  };

  // PPTX Export Handler
  const handleDownloadPptx = async () => {
    setIsExportingPptx(true);
    try {
      await exportPptx({
        activeTheme,
        title,
        caption,
        showDetails,
        framing,
        visibleLines,
        zoomScale,
        showLineNumbers,
        highlightedLines,
      });
    } catch (error) {
      console.error("Failed to build editable PPTX:", error);
      alert("Error generating PPTX. Please check console.");
    } finally {
      setIsExportingPptx(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen lg:h-screen w-screen bg-slate-950/20 font-sans">

      {/* HEADER BAR */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-15">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-950/30">
            <Layout className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              CodeView
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-400 border border-violet-500/20">
                PRO SECTIONS
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs gap-1.5 transition shadow-lg cursor-pointer"
          >
            <Sliders className="h-4 w-4" />
            Settings
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
            <span>Personal Studio Edition</span>
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">

        {/* Backdrop for mobile drawer overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* LEFT BAR: SIDEBAR CONTROLS */}
        <aside className={cn(
          "shrink-0 border-white/5 bg-slate-900/95 backdrop-blur-xl lg:bg-slate-900/20 p-5 overflow-hidden transition-all duration-300 z-40",
          // Desktop styling
          "lg:w-[420px] lg:border-r lg:relative lg:translate-x-0 lg:flex",
          // Mobile styling: overlay sheet sliding in from left
          "fixed inset-y-0 left-0 w-[85%] max-w-[380px] border-r shadow-2xl flex flex-col transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          {/* Mobile close button inside drawer */}
          <div className="lg:hidden flex items-center justify-between mb-4 pb-2 border-b border-white/5 shrink-0">
            <span className="font-semibold text-sm text-violet-400">Slide Configuration</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-md hover:bg-white/5 text-slate-400 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarControls
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            selectedThemeId={themeId}
            setThemeId={setThemeId}
            framing={framing}
            setFraming={setFraming}
            visibleLines={visibleLines}
            setVisibleLines={setVisibleLines}
            recommendedLines={recommendedLines}
            zoomScale={zoomScale}
            setZoomScale={setZoomScale}
            showLineNumbers={showLineNumbers}
            setShowLineNumbers={setShowLineNumbers}
            highlightedLines={highlightedLines}
            setHighlightedLines={setHighlightedLines}
            title={title}
            setTitle={setTitle}
            caption={caption}
            setCaption={setCaption}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            onDownloadPng={handleDownloadPng}
            onDownloadPptx={handleDownloadPptx}
            isExportingPng={isExportingPng}
            isExportingPptx={isExportingPptx}
          />
        </aside>

        {/* RIGHT PREVIEW WORKSPACE */}
        <main
          ref={previewContainerRef}
          className="flex-1 bg-slate-950/40 flex items-center justify-center relative overflow-hidden p-4 lg:p-6 h-[calc(100vh-4rem)] lg:h-auto"
        >
          {/* Controls Overlay (Mobile Only Rotation) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              onClick={() => setIsRotated(!isRotated)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-white/10 backdrop-blur-md text-xs font-semibold text-slate-200 hover:text-white transition shadow-lg cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5 text-violet-400" />
              {isRotated ? "Horizontal Mode" : "Tilt Landscape Mode"}
            </button>
          </div>

          {/* Virtual 1920x1080 slide wrapper dynamically scaled down and rotated */}
          <div
            style={{
              width: "1920px",
              height: "1080px",
              transform: `scale(${scale}) ${isRotated ? "rotate(90deg)" : ""}`,
              transformOrigin: "center center",
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="shadow-2xl rounded-2xl overflow-hidden shrink-0 border border-white/5"
          >
            <SlidePreview
              code={code}
              language={language}
              theme={activeTheme}
              framing={framing}
              visibleLines={visibleLines}
              zoomScale={zoomScale}
              showLineNumbers={showLineNumbers}
              highlightedLines={highlightedLines}
              title={showDetails ? title : ""}
              caption={showDetails ? caption : ""}
              fontFamily={fontFamily}
            />
          </div>

          {/* Sizing Indicator Badge */}
          <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-white/5 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono shadow-md">
            Render Scale: {Math.round(scale * 100)}% {isRotated ? "(Rotated)" : ""} (1920x1080 px)
          </div>
        </main>

      </div>
    </div>
  )
}
