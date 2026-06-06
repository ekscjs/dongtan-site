export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inParagraph = false;
  let i = 0;

  function closeParagraph() {
    if (inParagraph) {
      out.push("</p>");
      inParagraph = false;
    }
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-6 w-full" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#7B2D8B] underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  }

  while (i < lines.length) {
    const line = lines[i];

    // 코드 블록
    if (line.startsWith("```")) {
      closeParagraph();
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        i++;
      }
      out.push(`<pre class="bg-gray-900 text-gray-100 rounded-xl p-4 my-6 overflow-x-auto text-sm font-mono leading-relaxed"${lang ? ` data-lang="${lang}"` : ""}><code>${codeLines.join("\n")}</code></pre>`);
      i++;
      continue;
    }

    // 제목
    if (line.startsWith("### ")) {
      closeParagraph();
      out.push(`<h3 class="text-xl font-bold text-gray-900 mt-10 mb-3">${inlineFormat(line.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      closeParagraph();
      out.push(`<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-4">${inlineFormat(line.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      closeParagraph();
      out.push(`<h1 class="text-3xl font-bold text-gray-900 mt-14 mb-5">${inlineFormat(line.slice(2))}</h1>`);
      i++;
      continue;
    }

    // 수평선
    if (/^---+$/.test(line.trim())) {
      closeParagraph();
      out.push('<hr class="border-gray-200 my-10" />');
      i++;
      continue;
    }

    // 순서 없는 목록
    if (line.startsWith("- ") || line.startsWith("* ")) {
      closeParagraph();
      out.push('<ul class="list-disc list-inside space-y-1.5 my-4 text-gray-700">');
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        out.push(`<li>${inlineFormat(lines[i].slice(2))}</li>`);
        i++;
      }
      out.push("</ul>");
      continue;
    }

    // 순서 있는 목록
    if (/^\d+\. /.test(line)) {
      closeParagraph();
      out.push('<ol class="list-decimal list-inside space-y-1.5 my-4 text-gray-700">');
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        out.push(`<li>${inlineFormat(lines[i].replace(/^\d+\. /, ""))}</li>`);
        i++;
      }
      out.push("</ol>");
      continue;
    }

    // 인용구
    if (line.startsWith("> ")) {
      closeParagraph();
      out.push(`<blockquote class="border-l-4 border-[#7B2D8B] pl-4 my-6 text-gray-600 italic">${inlineFormat(line.slice(2))}</blockquote>`);
      i++;
      continue;
    }

    // 빈 줄
    if (line.trim() === "") {
      closeParagraph();
      i++;
      continue;
    }

    // 일반 문단
    if (!inParagraph) {
      out.push('<p class="text-gray-700 leading-relaxed my-4">');
      inParagraph = true;
    } else {
      out.push("<br />");
    }
    out.push(inlineFormat(line));
    i++;
  }

  closeParagraph();
  return out.join("");
}
