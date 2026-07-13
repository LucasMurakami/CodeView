/**
 * @file themes.ts
 * @description Theme configuration definitions for CodeView.
 * Maps UI CSS classes and active variables to equivalent Microsoft PowerPoint (.pptx) hex colors.
 */

export interface SlideTheme {
  id: string;
  name: string;
  className: string;
  bgClass: string;
  textColor: string;
  titleColor: string;
  captionColor: string;
  description: string;
  // PPTX export hex definitions
  pptxBg: string;
  pptxTitle: string;
  pptxCaption: string;
  pptxEditorBg: string;
}

export const SLIDE_THEMES: SlideTheme[] = [
  {
    id: "stage-dark",
    name: "Stage Dark",
    className: "theme-stage-dark",
    bgClass: "bg-[#13151c]",
    textColor: "text-slate-100",
    titleColor: "text-slate-100",
    captionColor: "text-slate-400",
    description: "Neutral dark — clean and slate",
    pptxBg: "13151C",
    pptxTitle: "F1F5F9",
    pptxCaption: "94A3B8",
    pptxEditorBg: "151720",
  },
  {
    id: "stage-light",
    name: "Stage Light",
    className: "theme-stage-light",
    bgClass: "bg-[#f8fafc] border border-slate-200/50",
    textColor: "text-slate-900",
    titleColor: "text-slate-900",
    captionColor: "text-slate-500",
    description: "Conservative light — clean and quiet",
    pptxBg: "F8FAFC",
    pptxTitle: "0F172A",
    pptxCaption: "64748B",
    pptxEditorBg: "FFFFFF",
  },
  {
    id: "cyberpunk",
    name: "Midnight Cyberpunk",
    className: "theme-cyberpunk",
    bgClass: "bg-gradient-to-br from-[#0c051a] via-[#120a2b] to-[#1e072c]",
    textColor: "text-[#ff007f]",
    titleColor: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 font-extrabold",
    captionColor: "text-cyan-400",
    description: "Vibrant neon — cyberpunk retro styling",
    pptxBg: "0C051A",
    pptxTitle: "FF00FF",
    pptxCaption: "00FFFF",
    pptxEditorBg: "07030F",
  },
  {
    id: "dracula",
    name: "Dracula Classic",
    className: "theme-dracula",
    bgClass: "bg-[#1e1f29]",
    textColor: "text-[#f8f8f2]",
    titleColor: "text-[#f8f8f2]",
    captionColor: "text-[#6272a4]",
    description: "Classic dark theme with pastels",
    pptxBg: "1E1F29",
    pptxTitle: "F8F8F2",
    pptxCaption: "6272A4",
    pptxEditorBg: "282A36",
  },
  {
    id: "greenroom",
    name: "Emerald Greenroom",
    className: "theme-greenroom",
    bgClass: "bg-[#0b100d]",
    textColor: "text-[#d4e4d8]",
    titleColor: "text-[#d4e4d8]",
    captionColor: "text-[#5a7064]",
    description: "Muted forest green — easy on long sessions",
    pptxBg: "0B100D",
    pptxTitle: "D4E4D8",
    pptxCaption: "5A7064",
    pptxEditorBg: "0F1411",
  },
  {
    id: "daylight",
    name: "Solarized Daylight",
    className: "theme-daylight",
    bgClass: "bg-[#faf6ee]",
    textColor: "text-[#586e75]",
    titleColor: "text-[#586e75]",
    captionColor: "text-[#93a1a1]",
    description: "Warm solarized cream — gentler than white",
    pptxBg: "FAF6EE",
    pptxTitle: "586E75",
    pptxCaption: "93A1A1",
    pptxEditorBg: "FDF6E3",
  },
  {
    id: "nord-frost",
    name: "Nord Frost",
    className: "theme-nord-frost",
    bgClass: "bg-[#232831]",
    textColor: "text-[#d8dee9]",
    titleColor: "text-[#d8dee9]",
    captionColor: "text-[#88c0d0]",
    description: "Cool polar night blue and frost grey",
    pptxBg: "232831",
    pptxTitle: "D8DEE9",
    pptxCaption: "88C0D0",
    pptxEditorBg: "2E3440",
  },
  {
    id: "deep-space",
    name: "Deep Space",
    className: "theme-deep-space",
    bgClass: "bg-gradient-to-tr from-[#020208] via-[#090b1e] to-[#1a1333]",
    textColor: "text-indigo-200",
    titleColor: "text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-300 font-bold",
    captionColor: "text-purple-400/80",
    description: "Cosmic theme with rich indigo gradients",
    pptxBg: "090B1E",
    pptxTitle: "C6C8EB",
    pptxCaption: "A78BFA",
    pptxEditorBg: "070712",
  },
];
export default SLIDE_THEMES;
