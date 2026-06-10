"use client";

import { useRef, useState, useEffect } from "react";
import { markdownToHtml } from "@/lib/markdown";
import ImageUploader from "./ImageUploader";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [showImageModal, setShowImageModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosRef = useRef<number>(0);

  // 모달 닫힐 때 textarea 포커스 + 커서 위치 복원
  useEffect(() => {
    if (!showImageModal) {
      setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        const pos = cursorPosRef.current;
        el.setSelectionRange(pos, pos);
      }, 50);
    }
  }, [showImageModal]);

  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = value.slice(0, start) + text + value.slice(end);
    const newPos = start + text.length;
    cursorPosRef.current = newPos;
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    }, 0);
  }

  function insertFormatAtCursor(before: string, after = "") {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  function wrapLine(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", start);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(lineStart, end);
    const newLine = line.startsWith(prefix)
      ? line.slice(prefix.length)
      : prefix + line.replace(/^#+\s/, "");
    const newVal = value.slice(0, lineStart) + newLine + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
    }, 0);
  }

  const toolbarBtn =
    "px-2.5 py-1 text-xs font-mono text-gray-600 hover:bg-gray-100 rounded transition-colors";

  return (
    <>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* 탭 + 툴바 */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-1.5 gap-2 flex-wrap">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                tab === "write"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              작성
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                tab === "preview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              미리보기
            </button>
          </div>

          {tab === "write" && (
            <div className="flex items-center gap-0.5 flex-wrap">
              <button type="button" onClick={() => wrapLine("# ")} className={toolbarBtn} title="H1">H1</button>
              <button type="button" onClick={() => wrapLine("## ")} className={toolbarBtn} title="H2">H2</button>
              <button type="button" onClick={() => wrapLine("### ")} className={toolbarBtn} title="H3">H3</button>
              <span className="w-px h-4 bg-gray-200 mx-1" />
              <button type="button" onClick={() => insertFormatAtCursor("**", "**")} className={toolbarBtn} title="굵게"><strong>B</strong></button>
              <button type="button" onClick={() => insertFormatAtCursor("*", "*")} className={toolbarBtn} title="기울임"><em>I</em></button>
              <button type="button" onClick={() => insertFormatAtCursor("`", "`")} className={toolbarBtn} title="코드">{"<>"}</button>
              <span className="w-px h-4 bg-gray-200 mx-1" />
              <button type="button" onClick={() => insertAtCursor("\n- ")} className={toolbarBtn} title="목록">• 목록</button>
              <button type="button" onClick={() => insertFormatAtCursor("\n> ")} className={toolbarBtn} title="인용">❝</button>
              <span className="w-px h-4 bg-gray-200 mx-1" />
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className={`${toolbarBtn} flex items-center gap-1`}
                title="이미지 업로드"
              >
                🖼 이미지
              </button>
            </div>
          )}
        </div>

        {/* 에디터 / 미리보기 */}
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={22}
            placeholder={`# 제목\n\n## 소제목\n\n본문 내용을 입력하세요.\n\n- 목록 항목\n- 항목 2\n\n**굵게** *기울임* \`코드\``}
            className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y bg-white leading-relaxed"
          />
        ) : (
          <div
            className="min-h-[440px] px-6 py-4 bg-white"
            dangerouslySetInnerHTML={{
              __html: value
                ? markdownToHtml(value)
                : '<p class="text-gray-400 text-sm">미리볼 내용이 없습니다.</p>',
            }}
          />
        )}
      </div>

      {/* 이미지 업로드 + 블러 모달 */}
      {showImageModal && (
        <ImageUploader
          onInsert={(md) => insertAtCursor(md)}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
}
