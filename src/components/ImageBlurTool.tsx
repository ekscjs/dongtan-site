"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ImageBlurTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<Rect | null>(null);
  const [blockSize, setBlockSize] = useState(20);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const loadImageFromSrc = useCallback((src: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const maxW = 700;
      const scale = img.width > maxW ? maxW / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      setCanvasSize({ w, h });
      setImgLoaded(true);
      setRects([]);
    };
    img.onerror = () => alert("이미지를 불러올 수 없습니다. URL을 확인하거나 파일로 업로드하세요.");
    img.src = src;
  }, []);

  // 캔버스에 이미지 + 블러 영역 그리기
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 적용된 모자이크
    for (const rect of rects) {
      applyMosaicToCtx(ctx, rect, blockSize);
    }
  }, [rects, blockSize]);

  useEffect(() => {
    if (imgLoaded) redraw();
  }, [imgLoaded, redraw]);

  // 오버레이 캔버스: 드래그 중인 선택 박스
  const drawOverlay = useCallback((rect: Rect | null) => {
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
  }, []);

  function applyMosaicToCtx(ctx: CanvasRenderingContext2D, rect: Rect, bs: number) {
    const { x, y, w, h } = rect;
    if (w <= 0 || h <= 0) return;
    const imageData = ctx.getImageData(x, y, w, h);
    const data = imageData.data;
    for (let py = 0; py < h; py += bs) {
      for (let px = 0; px < w; px += bs) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = 0; dy < bs && py + dy < h; dy++) {
          for (let dx = 0; dx < bs && px + dx < w; dx++) {
            const i = ((py + dy) * w + (px + dx)) * 4;
            r += data[i]; g += data[i + 1]; b += data[i + 2];
            count++;
          }
        }
        r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
        for (let dy = 0; dy < bs && py + dy < h; dy++) {
          for (let dx = 0; dx < bs && px + dx < w; dx++) {
            const i = ((py + dy) * w + (px + dx)) * 4;
            data[i] = r; data[i + 1] = g; data[i + 2] = b;
          }
        }
      }
    }
    ctx.putImageData(imageData, x, y);
  }

  function getPos(e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = overlayRef.current!.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    };
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const pos = getPos(e);
    setStartPos(pos);
    setDrawing(true);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const pos = getPos(e);
    const r: Rect = {
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
    };
    setCurrentRect(r);
    drawOverlay(r);
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
    setCurrentRect(null);
    if (r.w > 5 && r.h > 5) {
      setRects((prev) => [...prev, r]);
      // 바로 적용
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) applyMosaicToCtx(ctx, r, blockSize);
      }
    }
  }

  function handleUndo() {
    if (rects.length === 0) return;
    const newRects = rects.slice(0, -1);
    setRects(newRects);
    // 전체 재렌더
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const rect of newRects) {
      applyMosaicToCtx(ctx, rect, blockSize);
    }
  }

  function handleReset() {
    setRects([]);
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "blurred_image.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    loadImageFromSrc(url);
  }

  function handleUrlLoad() {
    if (!inputUrl.trim()) return;
    setImgSrc(inputUrl.trim());
    loadImageFromSrc(inputUrl.trim());
  }

  return (
    <div className="space-y-4">
      {/* 이미지 불러오기 */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">이미지 불러오기</p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="이미지 URL 입력 (예: /블로그1.jpg)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlLoad()}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7B2D8B]"
          />
          <button
            onClick={handleUrlLoad}
            className="bg-[#7B2D8B] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#6a2678]"
          >
            불러오기
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>또는</span>
          <label className="cursor-pointer text-[#7B2D8B] font-semibold hover:underline">
            파일 선택
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* 옵션 */}
      {imgLoaded && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <label className="flex items-center gap-2">
            모자이크 크기:
            <input
              type="range"
              min={8}
              max={40}
              step={4}
              value={blockSize}
              onChange={(e) => setBlockSize(Number(e.target.value))}
              className="w-24 accent-[#7B2D8B]"
            />
            <span className="text-xs text-gray-400 w-8">{blockSize}px</span>
          </label>
        </div>
      )}

      {/* 안내 */}
      {imgLoaded && (
        <p className="text-xs text-gray-400">
          마우스로 드래그하여 블러 처리할 영역을 선택하세요. 여러 번 선택 가능합니다.
        </p>
      )}

      {/* 캔버스 */}
      {imgLoaded && (
        <div
          className="relative border border-gray-200 rounded-xl overflow-hidden"
          style={{ width: canvasSize.w, maxWidth: "100%" }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            className="block"
          />
          <canvas
            ref={overlayRef}
            width={canvasSize.w}
            height={canvasSize.h}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => {
              if (drawing) {
                setDrawing(false);
                drawOverlay(null);
              }
            }}
          />
        </div>
      )}

      {/* 버튼 */}
      {imgLoaded && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDownload}
            className="bg-[#7B2D8B] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#6a2678]"
          >
            💾 완성 이미지 다운로드
          </button>
          <button
            onClick={handleUndo}
            disabled={rects.length === 0}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            실행 취소
          </button>
          <button
            onClick={handleReset}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            초기화
          </button>
        </div>
      )}

      {imgLoaded && (
        <p className="text-xs text-gray-400">
          다운로드된 이미지를 <code className="bg-gray-100 px-1 rounded">public/</code> 폴더에 덮어씌운 후 git push 하세요.
        </p>
      )}
    </div>
  );
}
