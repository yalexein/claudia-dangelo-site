export const sharedPagesNav = [
  { label: "Bio", path: "/bio/" },
  { label: "Uccelli", path: "/uccelli/" },
  { label: "Contatti", path: "/contatti/" },
  { label: "Link", path: "/link/" },
  { label: "Eventi", path: "/eventi/" },
  { label: "Blog", path: "/blog/" },
  { label: "Ispirazioni", path: "/ispirazioni/" },
  { label: "Immagini", path: "/immagini/" },
  { label: "Sketches", path: "/sketches/" },
  { label: "Collages", path: "/collages/" },
  { label: "Il vizio", path: "/il-vizio-della-scrittura/" },
  { label: "Scritture", path: "/scritture/" },
  { label: "Radio", path: "/radio/" },
];

export const sharedEditorPageDefaults = {
  bottomSpace: 1200,
  backgroundImgX: 0,
  backgroundImgY: 0,
  backgroundImgScale: 1,
  backgroundImgWidth: 560,
  backgroundImgOpacity: 1,
  backgroundImgScroll: false,
};

export const sharedEditorPageControls = [
  { key: "bottomSpace", type: "range", label: "Spazio verticale pagina", default: 1200, min: 0, max: 24000, step: 20, unit: "px", cssVar: "--uccelli-bottom-space" },
  { key: "backgroundImgX", type: "range", label: "Posizione sfondo X", default: 0, min: -1200, max: 1200, step: 1, unit: "px", cssVar: "--uccelli-bg-x" },
  { key: "backgroundImgY", type: "range", label: "Posizione sfondo Y", default: 0, min: -600, max: 800, step: 1, unit: "px", cssVar: "--uccelli-bg-y" },
  { key: "backgroundImgWidth", type: "range", label: "Larghezza sfondo", default: 560, min: 260, max: 1900, step: 1, unit: "px", cssVar: "--uccelli-bg-width" },
  { key: "backgroundImgScale", type: "range", label: "Scala sfondo", default: 1, min: 0.2, max: 2.5, step: 0.01, unit: "x", cssVar: "--uccelli-bg-scale" },
  { key: "backgroundImgOpacity", type: "range", label: "Opacità sfondo", default: 1, min: 0, max: 1, step: 0.01, unit: "", cssVar: "--uccelli-bg-opacity" },
  { key: "backgroundImgScroll", type: "toggle", label: "Sfondo scorre con pagina", default: false, cssVar: "--uccelli-bg-scroll", wide: true },
];
