"use client";

/**
 * 막대 채우기는 width(레이아웃 속성)가 아니라 transform: scaleX로 애니메이션한다.
 * 박스 크기(width%)는 마운트 시 한 번만 최종값으로 고정해서 리플로우가 반복되지 않게 하고,
 * 실제 "채워지는" 움직임은 GPU 합성만 타는 transform으로 처리해 스크롤 중 버벅임을 없앤다.
 */
export default function MeterBar({ pct, revealed }: { pct: number; revealed: boolean }) {
  return (
    <div className="w-full h-2 rounded-full bg-[#f0e4f3] overflow-hidden">
      <div
        className="h-full rounded-full bg-[#7B2D8B] origin-left transition-transform duration-700 ease-out"
        style={{ width: `${pct}%`, transform: revealed ? "scaleX(1)" : "scaleX(0)" }}
      />
    </div>
  );
}
