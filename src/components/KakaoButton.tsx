"use client";

interface KakaoButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function KakaoButton({ className, children }: KakaoButtonProps) {
  const handleClick = () => {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "kakao_chat_click", {
        event_category: "engagement",
        event_label: "카카오 상담 버튼",
      });
    }
  };

  return (
    <a
      href="http://pf.kakao.com/_XGxbMG/chat"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
