/**
 * posts 테이블 실제 상태를 DB에서 직접 조회 (읽기 전용, 아무것도 안 씀)
 * published-posts.md를 손으로 관리하지 않기 위한 스크립트 — 이게 항상 진실.
 *
 * 사용법: node list-posts.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const env = {}; const txt = readFileSync(join(__dirname, ".env.local"), "utf8");
  for (const line of txt.split("\n")) { const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim(); }
  return env;
}
const env = loadEnv();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: posts, error } = await sb
  .from("posts")
  .select("title,slug,tag,published,publish_at,created_at")
  .order("publish_at", { ascending: true, nullsFirst: false });

if (error) {
  console.error("조회 실패:", error.message);
  process.exit(1);
}

const now = new Date();
const rows = posts.map((p, i) => {
  const isFuture = p.publish_at && new Date(p.publish_at) > now;
  const status = !p.published ? "비공개" : isFuture ? "예약" : "공개";
  const dateStr = p.publish_at
    ? new Date(p.publish_at).toISOString().slice(0, 16).replace("T", " ")
    : (p.created_at ?? "").slice(0, 10);
  return `| ${i + 1} | ${p.title} | ${p.slug} | ${p.tag ?? "-"} | ${status} | ${dateStr} |`;
});

console.log(`총 ${posts.length}건 (실제 DB 기준, ${new Date().toISOString().slice(0,10)} 조회)\n`);
console.log("| # | 제목 | 슬러그 | 태그 | 상태 | 날짜 |");
console.log("|---|---|---|---|---|---|");
rows.forEach(r => console.log(r));

// published-posts.md에 그대로 붙여넣을 수 있게 파일로도 저장
const out = `# 발행글 목록 (DB 실시간 조회, ${new Date().toISOString().slice(0,10)})\n\n` +
  `총 ${posts.length}건\n\n| # | 제목 | 슬러그 | 태그 | 상태 | 날짜 |\n|---|---|---|---|---|---|\n` +
  rows.join("\n") + "\n";
fs.writeFileSync(new URL("./posts-snapshot.md", import.meta.url), out);
console.log("\n저장됨: dongtan-site/posts-snapshot.md");
