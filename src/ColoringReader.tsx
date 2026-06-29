import { useEffect, useRef, useState } from "react";
import { PaintBucket, RotateCcw, Trash2, Download, ChevronDown, ChevronUp } from "lucide-react";

export type ColoringPage = {
  id: string;
  title?: string;
  image_url: string;
};

// ב-RTL, index 0 מוצג בפינה הימנית → אדום בימין, לבן בשמאל
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

  .reuti-app {
    min-height: 100vh;
    background: linear-gradient(160deg, #fdf4ff 0%, #f0f4ff 55%, #fff8f0 100%);
    font-family: 'Fredoka', 'Heebo', 'Arial Rounded MT Bold', Arial, sans-serif;
    direction: rtl;
  }

  /* ── Header ── */
  .reuti-header {
    background: linear-gradient(135deg, #5b21b6 0%, #9333ea 50%, #db2777 100%);
    padding: 20px 24px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .reuti-header h1 {
    margin: 0;
    color: #fff;
    font-size: clamp(22px, 6vw, 36px);
    font-weight: 700;
    letter-spacing: 0.5px;
    text-shadow: 0 3px 16px rgba(0,0,0,.3);
    line-height: 1.2;
  }
  .reuti-header p {
    margin: 8px 0 0;
    color: rgba(255,255,255,.85);
    font-size: clamp(14px, 3.5vw, 17px);
    font-weight: 400;
    letter-spacing: 0.2px;
  }

  /* ── Body ── */
  .reuti-body { max-width: 900px; margin: 0 auto; padding: 16px 14px 48px; }

  /* ── Card ── */
  .reuti-card {
    background: #fff;
    border-radius: 22px;
    padding: 16px 18px;
    box-shadow: 0 4px 28px rgba(124,58,237,.1), 0 1px 4px rgba(0,0,0,.04);
    margin-bottom: 16px;
  }
  .reuti-card h2 {
    margin: 0 0 14px;
    font-size: 17px;
    font-weight: 700;
    color: #6d28d9;
    letter-spacing: 0.2px;
  }

  /* ── Page strip ── */
  .page-strip {
    display: flex; gap: 10px; overflow-x: auto;
    padding-bottom: 6px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #e9d5ff transparent;
  }
  .page-btn {
    flex: 0 0 auto;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    border: 3px solid #f3f4f6; border-radius: 16px; padding: 8px 6px;
    background: #fafafa; cursor: pointer;
    scroll-snap-align: start;
    transition: all .18s;
  }
  .page-btn.active {
    border-color: #7c3aed; background: #f5f3ff;
    box-shadow: 0 4px 18px rgba(124,58,237,.28);
    transform: scale(1.06);
  }
  .page-btn img { height: 66px; width: 66px; object-fit: contain; border-radius: 10px; display: block; }
  .page-btn span {
    font-size: 11px; font-weight: 700; color: #9ca3af;
    max-width: 68px; text-align: center; line-height: 1.3;
    font-family: 'Fredoka', 'Heebo', sans-serif;
  }
  .page-btn.active span { color: #7c3aed; }

  /* ── Palette ── */
  .palette { display: flex; flex-wrap: wrap; gap: 9px; }
  .color-btn {
    width: 42px; height: 42px; border-radius: 50%;
    border: 3px solid #fff; cursor: pointer;
    transition: all .14s;
    box-shadow: 0 2px 6px rgba(0,0,0,.2);
  }
  .color-btn.is-white { border: 2px solid #d1d5db; }
  .color-btn.active {
    transform: scale(1.3);
    box-shadow: 0 0 0 3px rgba(124,58,237,.4), 0 4px 16px rgba(124,58,237,.4);
    border: 4px solid #7c3aed;
  }
  .sel-color { margin-top: 10px; display: flex; align-items: center; gap: 10px; }
  .sel-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #e5e7eb; box-shadow: 0 2px 6px rgba(0,0,0,.15); flex-shrink: 0; }
  .sel-label {
    font-size: 14px; font-weight: 600; color: #6d28d9;
    background: #f5f3ff; padding: 4px 12px; border-radius: 999px;
  }

  /* ── Toolbar ── */
  .toolbar { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 14px; }
  .tool-badge {
    display: flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, #6d28d9, #a855f7);
    color: #fff; border-radius: 999px; padding: 11px 20px;
    box-shadow: 0 4px 16px rgba(109,40,217,.4);
    font-weight: 700; font-size: 15px;
    letter-spacing: 0.3px;
  }
  .action-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 11px 18px; border-radius: 999px; border: none;
    font-weight: 700; font-size: 15px; cursor: pointer;
    font-family: 'Fredoka', 'Heebo', sans-serif;
    letter-spacing: 0.2px;
    transition: opacity .15s, transform .1s;
    min-height: 46px;
  }
  .action-btn:active { transform: scale(.96); }
  .btn-undo  { background: #f3f4f6; color: #374151; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .btn-clear { background: #fee2e2; color: #b91c1c; box-shadow: 0 2px 8px rgba(185,28,28,.12); }
  .btn-save  { background: linear-gradient(135deg, #059669, #10b981); color: #fff; box-shadow: 0 4px 16px rgba(5,150,105,.38); }

  /* ── Canvas ── */
  .canvas-wrap {
    position: relative; margin: 0 auto; overflow: hidden;
    border-radius: 20px; border: 3px dashed #ddd6fe;
    background: #fff; touch-action: none;
    box-shadow: 0 8px 40px rgba(124,58,237,.1), 0 2px 8px rgba(0,0,0,.06);
  }
  .canvas-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .canvas-hint {
    text-align: center; margin-top: 12px;
    color: #8b5cf6; font-size: 15px; font-weight: 600;
    letter-spacing: 0.2px;
  }

  /* ── Mobile ── */
  @media (max-width: 480px) {
    .reuti-header { padding: 16px 16px 40px; }
    .reuti-body { padding: 12px 10px 36px; }
    .reuti-card { padding: 14px 14px; border-radius: 18px; margin-bottom: 12px; }
    .reuti-card h2 { font-size: 15px; margin-bottom: 12px; }
    .color-btn { width: 36px; height: 36px; }
    .color-btn.active { transform: scale(1.22); }
    .palette { gap: 7px; }
    .action-btn { padding: 10px 14px; font-size: 13px; min-height: 44px; }
    .tool-badge { padding: 10px 14px; font-size: 13px; }
    .page-btn img { height: 56px; width: 56px; }
    .toolbar { gap: 7px; }
    .canvas-hint { font-size: 14px; }
  }
  @media (max-width: 360px) {
    .color-btn { width: 32px; height: 32px; }
    .action-btn { padding: 9px 12px; font-size: 12px; gap: 4px; }
    .tool-badge { padding: 9px 12px; font-size: 12px; }
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
      // מסגרת שחורה שמונעת דלף צבע לקצוות הקנבס
      actx.strokeStyle = "#000000";
      actx.lineWidth = 12;
      actx.strokeRect(6, 6, CANVAS_W - 12, CANVAS_H - 12);
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
                className={`color-btn${c === color ? " active" : ""}${c === "#ffffff" ? " is-white" : ""}`}
                style={{ background: c }}
                title={c === "#ffffff" ? "לבן / מחיקה" : c}
              />
            ))}
          </div>
          <div className="sel-color">
            <div className="sel-dot" style={{ background: color }} />
            <span className="sel-label">{color === "#ffffff" ? "לבן — מחיקה" : "צבע נבחר"}</span>
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
