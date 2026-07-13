/**
 * @file SlidePreview.tsx
 * @description Component that renders the presentation slide.
 * Performs dynamic line splits, syntax highlighting (via highlight.js),
 * highlights target lines, and computes vertical bounds auto-scaling for text.
 */

import React, { useMemo } from "react"
import hljs from "highlight.js"
import type { SlideTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

interface SlidePreviewProps {
  code: string;
  language: string;
  theme: SlideTheme;
  framing: "slide" | "window";
  visibleLines: number;
  zoomScale: number;
  showLineNumbers: boolean;
  highlightedLines: string; // e.g. "2-4,7"
  title: string;
  caption: string;
  fontFamily: string;
}

// Bulletproof HTML tag-preserving line-splitter for highlight.js output
function splitHighlightedHtmlIntoLines(html: string): string[] {
  const lines = html.split(/\r?\n/);
  const activeTags: string[] = []; // Stack of open tags

  return lines.map((line) => {
    // Re-open tags active from previous lines
    let processedLine = activeTags.join("") + line;

    // Find all span tags in the current line (opening vs closing)
    const tagRegex = /(<span[^>]*>)|(<\/span>)/g;
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
      if (match[1]) {
        activeTags.push(match[1]); // Opening span tag
      } else if (match[2]) {
        activeTags.pop(); // Closing span tag
      }
    }

    // Close all currently open tags at the end of the line
    processedLine += "</span>".repeat(activeTags.length);
    return processedLine;
  });
}

// Parses line range string (e.g., "1-3, 5, 7-10") into a set of line numbers
function parseHighlightedLines(rangeStr: string): Set<number> {
  const nums = new Set<number>();
  if (!rangeStr.trim()) return nums;

  const parts = rangeStr.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          nums.add(i);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num)) {
        nums.add(num);
      }
    }
  }
  return nums;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({
  code,
  language,
  theme,
  framing,
  visibleLines,
  zoomScale,
  showLineNumbers,
  highlightedLines,
  title,
  caption,
  fontFamily,
}) => {
  // Highlight code and split into clean lines
  const highlightedLinesHtml = useMemo(() => {
    let highlighted = "";
    if (language === "plaintext") {
      // Escape HTML to prevent injection
      highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    } else if (language === "__auto__") {
      try {
        highlighted = hljs.highlightAuto(code).value;
      } catch {
        highlighted = code;
      }
    } else {
      try {
        highlighted = hljs.highlight(code, { language }).value;
      } catch {
        // Fallback to auto
        highlighted = hljs.highlightAuto(code).value;
      }
    }

    return splitHighlightedHtmlIntoLines(highlighted);
  }, [code, language]);

  // Set of lines that should be focused
  const highlightSet = useMemo(() => {
    return parseHighlightedLines(highlightedLines);
  }, [highlightedLines]);

  // Dynamic code font sizing to fit exactly N lines in the vertical slide space
  const fontStyle = useMemo(() => {
    // Total slide height is 1080px. Parent padding (p-20) takes 160px total.
    let availableHeight = 920;

    // Subtract space taken by optional headers or footers
    if (title) availableHeight -= 110;
    if (caption) availableHeight -= 60;

    // Calculate base font size for N visible lines with 1.55 line height
    const baseFontSize = (availableHeight / visibleLines) / 1.55;

    // Apply user's custom zoom scale multiplier
    const finalSize = Math.max(12, Math.min(64, baseFontSize * zoomScale));

    return {
      fontSize: `${finalSize}px`,
      lineHeight: "1.55",
      fontFamily: fontFamily,
    };
  }, [title, caption, visibleLines, zoomScale, fontFamily]);

  return (
    // Physical size container (always 1920x1080 in virtual layout)
    <div
      id="capture-slide"
      className={cn(
        "relative w-[1920px] h-[1080px] select-none flex flex-col justify-between p-20 overflow-hidden transition-all duration-300",
        theme.bgClass,
        theme.className
      )}
      style={{
        boxSizing: "border-box",
      }}
    >
      {/* Slide Title */}
      {title && (
        <div className="w-full text-left mb-6 max-h-[140px] overflow-hidden">
          <h2 className={cn("text-6xl font-bold tracking-tight", theme.titleColor)}>
            {title}
          </h2>
        </div>
      )}

      {/* Main Code Core Box */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0">
        {framing === "window" ? (
          // VS Code editor window framing (macOS style chrome)
          <div className="w-full rounded-2xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden max-h-full">
            {/* macOS title bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/20 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f] inline-block" />
              </div>
              <div className="text-sm font-mono text-slate-400 select-none">
                {caption ? caption : "CodeView.editor"}
              </div>
              <div className="w-14" /> {/* Spacer to center title */}
            </div>

            {/* Code Body */}
            <div className="p-6 overflow-hidden flex-1 code-window">
              <pre className="m-0 p-0 text-left">
                <code className="hljs font-mono block" style={fontStyle}>
                  {highlightedLinesHtml.map((lineHtml, index) => {
                    const lineNum = index + 1;
                    const isHighlighted = highlightSet.has(lineNum);
                    const isAnyHighlighted = highlightSet.size > 0;
                    const isDimmed = isAnyHighlighted && !isHighlighted;

                    return (
                      <div
                        key={index}
                        className={cn("code-line", {
                          highlighted: isHighlighted,
                          dimmed: isDimmed,
                        })}
                      >
                        {showLineNumbers && (
                          <span
                            className="mr-6 opacity-30 select-none text-right inline-block w-12 shrink-0"
                            style={{ fontSize: "0.85em" }}
                          >
                            {lineNum}
                          </span>
                        )}
                        <span
                          className="flex-1 min-w-0"
                          dangerouslySetInnerHTML={{ __html: lineHtml || "&nbsp;" }}
                        />
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
        ) : (
          // Frameless raw slide view
          <div className="w-full text-left overflow-hidden max-h-full">
            <pre className="m-0 p-0">
              <code className="hljs font-mono block" style={fontStyle}>
                {highlightedLinesHtml.map((lineHtml, index) => {
                  const lineNum = index + 1;
                  const isHighlighted = highlightSet.has(lineNum);
                  const isAnyHighlighted = highlightSet.size > 0;
                  const isDimmed = isAnyHighlighted && !isHighlighted;

                  return (
                    <div
                      key={index}
                      className={cn("code-line", {
                        highlighted: isHighlighted,
                        dimmed: isDimmed,
                      })}
                    >
                      {showLineNumbers && (
                        <span
                          className="mr-6 opacity-25 select-none text-right inline-block w-12 shrink-0"
                          style={{ fontSize: "0.85em" }}
                        >
                          {lineNum}
                        </span>
                      )}
                      <span
                        className="flex-1 min-w-0"
                        dangerouslySetInnerHTML={{ __html: lineHtml || "&nbsp;" }}
                      />
                    </div>
                  );
                })}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Slide Footer / Caption (only in slide mode, or at footer) */}
      {caption && framing === "slide" && (
        <div className="w-full text-right mt-6 shrink-0">
          <p className={cn("text-3xl font-mono opacity-80", theme.captionColor)}>
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};
export default SlidePreview;
