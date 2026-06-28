import { useEffect, useRef, useState } from "react";
import { PaintBucket, RotateCcw, Trash2, Download, ChevronDown, ChevronUp } from "lucide-react";

export type ColoringPage = {
  id: string;
  title?: string;
  image_url: string;
};

const PALETTE = [
  "#ef4444", "#f87171", "#ec4899", "#f9a8d4",
  "#f97316", "#fb923c", "#facc15", "#fde68a",
  "#16a34a", "#4ade80", "#84cc16", "#bbf7d0",
  "#0284c7", "#38bdf8", "#06b6d4", "#a5f3fc",
  "#7c3aed", "#a855f7", "#c084fc", "#e9d5ff",
  "#92400e", "#b45309", "#d97706", "#fcd34d",
  "#111827", "#6b7280", "#d1d5db", "#ffffff",
];

const CANVAS_W = 880;
const CANVAS_H = 1100;
const MAX_HISTORY = 25;

const CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; overflow-x: hidden; }
  .reuti-app { min-height: 100vh; background: linear-gradient(160deg,#fdf4ff 0%,#f0f4ff 55%,#fff8f0 100%); font-family:'Fredoka','Heebo','Arial',sans-serif; direction:rtl; }
  .reuti-header { background:linear-gradient(135deg,#6d28d9 0%,#a855f7 55%,#ec4899 100%); padding:18px 20px 44px; text-align:center; position:relative; overflow:hidden; }
  .reuti-header h1 { margin:0; color:#fff; font-size:clamp(20px,5vw,32px); font-weight:700; text-shadow:0 2px 12px rgba(0,0,0,.25); }
  .reuti-header p  { margin:6px 0 0; color:rgba(255,255,255,.8); font-size:clamp(13px,3vw,15px); }
  .reuti-body { max-width:900px; margin:0 auto; padding:14px 12px 40px; }
  .reuti-card { background:#fff; border-radius:20px; padding:14px 16px; box-shadow:0 4px 24px rgba(124,58,237,.09); margin-bottom:14px; }
  .reuti-card h2 { margin:0 0 12px; font-size:14px; color:#7c3aed; font-weight:700; }

  /* page strip */
  .page-strip { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:thin; scrollbar-color:#e9d5ff transparent; }
  .page-btn { flex:0 0 auto; display:flex; flex-direction:column; align-items:center; gap:5px; border:3px solid #f3f4f6; border-radius:16px; padding:7px 5px; background:#fafafa; cursor:pointer; scroll-snap-align:start; transition:all .18s; }
  .page-btn.active { border-color:#7c3aed; background:#f5f3ff; box-shadow:0 4px 16px rgba(124,58,237,.28); transform:scale(1.05); }
  .page-btn img { height:64px; width:64px; object-fit:contain; border-radius:10px; display:block; }
  .page-btn span { font-size:10px; font-weight:600; color:#6b7280; max-width:64px; text-align:center; line-height:1.25; font-family:'Fredoka','Heebo',sans-serif; }
  .page-btn.active span { color:#7c3aed; }

  /* color palette */
  .palette { display:flex; flex-wrap:wrap; gap:8px; }
  .color-btn { width:40px; height:40px; border-radius:50%; border:3px solid #fff; cursor:pointer; transition:all .14s; box-shadow:0 2px 6px rgba(0,0,0,.18); }
  .color-btn.white { border:2px solid #d1d5db; }
  .color-btn.active { transform:scale(1.3); box-shadow:0 0 0 3px rgba(124,58,237,.35),0 4px 14px rgba(124,58,237,.4); border:4px solid #7c3aed; }
  .sel-color { margin-top:8px; display:flex; align-items:center; gap:8px; font-size:13px; color:#6b7280; }
  .sel-dot { width:26px; height:26px; border-radius:50%; border:2px solid #e5e7eb; box-shadow:0 2px 6px rgba(0,0,0,.15); flex-shrink:0; }

  /* toolbar */
  .toolbar { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:12px; }
  .tool-badge { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; border-radius:999px; padding:10px 16px; box-shadow:0 4px 14px rgba(124,58,237,.38); font-weight:700; font-size:14px; }
  .action-btn { display:flex; align-items:center; gap:6px; padding:10px 16px; border-radius:999px; border:none; font-weight:700; font-size:14px; cursor:pointer; font-family:'Fredoka','Heebo',sans-serif; transition:opacity .15s; min-height:44px; }
  .btn-undo   { background:#f3f4f6; color:#374151; box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .btn-clear  { background:#fee2e2; color:#dc2626; box-shadow:0 2px 8px rgba(220,38,38,.12); }
  .btn-save   { background:linear-gradient(135deg,#059669,#10b981); color:#fff; box-shadow:0 4px 14px rgba(5,150,105,.35); }

  /* canvas */
  .canvas-wrap { position:relative; margin:0 auto; overflow:hidden; border-radius:20px; border:3px dashed #e9d5ff; background:#fff; touch-action:none; box-shadow:0 8px 40px rgba(124,58,237,.12),0 2px 8px rgba(0,0,0,.08); }
  .canvas-wrap canvas { position:absolute; inset:0; width:100%; height:100%; }
  .canvas-hint { text-align:center; margin-top:10px; color:#a78bfa; font-size:14px; font-weight:600; }

  /* mobile adjustments */
  @media (max-width: 480px) {
    .reuti-header { padding:14px 16px 36px; }
    .reuti-body { padding:10px 8px 32px; }
    .reuti-card { padding:12px 12px; border-radius:16px; margin-bottom:10px; }
    .color-btn { width:36px; height:36px; }
    .color-btn.active { transform:scale(1.25); }
    .palette { gap:6px; }
    .action-btn { padding:9px 12px; font-size:13px; }
    .page-btn img { height:54px; width:54px; }
    .toolbar { gap:6px; }
  }
  @media (max-width: 360px) {
    .color-btn { width:32px; height:32px; }
    .action-btn { padding:8px 10px; font-size:12px; gap:4px; }
  }
`;

export function ColoringReader({ pages }: { pages: ColoringPage[] }) {
  const [pageIdx, setPageIdx] = useState(0);
  const [color, setColor] = useState("#ef4444");
  const [pagesOpen, setPagesOpen] = useState(true);

  const paintRef = useRef<HTMLCanvasElement | null>(null);
  const artRef   = useRef<HTMLCanvasElement | null>(null);
  const barrierRef = useRef<Uint8Array | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const filling = useRef(false);

  const page = pages[pageIdx];

  // inject font + CSS
  useEffect(() => {
    const styleId = "reuti-styles";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    const fontId = "reuti-font";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id   = fontId;
      link.rel  = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // load page art
  useEffect(() => {
    if (!page) return;
    const paint = paintRef.current;
    const art   = artRef.current;
    if (!paint || !art) return;
    const pctx = paint.getContext("2d")!;
    const actx = art.getContext("2d", { willReadFrequently: true })!;
    pctx.fillStyle = "#ffffff";
    pctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    actx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    historyRef.current = [];

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ratio = Math.min(CANVAS_W / img.width, CANVAS_H / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      actx.drawImage(img, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
      const data = actx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
      const mask = new Uint8Array(CANVAS_W * CANVAS_H);
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        if (data[i + 3] < 16) { mask[p] = 0; continue; }
        mask[p] = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) < 120 ? 1 : 0;
      }
      barrierRef.current = mask;
    };
    img.src = page.image_url;
  }, [page?.id, page?.image_url]);

  function saveHistory() {
    const pctx = paintRef.current!.getContext("2d", { willReadFrequently: true })!;
    const snap = pctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    historyRef.current.push(snap);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
  }

  function undo() {
    if (!historyRef.current.length) return;
    paintRef.current!.getContext("2d")!.putImageData(historyRef.current.pop()!, 0, 0);
  }

  function getPos(ev: React.PointerEvent<HTMLCanvasElement>) {
    const c = paintRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((ev.clientX - rect.left) / rect.width)  * CANVAS_W,
      y: ((ev.clientY - rect.top)  / rect.height) * CANVAS_H,
    };
  }

  function floodFill(start: { x: number; y: number }) {
    if (filling.current) return;
    const pctx = paintRef.current!.getContext("2d", { willReadFrequently: true })!;
    const barrier = barrierRef.current;
    if (!barrier) return;
    const x0 = Math.floor(start.x), y0 = Math.floor(start.y);
    if (x0 < 0 || y0 < 0 || x0 >= CANVAS_W || y0 >= CANVAS_H) return;
    const startIdx = y0 * CANVAS_W + x0;
    if (barrier[startIdx]) return;

    saveHistory();
    filling.current = true;

    const imgData = pctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const data = imgData.data;
    const bR = data[startIdx * 4], bG = data[startIdx * 4 + 1], bB = data[startIdx * 4 + 2];
    const target = hexToRgb(color);
    if (target.r === bR && target.g === bG && target.b === bB) { filling.current = false; return; }

    const tol = 30;
    const visited = new Uint8Array(CANVAS_W * CANVAS_H);
    const stack: number[] = [startIdx];
    while (stack.length) {
      const idx = stack.pop()!;
      if (visited[idx]) continue;
      visited[idx] = 1;
      if (barrier[idx]) continue;
      const off = idx * 4;
      if (Math.abs(data[off]-bR)>tol || Math.abs(data[off+1]-bG)>tol || Math.abs(data[off+2]-bB)>tol) continue;
      data[off]=target.r; data[off+1]=target.g; data[off+2]=target.b; data[off+3]=255;
      const x = idx % CANVAS_W, y = (idx - x) / CANVAS_W;
      if (x > 0)             stack.push(idx - 1);
      if (x < CANVAS_W - 1)  stack.push(idx + 1);
      if (y > 0)             stack.push(idx - CANVAS_W);
      if (y < CANVAS_H - 1)  stack.push(idx + CANVAS_W);
    }
    pctx.putImageData(imgData, 0, 0);
    filling.current = false;
  }

  function onPointerDown(ev: React.PointerEvent<HTMLCanvasElement>) {
    ev.preventDefault();
    (ev.target as HTMLCanvasElement).setPointerCapture(ev.pointerId);
    floodFill(getPos(ev));
  }

  function clearAll() {
    saveHistory();
    const pctx = paintRef.current!.getContext("2d")!;
    pctx.fillStyle = "#ffffff";
    pctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  function download() {
    const out = document.createElement("canvas");
    out.width = CANVAS_W; out.height = CANVAS_H;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(paintRef.current!, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(artRef.current!, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = `reuti-coloring-${pageIdx + 1}.png`;
    a.click();
  }

  if (!pages.length) return null;

  return (
    <div className="reuti-app">

      {/* ═══ HEADER ═══ */}
      <div className="reuti-header">
        <span style={{ position:"absolute", top:10, right:20, fontSize:26, opacity:.5 }}>⭐</span>
        <span style={{ position:"absolute", top:14, left:32, fontSize:20, opacity:.45 }}>✨</span>
        <span style={{ position:"absolute", bottom:20, right:80, fontSize:16, opacity:.35 }}>🌟</span>
        <span style={{ position:"absolute", bottom:16, left:60, fontSize:22, opacity:.4 }}>⭐</span>
        <h1>חוברת הצביעה של רעותי 🎨</h1>
        <p>בחר/י ציור, בחר/י צבע, ולחץ/י לצבוע!</p>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none"
          style={{ position:"absolute", bottom:-1, left:0, width:"100%", height:40, display:"block" }}>
          <path fill="#fdf4ff" d="M0,20 C240,40 480,0 720,20 C960,40 1200,8 1440,20 L1440,40 L0,40 Z" />
        </svg>
      </div>

      <div className="reuti-body">

        {/* ═══ PAGE SELECTOR ═══ */}
        <div className="reuti-card">
          <button
            onClick={() => setPagesOpen(o => !o)}
            style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h2 style={{ margin:0 }}>🖼️ {page?.title ?? `ציור ${pageIdx + 1}`} &nbsp;({pageIdx + 1}/{pages.length})</h2>
            {pagesOpen ? <ChevronUp size={18} color="#7c3aed" /> : <ChevronDown size={18} color="#7c3aed" />}
          </button>

          {pagesOpen && (
            <div className="page-strip" style={{ marginTop:10 }}>
              {pages.map((p, i) => (
                <button key={p.id} className={`page-btn${i === pageIdx ? " active" : ""}`}
                  onClick={() => { setPageIdx(i); setPagesOpen(false); }}>
                  <img src={p.image_url} alt={p.title ?? `ציור ${i + 1}`} />
                  <span>{p.title ?? `ציור ${i + 1}`}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ CANVAS ═══ */}
        <div className="reuti-card">
          {/* toolbar */}
          <div className="toolbar">
            <div className="tool-badge">
              <PaintBucket size={16} />
              מילוי
              <div style={{ width:20, height:20, borderRadius:"50%", background:color, border:"2px solid rgba(255,255,255,.7)", flexShrink:0 }} />
            </div>
            <button className="action-btn btn-undo" onClick={undo}>
              <RotateCcw size={15} /> בטל
            </button>
            <button className="action-btn btn-clear" onClick={clearAll}>
              <Trash2 size={15} /> נקה
            </button>
            <button className="action-btn btn-save" onClick={download}>
              <Download size={15} /> שמור 💾
            </button>
          </div>

          {/* canvas */}
          <div className="canvas-wrap" style={{ aspectRatio:`${CANVAS_W}/${CANVAS_H}`, maxWidth:640, touchAction:"none" }}>
            <canvas ref={paintRef} width={CANVAS_W} height={CANVAS_H}
              style={{ cursor:"crosshair", touchAction:"none" }}
              onPointerDown={onPointerDown} />
            <canvas ref={artRef} width={CANVAS_W} height={CANVAS_H}
              style={{ pointerEvents:"none", mixBlendMode:"multiply" }} />
          </div>
          <p className="canvas-hint">לחצ/י על אזור בציור כדי לצבוע! 🖌️</p>
        </div>

        {/* ═══ PALETTE ═══ */}
        <div className="reuti-card">
          <h2>🌈 בחר/י צבע</h2>
          <div className="palette">
            {PALETTE.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`color-btn${c === color ? " active" : ""}${c === "#ffffff" ? " white" : ""}`}
                style={{ background: c }}
                title={c === "#ffffff" ? "לבן / מחיקה" : c}
              />
            ))}
          </div>
          <div className="sel-color">
            <div className="sel-dot" style={{ background: color }} />
            <span>{color === "#ffffff" ? "לבן (מחיקה)" : "צבע נבחר"}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}
