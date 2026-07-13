/**
 * @file slideExporter.ts
 * @description Provides slide export services for CodeView.
 * Handles high-resolution canvas PNG capture (via html-to-image)
 * and interactive Microsoft PowerPoint (.pptx) file generation (via pptxgenjs).
 * Also integrates the modern browser File System Access API for user-friendly download dialogs.
 */

import * as htmlToImage from "html-to-image";
import pptxgen from "pptxgenjs";
import { type SlideTheme } from "./themes";

/**
 * Converts an rgb(r, g, b) CSS color string to a HEX string.
 * Required for pptxgenjs text and shape coloring.
 */
export function rgbToHex(rgbStr: string): string {
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return "FFFFFF";
  const r = parseInt(match[0], 10);
  const g = parseInt(match[1], 10);
  const b = parseInt(match[2], 10);
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Converts a base64 encoded dataURL string into a raw Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)![1];
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Handles downloading a file Blob to the client's local system.
 * Uses the modern File System Access API (showSaveFilePicker) if available,
 * fallback to programmatic anchor downloads for older browsers.
 */
export async function saveBlob(blob: Blob, fileName: string) {
  if ("showSaveFilePicker" in window) {
    try {
      const ext = fileName.split(".").pop() || "bin";
      const mimeMap: Record<string, string> = {
        png: "image/png",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      };
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: ext.toUpperCase() + " File",
            accept: { [mimeMap[ext] || "application/octet-stream"]: [`.${ext}`] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err?.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

interface ExportPngOptions {
  node: HTMLElement;
  caption: string;
}

/**
 * Captures a DOM node layout at 1920x1080 and downloads it as a high-res PNG.
 */
export async function exportPng({ node, caption }: ExportPngOptions) {
  const dataUrl = await htmlToImage.toPng(node, {
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    fontEmbedCSS: "",
    skipFonts: true,
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
    },
  });

  const blob = dataUrlToBlob(dataUrl);
  const safeCaption = caption
    ? caption.replace(/[^a-zA-Z0-9_\-]/g, "_")
    : "code-slide";

  await saveBlob(blob, `${safeCaption}.png`);
}

interface ExportPptxOptions {
  activeTheme: SlideTheme;
  title: string;
  caption: string;
  showDetails: boolean;
  framing: "slide" | "window";
  visibleLines: number;
  zoomScale: number;
  showLineNumbers: boolean;
  highlightedLines: string;
}

/**
 * Compiles slide details, theme properties, and code highlights
 * into an editable Microsoft PowerPoint (.pptx) file.
 */
export async function exportPptx({
  activeTheme,
  title,
  caption,
  showDetails,
  framing,
  visibleLines,
  zoomScale,
  showLineNumbers,
  highlightedLines,
}: ExportPptxOptions) {
  const pptx = new pptxgen();
  const exportTitle = showDetails ? title : "";
  const exportCaption = showDetails ? caption : "";

  pptx.defineLayout({ name: "16:9", width: 13.33, height: 7.5 });
  pptx.layout = "16:9";

  const slide = pptx.addSlide();
  slide.background = { fill: activeTheme.pptxBg };

  if (exportTitle) {
    slide.addText(exportTitle, {
      x: 0.6,
      y: 0.5,
      w: 12.13,
      h: 0.9,
      fontSize: 32,
      bold: true,
      color: activeTheme.pptxTitle,
      fontFace: "Arial",
      verticalAlign: "middle",
    });
  }

  if (exportCaption && framing === "slide") {
    slide.addText(exportCaption, {
      x: 0.6,
      y: 6.6,
      w: 12.13,
      h: 0.4,
      fontSize: 16,
      color: activeTheme.pptxCaption,
      align: "right",
      fontFace: "Courier New",
    });
  }

  const codeY = exportTitle ? 1.5 : 0.8;
  const codeH = exportTitle ? 5.0 : 5.8;

  if (framing === "window") {
    slide.addShape("roundRect", {
      x: 0.6,
      y: codeY,
      w: 12.13,
      h: codeH,
      fill: { color: activeTheme.pptxEditorBg },
      line: { color: "334155", width: 1 },
    });

    slide.addShape("ellipse", { x: 0.8, y: codeY + 0.15, w: 0.12, h: 0.12, fill: { color: "FF5F56" } });
    slide.addShape("ellipse", { x: 0.96, y: codeY + 0.15, w: 0.12, h: 0.12, fill: { color: "FFBD2E" } });
    slide.addShape("ellipse", { x: 1.12, y: codeY + 0.15, w: 0.12, h: 0.12, fill: { color: "27C93F" } });

    slide.addText(exportCaption ? exportCaption : "editor.code", {
      x: 1.5,
      y: codeY + 0.08,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      color: "64748B",
      fontFace: "Courier New",
      align: "center",
    });
  }

  const lineElements = document.querySelectorAll("#capture-slide .code-line");
  const pptxRuns: any[] = [];

  const availableHeight = exportTitle || exportCaption ? 840 : 960;
  const calculatedFontSize = availableHeight / visibleLines / 1.55;
  const baseFontSize = Math.max(12, Math.min(64, calculatedFontSize * zoomScale));
  const pptxFontSize = Math.max(10, Math.min(48, Math.round(baseFontSize * 0.75)));

  const testSpan = document.createElement("span");
  const slidePreviewNode = document.getElementById("capture-slide");
  if (slidePreviewNode) {
    slidePreviewNode.appendChild(testSpan);
  }
  const defaultTextColor = rgbToHex(window.getComputedStyle(testSpan).color);
  testSpan.remove();

  const activeHighlights = highlightedLines.trim();
  const highlightNums = new Set<number>();
  if (activeHighlights) {
    activeHighlights.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [startStr, endStr] = trimmed.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            highlightNums.add(i);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num)) highlightNums.add(num);
      }
    });
  }

  lineElements.forEach((lineEl, lineIndex) => {
    const lineNum = lineIndex + 1;
    const isHighlighted = highlightNums.has(lineNum);
    const isDimmed = highlightNums.size > 0 && !isHighlighted;

    const children = lineEl.childNodes;
    children.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        if (!text) return;

        const blendedColor = isDimmed ? "555E75" : defaultTextColor;

        pptxRuns.push({
          text: text,
          options: {
            color: blendedColor,
            fontFace: "Courier New",
            fontSize: pptxFontSize,
          },
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;

        if (showLineNumbers && el.classList.contains("select-none")) {
          const linePrefix = el.textContent || "";
          pptxRuns.push({
            text: linePrefix + "  ",
            options: {
              color: "556880",
              fontFace: "Courier New",
              fontSize: pptxFontSize,
            },
          });
          return;
        }

        const rawColor = window.getComputedStyle(el).color;
        let runHexColor = rgbToHex(rawColor);

        if (isDimmed) {
          runHexColor = "64748B";
        }

        pptxRuns.push({
          text: el.textContent || "",
          options: {
            color: runHexColor,
            fontFace: "Courier New",
            fontSize: pptxFontSize,
          },
        });
      }
    });

    if (lineIndex < lineElements.length - 1) {
      if (pptxRuns.length > 0) {
        pptxRuns[pptxRuns.length - 1].options = {
          ...pptxRuns[pptxRuns.length - 1].options,
          breakLine: true,
        };
      } else {
        pptxRuns.push({ text: "", options: { breakLine: true } });
      }
    }
  });

  const paddingX = 0.5;
  const paddingY = framing === "window" ? 0.5 : 0.25;

  slide.addText(pptxRuns, {
    x: 0.6 + paddingX,
    y: codeY + paddingY,
    w: 12.13 - paddingX * 2,
    h: codeH - paddingY * 2,
    verticalAlign: "top",
  });

  const safeCaption = caption
    ? caption.replace(/[^a-zA-Z0-9_\-]/g, "_")
    : "code-slide";
  const pptxBlob = (await pptx.write({ outputType: "blob" })) as Blob;
  await saveBlob(pptxBlob, `${safeCaption}.pptx`);
}
