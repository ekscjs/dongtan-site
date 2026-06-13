"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Props {
  onInsert: (markdownText: string) => void;
  onClose: () => void;
}

interface Rect { x: number; y: number; w: number; h: number; }

export default function ImageUploader({ onInsert, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [step, setStep] = useState<"pick" | "edit" | "uploading">("pick");
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [blockSize] = useState(20);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [alt, setAlt] = useState("");

  const loadFile = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = 660;
      const scale = img.width > maxW ? maxW / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      setCanvasSize({ w, h });
      setRects([]);
      setAlt("");
      setStep("edit");
    };
    img.src = url;
  }, []);

  // 캔버스에 이미지 다시 그리기
  const redraw = useCallback((currentRects: Rect[]) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const r of currentRects) applyMosaic(ctx, r, blockSize);
  }, [blockSize]);

  useEffect(() => {
    if (step === "edit") redraw(rects);
  }, [step, redraw]); // eslint-disable-line

  function applyMosaic(ctx: CanvasRenderingContext2D, rect: Rect, bs: number) {
    const { x, y, w, h } = rect;
    if (w <= 0 || h <= 0) return;
    const imageData = ctx.getImageData(x, y, w, h);
    const d = imageData.data;
    for (let py = 0; py < h; py += bs) {
      for (let px = 0; px < w; px += bs) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = 0; dy < bs && py + dy < h; dy++) {
          for (let dx = 0; dx < bs && px + dx < w; dx++) {
            const i = ((py + dy) * w + (px + dx)) * 4;
            r += d[i]; g += d[i+1]; b += d[i+2]; count++;
          }
        }
        r = Math.round(r/count); g = Math.round(g/count); b = Math.round(b/count);
        for (let dy = 0; dy < bs && py + dy < h; dy++) {
          for (let dx = 0; dx < bs && px + dx < w; dx++) {
            const i = ((py + dy) * w + (px + dx)) * 4;
            d[i] = r; d[i+1] = g; d[i+2] = b;
          }
        }
      }
    }
    ctx.putImageData(imageData, x, y);
  }

  function drawOverlay(rect: Rect | null) {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (rect) {
      ctx.strokeStyle = "#7B2D8B";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = "rgba(123,45,139,0.15)";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
  }

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const bounds = overlayRef.current!.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - bounds.left),
      y: Math.round(e.clientY - bounds.top),
    };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setStartPos(getPos(e));
    setDrawing(true);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const pos = getPos(e);
    drawOverlay({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
    });
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    setDrawing(false);
    const pos = getPos(e);
    const r: Rect = {
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
    };
    drawOverlay(null);
    if (r.w > 5 && r.h > 5) {
      const newRects = [...rects, r];
      setRects(newRects);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) applyMosaic(ctx, r, blockSize);
      }
    }
  }

  function handleUndo() {
    const newRects = rects.slice(0, -1);
    setRects(newRects);
    redraw(newRects);
  }

  async function handleUpload() {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    setStep("uploading");
    setError("");

    // canvas → blob
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.92)
    );

    const formData = new FormData();
    formData.append("file", blob, file.name.replace(/\.[^.]+$/, ".jpg"));

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onInsert(`\n![${alt.trim() || "이미지"}](${data.url})\n`);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "업로드 실패");
      setStep("edit");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">이미지 삽입</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="p-6">
          {step === "pick" && (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-12 cursor-pointer hover:border-[#7B2D8B] transition-colors">
              <span className="text-4xl">📷</span>
              <span className="text-sm font-semibold text-gray-600">클릭하여 이미지 선택</span>
              <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
              />
            </label>
          )}

          {step === "edit" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                블러 처리가 필요한 부분을 마우스로 드래그하세요. 없으면 바로 삽입하면 됩니다.
              </p>

              <div className="relative border border-gray-200 rounded-xl overflow-hidden" style={{ width: canvasSize.w }}>
                <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h} className="block" />
                <canvas
                  ref={overlayRef}
                  width={canvasSize.w}
                  height={canvasSize.h}
                  className="absolute inset-0 cursor-crosshair"
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={() => { setDrawing(false); drawOverlay(null); }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  대체텍스트(alt) <span className="font-normal text-gray-400">— 검색·접근성용. 사진 내용을 키워드로 설명</span>
                </label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="예: 복식호흡으로 허리 심부근육을 이완하는 자세"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7B2D8B]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  비워두면 alt가 &quot;이미지&quot;로 들어가 SEO 효과가 없어요. 허리통증·복식호흡·동탄 같은 키워드를 자연스럽게 넣어보세요.
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleUpload}
                  className="bg-[#7B2D8B] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#6a2678]"
                >
                  ✓ 업로드 & 삽입
                </button>
                {rects.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                  >
                    실행 취소
                  </button>
                )}
                <button
                  onClick={() => { setStep("pick"); setRects([]); }}
                  className="border border-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  다른 이미지 선택
                </button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {step === "uploading" && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-8 h-8 border-2 border-[#7B2D8B] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">업로드 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
