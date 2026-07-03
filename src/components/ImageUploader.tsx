"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Props {
  onInsert: (markdownText: string) => void;
  onClose: () => void;
  initialFile?: File;
  initialUrl?: string;
  initialAlt?: string;
  mode?: "single" | "pair";
}

interface Rect { x: number; y: number; w: number; h: number; }

export default function ImageUploader({ onInsert, onClose, initialFile, initialUrl, initialAlt, mode = "single" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLCanvasElement | null>(null); // 현재 편집 기준 이미지(표시 스케일)
  const [step, setStep] = useState<"pick" | "edit" | "uploading">("pick");
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [tool, setTool] = useState<"mosaic" | "crop">("mosaic");
  const [rects, setRects] = useState<Rect[]>([]);
  const [pendingCrop, setPendingCrop] = useState<Rect | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [blockSize] = useState(20);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [alt, setAlt] = useState("");
  const [seoFilename, setSeoFilename] = useState("");
  // pair 모드 전용
  const [pairStage, setPairStage] = useState<1 | 2>(1);
  const [firstUrl, setFirstUrl] = useState("");
  const [firstAlt, setFirstAlt] = useState("");

  useEffect(() => {
    console.log("[img-uploader] mount, initialFile:", initialFile?.name, "initialUrl:", initialUrl);
    if (initialFile) loadFile(initialFile);
    else if (initialUrl) loadUrl(initialUrl, initialAlt || "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 원본 이미지 → base 캔버스(표시 스케일)로 세팅
  function setupBase(img: HTMLImageElement) {
    const maxW = 660;
    const scale = img.width > maxW ? maxW / img.width : 1;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const base = document.createElement("canvas");
    base.width = w; base.height = h;
    base.getContext("2d")!.drawImage(img, 0, 0, w, h);
    baseRef.current = base;
    setRects([]);
    setPendingCrop(null);
    setTool("mosaic");
    setCanvasSize({ w, h });
    setStep("edit");
  }

  const loadFile = useCallback((f: File) => {
    console.log("[img-uploader] loadFile called:", f.name, f.type, f.size);
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      console.log("[img-uploader] img.onload fired, natural size:", img.width, img.height);
      setupBase(img);
      setAlt("생성 중...");
      // AI로 alt 자동 생성 — 원본 대신 편집용으로 리사이즈된(최대 660px) 이미지를 보내서
      // 실제 카메라 사진(수 MB)에서도 빠르고 안정적으로 응답받게 함
      const sendForAlt = (blob: Blob) => {
        console.log("[img-uploader] sending to generate-alt, blob size:", blob.size);
        const fd = new FormData();
        fd.append("file", blob, "resized.jpg");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        fetch("/api/admin/generate-alt", { method: "POST", body: fd, signal: controller.signal })
          .then((r) => r.json())
          .then((data) => {
            console.log("[img-uploader] generate-alt response:", data);
            if (data.alt) setAlt(data.alt);
            if (data.filename) setSeoFilename(data.filename);
            if (!data.alt) setAlt("");
          })
          .catch((err) => { console.log("[img-uploader] generate-alt FAILED:", err); setAlt(""); })
          .finally(() => clearTimeout(timeout));
      };
      const base = baseRef.current;
      if (base) {
        base.toBlob((b) => (b ? sendForAlt(b) : sendForAlt(f)), "image/jpeg", 0.85);
      } else {
        sendForAlt(f);
      }
    };
    img.onerror = (err) => {
      console.log("[img-uploader] img.onload ERROR — image failed to decode:", err);
    };
    img.src = url;
  }, []);

  // 이미 업로드된 이미지(URL)를 다시 불러와 편집
  const loadUrl = useCallback((url: string, altText: string) => {
    setFile(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setupBase(img);
      setAlt(altText);
      setSeoFilename("");
    };
    img.onerror = () => {
      setError("이미지를 불러올 수 없습니다. URL을 확인해주세요.");
      setStep("pick");
    };
    img.src = url;
  }, []);

  // base + 모자이크 다시 그리기
  const redraw = useCallback((currentRects: Rect[]) => {
    const canvas = canvasRef.current;
    const base = baseRef.current;
    if (!canvas || !base) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(base, 0, 0);
    for (const r of currentRects) applyMosaic(ctx, r, blockSize);
  }, [blockSize]);

  // canvasSize/step 바뀔 때(로드·크롭·회전) 기준 이미지 다시 그림
  useEffect(() => {
    if (step === "edit") redraw(rects);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, step]);

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
      const isCrop = tool === "crop";
      ctx.strokeStyle = isCrop ? "#16a34a" : "#7B2D8B";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = isCrop ? "rgba(22,163,74,0.12)" : "rgba(123,45,139,0.15)";
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
    if (r.w <= 5 || r.h <= 5) { drawOverlay(null); return; }

    if (tool === "crop") {
      setPendingCrop(r);
      drawOverlay(r); // 선택 영역 유지 표시
    } else {
      drawOverlay(null);
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

  // 회전 90°
  function handleRotate() {
    const base = baseRef.current;
    if (!base) return;
    const nc = document.createElement("canvas");
    nc.width = base.height;
    nc.height = base.width;
    const ctx = nc.getContext("2d")!;
    ctx.translate(nc.width / 2, nc.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(base, -base.width / 2, -base.height / 2);
    baseRef.current = nc;
    setRects([]);
    setPendingCrop(null);
    drawOverlay(null);
    setCanvasSize({ w: nc.width, h: nc.height });
  }

  // 크롭 적용
  function handleApplyCrop() {
    const base = baseRef.current;
    if (!base || !pendingCrop) return;
    const x = Math.max(0, Math.min(pendingCrop.x, base.width));
    const y = Math.max(0, Math.min(pendingCrop.y, base.height));
    const w = Math.min(pendingCrop.w, base.width - x);
    const h = Math.min(pendingCrop.h, base.height - y);
    if (w < 10 || h < 10) { setPendingCrop(null); drawOverlay(null); return; }
    const nc = document.createElement("canvas");
    nc.width = w; nc.height = h;
    nc.getContext("2d")!.drawImage(base, x, y, w, h, 0, 0, w, h);
    baseRef.current = nc;
    setRects([]);
    setPendingCrop(null);
    drawOverlay(null);
    setCanvasSize({ w, h });
  }

  function handleCancelCrop() {
    setPendingCrop(null);
    drawOverlay(null);
  }

  async function handleUpload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setStep("uploading");
    setError("");

    // canvas → blob
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.92)
    );

    const formData = new FormData();
    const uploadName = seoFilename
      ? `${seoFilename}.jpg`
      : file ? file.name.replace(/\.[^.]+$/, ".jpg") : `image-${Date.now()}.jpg`;
    formData.append("file", blob, uploadName);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (mode === "pair" && pairStage === 1) {
        setFirstUrl(data.url);
        setFirstAlt(alt.trim() || "이미지");
        setPairStage(2);
        setStep("pick");
        setRects([]);
        setPendingCrop(null);
        setFile(null);
        setAlt("");
        setSeoFilename("");
        baseRef.current = null;
      } else if (mode === "pair" && pairStage === 2) {
        const a1 = firstAlt;
        const u1 = firstUrl;
        const a2 = alt.trim() || "이미지";
        const u2 = data.url;
        onInsert(`\n<grid>\n![${a1}](${u1})\n![${a2}](${u2})\n</grid>\n`);
        onClose();
      } else {
        onInsert(`\n![${alt.trim() || "이미지"}](${data.url})\n`);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "업로드 실패");
      setStep("edit");
    }
  }

  const toolBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
      active ? "bg-[#7B2D8B] text-white border-[#7B2D8B]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {mode === "pair"
              ? pairStage === 1 ? "나란히 이미지 — 1번째" : "나란히 이미지 — 2번째"
              : initialUrl ? "이미지 수정" : "이미지 삽입"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="p-6">
          {step === "pick" && (
            <label
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-12 cursor-pointer hover:border-[#7B2D8B] transition-colors"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[#7B2D8B]", "bg-purple-50"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("border-[#7B2D8B]", "bg-purple-50"); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-[#7B2D8B]", "bg-purple-50");
                const f = e.dataTransfer.files?.[0];
                if (f && f.type.startsWith("image/")) loadFile(f);
              }}
            >
              <span className="text-4xl">📷</span>
              <span className="text-sm font-semibold text-gray-600">클릭하거나 이미지를 여기에 끌어다 놓으세요</span>
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
              {/* 도구 툴바 */}
              <div className="flex items-center gap-2 flex-wrap">
                <button type="button" onClick={() => { setTool("mosaic"); handleCancelCrop(); }} className={toolBtn(tool === "mosaic")}>🔲 모자이크</button>
                <button type="button" onClick={() => setTool("crop")} className={toolBtn(tool === "crop")}>✂ 자르기</button>
                <button type="button" onClick={handleRotate} className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">↻ 회전</button>
                {tool === "mosaic" && rects.length > 0 && (
                  <button type="button" onClick={handleUndo} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-50">모자이크 취소</button>
                )}
              </div>

              <p className="text-xs text-gray-400">
                {tool === "crop"
                  ? "남길 부분을 드래그로 선택한 뒤 '이 영역으로 자르기'를 누르세요."
                  : "얼굴 등 가릴 부분을 마우스로 드래그하세요. 없으면 바로 삽입하면 됩니다."}
              </p>

              <div className="relative border border-gray-200 rounded-xl overflow-hidden" style={{ width: canvasSize.w }}>
                <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h} className="block" />
                <canvas
                  ref={overlayRef}
                  width={canvasSize.w}
                  height={canvasSize.h}
                  className={`absolute inset-0 ${tool === "crop" ? "cursor-crosshair" : "cursor-crosshair"}`}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={() => { if (tool === "mosaic") { setDrawing(false); drawOverlay(null); } }}
                />
              </div>

              {tool === "crop" && pendingCrop && (
                <div className="flex gap-2">
                  <button onClick={handleApplyCrop} className="bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#15803d]">✂ 이 영역으로 자르기</button>
                  <button onClick={handleCancelCrop} className="border border-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">선택 취소</button>
                </div>
              )}

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
                  {mode === "pair" && pairStage === 1
                    ? "다음 →"
                    : mode === "pair" && pairStage === 2
                    ? "✓ 나란히 삽입"
                    : initialUrl ? "✓ 수정 완료" : "✓ 업로드 & 삽입"}
                </button>
                <button
                  onClick={() => { setStep("pick"); setRects([]); setPendingCrop(null); baseRef.current = null; }}
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
