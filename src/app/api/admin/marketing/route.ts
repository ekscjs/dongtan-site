import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "1";
}

function parseMarketingFile(content: string) {
  // 제목, slug, tag, excerpt 파싱
  const title = content.match(/\*\*제목:\*\*\s*(.+)/)?.[1]?.trim() ?? "";
  const slug = content.match(/\*\*slug:\*\*\s*(.+)/)?.[1]?.trim() ?? "";
  const tag = content.match(/\*\*tag:\*\*\s*(.+)/)?.[1]?.trim() ?? "";
  const excerpt = content.match(/\*\*excerpt:\*\*\s*(.+)/)?.[1]?.trim() ?? "";

  // 본문: "## 본문" 이후 "---" 전까지 or 끝까지
  const bodyMatch = content.match(/## 본문[^\n]*\n+([\s\S]+)/);
  const body = bodyMatch?.[1]?.trim() ?? "";

  return { title, slug, tag, excerpt, content: body };
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const marketingDir = path.join(process.cwd(), "..", "marketing");

  if (!fs.existsSync(marketingDir)) {
    return NextResponse.json({ files: [] });
  }

  const files = fs
    .readdirSync(marketingDir)
    .filter((f) => f.endsWith(".md") && f.includes("사이트블로그"));

  const result = files.map((filename) => {
    const raw = fs.readFileSync(path.join(marketingDir, filename), "utf-8");
    const parsed = parseMarketingFile(raw);
    return { filename, ...parsed };
  });

  return NextResponse.json({ files: result });
}
