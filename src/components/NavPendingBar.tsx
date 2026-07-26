"use client";

import { useLinkStatus } from "next/link";

/** <Link> 자손으로 렌더돼야 동작. pending일 때만 화면 최상단에 진행 바를 띄운다. */
export default function NavPendingBar() {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <span
      aria-hidden
      className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-[#7B2D8B] animate-pulse"
    />
  );
}
