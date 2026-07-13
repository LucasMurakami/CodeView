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
import { SLIDE_THEMES } from "./lib/themes"
import { Sparkles, Layout, Sliders, X, RotateCw, Code2, Download, Presentation } from "lucide-react"
import { cn } from "./lib/utils"
import { exportPng, exportPptx } from "./lib/slideExporter"
import { Button } from "./components/ui/button"
import { Textarea } from "./components/ui/textarea"

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

  // Body scroll lock when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Track compact viewport for responsive slide padding and active viewport type
  const [compactSlide, setCompactSlide] = useState(window.innerWidth < 640);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const onResize = () => {
      setCompactSlide(window.innerWidth < 640);
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Dynamic Scale Calculator
  useEffect(() => {
    if (!previewContainerRef.current) return;

    const calculateScale = () => {
      const container = previewContainerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      if (containerWidth === 0 || containerHeight === 0) return;

      // Fit 1920x1080 slide inside container with responsive padding
      const padding = isMobile ? 16 : 48;
      const targetWidth = containerWidth - padding;
      const targetHeight = containerHeight - padding;

      // Swap slide dimensions if rotated 90deg to calculate proper bounds scale
      const slideWidth = isRotated ? 1080 : 1920;
      const slideHeight = isRotated ? 1920 : 1080;

      const widthScale = targetWidth / slideWidth;
      const heightScale = targetHeight / slideHeight;

      // Fit both axes so slide is never cut off
      const finalScale = Math.min(widthScale, heightScale);
      setScale(Math.max(0.05, Math.min(1.0, finalScale)));
    };

    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(previewContainerRef.current);
    calculateScale();

    return () => resizeObserver.disconnect();
  }, [isRotated, isLandscape, isMobile]);

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
    <div className="flex flex-col min-h-screen lg:h-screen w-screen bg-slate-950/20 font-sans text-slate-100 selection:bg-violet-500/30">

      {/* HEADER BAR */}
      <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-15">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-950/30">
            <Layout className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
          </div>
          <h1 className="text-base lg:text-lg font-bold tracking-tight text-slate-100 flex items-center gap-1 lg:gap-2">
            CodeView
            <span className="text-[9px] lg:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-violet-600/30 text-violet-400 border border-violet-500/20">
              PRO
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="hidden lg:flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
            <span>Personal Studio Edition</span>
          </div>
        </div>
      </header>

      {/* RENDER ACTIVE VIEWPORT LAYOUT */}
      {isMobile ? (
        /* MOBILE: VERTICAL LAYOUT */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950/10">
          
          {/* 1. Text Input (Source Code) */}
          <div className="shrink-0 flex flex-col gap-1.5 p-4 pb-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold flex items-center gap-1.5 text-violet-400">
                <Code2 className="h-3.5 w-3.5" />
                Source Code
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {code.split("\n").length} Lines
              </span>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
              className="h-[90px] font-mono text-xs leading-normal resize-none glass-input"
              spellCheck={false}
            />
          </div>

          {/* 2 & 3. Open Settings & Rotate Buttons */}
          <div className="px-4 py-2 shrink-0 flex items-center gap-3">
            {/* 2. Open Settings Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900/80 border border-white/10 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-lg cursor-pointer min-h-[44px]"
            >
              <Sliders className="h-4 w-4 text-violet-400" />
              Settings
            </button>
            
            {/* 3. Button that Rotate (just label Rotate) */}
            <button
              onClick={() => setIsRotated(!isRotated)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900/80 border border-white/10 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-lg cursor-pointer min-h-[44px]"
            >
              <RotateCw className="h-4 w-4 text-violet-400" />
              Rotate
            </button>
          </div>

          {/* 4. Slide Preview Image */}
          <main
            ref={previewContainerRef}
            className="flex-1 flex items-center justify-center p-4 relative overflow-hidden min-h-0 bg-slate-950/50"
          >
            {/* Virtual 1920x1080 slide wrapper */}
            <div
              style={{
                width: "1920px",
                height: "1080px",
                transform: `scale(${scale}) ${isRotated ? "rotate(90deg)" : ""}`,
                transformOrigin: "center center",
              }}
              className="shadow-2xl rounded-2xl overflow-hidden shrink-0 border border-white/5 bg-slate-900"
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
                compact={compactSlide}
              />
            </div>
          </main>

          {/* 5. Download Image/PPTX Buttons */}
          <div className="shrink-0 px-4 pb-4 pt-2 flex gap-3 bg-slate-950/20 border-t border-white/5">
            <Button
              variant="default"
              onClick={handleDownloadPng}
              disabled={isExportingPng}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-xs shadow-lg cursor-pointer bg-violet-600 hover:bg-violet-500 shadow-violet-950/20 min-h-[44px]"
            >
              <Download className="h-4 w-4" />
              {isExportingPng ? "Saving..." : "Download PNG"}
            </Button>
            <Button
              variant="glass"
              onClick={handleDownloadPptx}
              disabled={isExportingPptx}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-slate-200 cursor-pointer min-h-[44px]"
            >
              <Presentation className="h-4 w-4 text-violet-400" />
              {isExportingPptx ? "Saving..." : "Export PPTX"}
            </Button>
          </div>

          {/* Backdrop for mobile drawer */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Settings Drawer - slides up from bottom */}
          <aside className={cn(
            "fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 transition-transform duration-300 z-40 flex flex-col",
            "max-h-[70vh]",
            isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
          )}>
            <div className="flex items-center justify-between p-3 border-b border-white/5 shrink-0">
              <span className="font-semibold text-sm text-violet-400">Configuration</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-white/5 text-slate-400 cursor-pointer min-h-[44px] min-w-[44px]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto pb-4 flex-1">
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
                hideCodeInput
              />
            </div>
          </aside>
        </div>
      ) : (
        /* DESKTOP: SIDEBAR + PREVIEW SIDE BY SIDE */
        <div className="flex flex-1 flex-row min-h-0 overflow-hidden relative bg-slate-950/20">
          
          {/* LEFT BAR: SIDEBAR CONTROLS */}
          <aside className="shrink-0 border-white/5 bg-slate-900/20 p-5 overflow-hidden w-[420px] border-r lg:flex flex-col">
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
            className="flex-1 bg-slate-950/40 flex items-center justify-center p-6 lg:h-auto relative overflow-hidden"
          >
            {/* Virtual 1920x1080 slide wrapper */}
            <div
              style={{
                width: "1920px",
                height: "1080px",
                transform: `scale(${scale}) ${isRotated ? "rotate(90deg)" : ""}`,
                transformOrigin: "center center",
              }}
              className="shadow-2xl rounded-2xl overflow-hidden shrink-0 border border-white/5 bg-slate-900"
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
                compact={false}
              />
            </div>

            {/* Sizing Indicator Badge */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-white/5 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono shadow-md">
              Render Scale: {Math.round(scale * 100)}% {isRotated ? "(Rotated)" : ""} (1920x1080 px)
            </div>
          </main>
        </div>
      )}

    </div>
  )
}
