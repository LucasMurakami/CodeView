/**
 * @file SidebarControls.tsx
 * @description Component rendering the configuration interface panel.
 * Houses source code input textareas, theme picker cards with syntax mock previews,
 * layout adjustments, visible lines fit control (with recommendations and dynamic warnings),
 * and PNG/PPTX file generation trigger buttons.
 */

import React from "react"
import { 
  Code2, 
  Settings, 
  Download, 
  Presentation,
  Type, 
  Sliders, 
  Palette, 
  Eye, 
  HelpCircle 
} from "lucide-react"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select"
import { Card, CardContent } from "./ui/card"
import { SLIDE_THEMES, type SlideTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

interface SidebarControlsProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  selectedThemeId: string;
  setThemeId: (id: string) => void;
  framing: "slide" | "window";
  setFraming: (framing: "slide" | "window") => void;
  visibleLines: number;
  setVisibleLines: (lines: number) => void;
  recommendedLines: number;
  zoomScale: number;
  setZoomScale: (scale: number) => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (show: boolean) => void;
  highlightedLines: string;
  setHighlightedLines: (lines: string) => void;
  title: string;
  setTitle: (title: string) => void;
  caption: string;
  setCaption: (caption: string) => void;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  onDownloadPng: () => void;
  onDownloadPptx: () => void;
  isExportingPng: boolean;
  isExportingPptx: boolean;
}

const LANGUAGES = [
  { value: "__auto__", label: "Auto-detect" },
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "html", label: "HTML/XML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
];

const FONTS = [
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
  { value: "ui-monospace, monospace", label: "SF Mono / System" },
  { value: "'Courier New', Courier, monospace", label: "Courier New" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
];

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  selectedThemeId,
  setThemeId,
  framing,
  setFraming,
  visibleLines,
  setVisibleLines,
  recommendedLines,
  zoomScale,
  setZoomScale,
  showLineNumbers,
  setShowLineNumbers,
  highlightedLines,
  setHighlightedLines,
  title,
  setTitle,
  caption,
  setCaption,
  showDetails,
  setShowDetails,
  fontFamily,
  setFontFamily,
  onDownloadPng,
  onDownloadPptx,
  isExportingPng,
  isExportingPptx,
}) => {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
      
      {/* 1. INPUT CODE SECTION */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2 text-violet-400">
            <Code2 className="h-4 w-4" />
            Paste Source Code
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {code.split("\n").length} Lines
          </span>
        </div>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste your code here..."
          className="h-[220px] font-mono text-xs leading-normal resize-y glass-input"
          spellCheck={false}
        />
      </div>


      {/* 3. SETTINGS & STYLING */}
      <Card className="glass-panel">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-400">
            <Settings className="h-4 w-4" />
            Display Configuration
          </div>
          
          <div className="flex flex-col gap-4">
            
            {/* Slide Framing */}
            <div>
              <label className="text-xs text-slate-350 block mb-1.5">Slide Framing</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                <Button
                  variant={framing === "slide" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFraming("slide")}
                  className="rounded-md py-1.5"
                >
                  Slide Deck
                </Button>
                <Button
                  variant={framing === "window" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFraming("window")}
                  className="rounded-md py-1.5"
                >
                  IDE Window
                </Button>
              </div>
            </div>

            {/* Language & Fonts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-350 block mb-1">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-350 block mb-1">Font Family</label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select Font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sliders: Visible Lines & Zoom */}
            <div className="flex flex-col gap-3 pt-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-350 flex items-center gap-1.5">
                    <Sliders className="h-3 w-3" />
                    Visible Lines Fit
                  </label>
                  <span className={`text-xs font-mono font-bold ${visibleLines !== recommendedLines ? 'text-amber-400 animate-pulse' : 'text-violet-400'}`}>
                    {visibleLines} {visibleLines !== recommendedLines ? '⚠️' : ''}
                  </span>
                </div>
                <Slider
                  min={5}
                  max={45}
                  step={1}
                  value={[visibleLines]}
                  onValueChange={(val) => setVisibleLines(val[0])}
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Saves scrolling: auto-scales code sizing to fit lines in view.
                </span>
                {visibleLines !== recommendedLines && (
                  <div className="text-[10px] text-amber-400 flex items-center justify-between mt-1.5 bg-amber-500/10 border border-amber-500/20 rounded p-1.5">
                    <span>
                      {visibleLines < recommendedLines 
                        ? "⚠️ Fit too small: code text may overflow or get clipped." 
                        : "⚠️ Fit too large: code text may appear too small."
                      }
                    </span>
                    <button 
                      onClick={() => setVisibleLines(recommendedLines)} 
                      className="text-violet-400 hover:text-violet-300 underline font-semibold cursor-pointer shrink-0 ml-2"
                    >
                      Reset to {recommendedLines}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-350">Zoom Scale</label>
                  <span className="text-xs font-mono text-violet-400 font-bold">{Math.round(zoomScale * 100)}%</span>
                </div>
                <Slider
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={[zoomScale]}
                  onValueChange={(val) => setZoomScale(val[0])}
                />
              </div>
            </div>

            {/* Line Numbers Toggle */}
            <div className="flex items-center gap-2 py-1">
              <Checkbox
                id="show-lines"
                checked={showLineNumbers}
                onCheckedChange={(checked) => setShowLineNumbers(!!checked)}
              />
              <label 
                htmlFor="show-lines" 
                className="text-xs text-slate-300 font-medium cursor-pointer flex items-center gap-1.5 select-none"
              >
                <Eye className="h-3.5 w-3.5" />
                Render line numbers
              </label>
            </div>

            {/* Highlighting Lines */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-350 flex items-center gap-1">
                  Highlight Specific Lines
                </label>
                <div className="group relative">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                  <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block z-50 w-52 p-2 bg-slate-900 border border-slate-700 rounded-md text-[10px] leading-relaxed text-slate-300 shadow-lg">
                    Focus on specific lines (dims other lines). Use commas and ranges, e.g.: <span className="font-mono text-violet-400">2-4, 7, 10-12</span>
                  </div>
                </div>
              </div>
              <Input
                type="text"
                placeholder="e.g. 2-5, 8"
                value={highlightedLines}
                onChange={(e) => setHighlightedLines(e.target.value)}
                className="glass-input font-mono text-xs"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* 4. THEMES SELECTION */}
      <Card className="glass-panel">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-400">
            <Palette className="h-4 w-4" />
            Pick Presentation Theme
          </div>
          <div className="grid grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
            {SLIDE_THEMES.map((t) => (
              <button
                key={t.id}
                className={cn(
                  "relative flex flex-col gap-2 rounded-xl p-2 border text-left transition-all duration-200 cursor-pointer overflow-hidden",
                  selectedThemeId === t.id 
                    ? "border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-950/20 ring-1 ring-violet-500" 
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-850/60"
                )}
                onClick={() => setThemeId(t.id)}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-semibold text-slate-200 truncate">{t.name}</span>
                  {selectedThemeId === t.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  )}
                </div>

                {/* Mock Code Block using the theme classes */}
                <div 
                  className={cn(
                    "w-full rounded-md border border-white/5 p-1.5 font-mono text-[8px] leading-normal select-none h-[48px] overflow-hidden",
                    t.className
                  )}
                  style={{
                    backgroundColor: `var(--syn-bg)`,
                    color: `var(--syn-text)`,
                  }}
                >
                  <div className="flex gap-1">
                    <span className="hljs-keyword">const</span>
                    <span className="hljs-title">hook</span>
                    <span className="hljs-operator">=</span>
                    <span className="hljs-string">"ok"</span>
                  </div>
                  <div className="flex gap-1 mt-0.5 opacity-80">
                    <span className="hljs-keyword">if</span>
                    <span className="hljs-punctuation">(</span>
                    <span className="hljs-variable">hook</span>
                    <span className="hljs-punctuation">)</span>
                  </div>
                  <div className="flex gap-1 mt-0.5 opacity-60 pl-2">
                    <span className="hljs-built_in">log</span>
                    <span className="hljs-punctuation">(</span>
                    <span className="hljs-string">"in"</span>
                    <span className="hljs-punctuation">)</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. SLIDE TEXT (TITLE & CAPTION) - Optional toggle section */}
      <Card className="glass-panel">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-400">
              <Type className="h-4 w-4" />
              Slide Details (Optional)
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="enable-details"
                checked={showDetails}
                onCheckedChange={(checked) => setShowDetails(!!checked)}
              />
              <label 
                htmlFor="enable-details" 
                className="text-xs text-slate-350 font-medium cursor-pointer select-none"
              >
                Enable
              </label>
            </div>
          </div>
          
          <div className={cn("flex flex-col gap-3 transition-all duration-200", { "opacity-40 pointer-events-none select-none": !showDetails })}>
            <div>
              <label className="text-xs text-slate-350 block mb-1">Slide Title</label>
              <Input
                type="text"
                placeholder="e.g. How OAuth 2.0 Works"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
                disabled={!showDetails}
              />
            </div>
            <div>
              <label className="text-xs text-slate-350 block mb-1">Caption / Footer / Filename</label>
              <Input
                type="text"
                placeholder="e.g. auth-middleware.ts:52"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="glass-input"
                disabled={!showDetails}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. DOWNLOAD / EXPORT */}
      <div className="flex flex-col gap-2 shrink-0">
        <Button
          variant="default"
          onClick={onDownloadPng}
          disabled={isExportingPng}
          className="w-full flex items-center justify-center gap-2 py-5 font-semibold text-base shadow-lg cursor-pointer bg-violet-600 hover:bg-violet-500 shadow-violet-950/20"
        >
          <Download className="h-5 w-5" />
          {isExportingPng ? "Generating PNG..." : "Download High-Res PNG"}
        </Button>
        <Button
          variant="glass"
          onClick={onDownloadPptx}
          disabled={isExportingPptx}
          className="w-full flex items-center justify-center gap-2 py-5 font-semibold text-slate-200 cursor-pointer"
        >
          <Presentation className="h-5 w-5 text-violet-400" />
          {isExportingPptx ? "Building PowerPoint..." : "Export Editable PPTX"}
        </Button>
      </div>

    </div>
  )
}
