/**
 * blog-drafts/*.md → Supabase posts 예약발행 (이미지 자동 업로드 포함)
 *
 * 실행 (관장님 로컬 PC, dongtan-site 폴더에서):
 *   node publish-drafts.mjs                      # 준비된 초안 전부, 내일부터 하루 1개씩 예약
 *   node publish-drafts.mjs --start=2026-07-05   # 시작일 지정(그날 09시부터)
 *   node publish-drafts.mjs --every=2            # 2일 간격
 *   node publish-drafts.mjs plantar pelvic       # 특정 글만
 *
 * - published=true + publish_at(미래) → 그 시각 전엔 사이트에 안 뜸(예약발행)
 * - 이미지(images/*)는 blog-images 버킷에 올리고 본문 경로를 공개 URL로 교체
 * - 내부 링크 /슬러그 → /blog/슬러그 자동 보정
 * - 임상노트 썸네일(frontmatter thumbnail)은 본문 맨 위 커버로
 * - 같은 slug 있으면 update(이미 잡힌 예약시간은 유지), 없으면 insert
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, basename } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRAFTS = join(__dirname, "..", "blog-drafts");
const BUCKET = "blog-images";
const NON_POST = new Set(["blog","check","class","programs","reviews","about","privacy","index"]);

const argv = process.argv.slice(2);
const startArg = argv.find(a => a.startsWith("--start="))?.split("=")[1];
const everyArg = Number(argv.find(a => a.startsWith("--every="))?.split("=")[1]) || 1;
const only = argv.filter(a => !a.startsWith("--"));

// 예약 시작 기준: 지정 없으면 '내일' 09:00(KST)
function baseDate() {
  if (startArg) return new Date(`${startArg}T09:00:00+09:00`);
  const d = new Date(); d.setDate(d.getDate() + 1);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
  return new Date(`${y}-${m}-${day}T09:00:00+09:00`);
}
const BASE = baseDate();
function slotISO(i) { const d = new Date(BASE); d.setDate(d.getDate() + i*everyArg); return d.toISOString(); }

function loadEnv() {
  const env = {}; const txt = readFileSync(join(__dirname, ".env.local"), "utf8");
  for (const line of txt.split("\n")) { const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim(); }
  return env;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split("\n")) { const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/); if (mm) fm[mm[1]] = mm[2].trim(); }
  return { fm, body: m[2].trim() };
}

const CT = { png:"image/png", jpg:"image/jpeg", jpeg:"image/jpeg", webp:"image/webp" };
async function uploadImage(relPath, slug) {
  const localPath = join(DRAFTS, relPath);
  if (!existsSync(localPath)) { console.warn(`  ⚠ 이미지 없음(건너뜀): ${relPath}`); return null; }
  const fname = basename(relPath);
  const ext = (fname.split(".").pop() || "png").toLowerCase();
  const key = `${slug}/${fname}`;
  const { error } = await supabase.storage.from(BUCKET).upload(key, readFileSync(localPath), {
    contentType: CT[ext] || "application/octet-stream", upsert: true });
  if (error) { console.error(`  ✗ 업로드 실패 ${relPath}: ${error.message}`); return null; }
  return supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}

function fixInternalLinks(content) {
  return content.replace(/\]\((\/[a-z0-9\-]+)(\/[a-z0-9\-]+)?\)/g, (full, p1, p2) => {
    const seg = p1.slice(1);
    if (p1.startsWith("/blog") || NON_POST.has(seg)) return full;
    return `](/blog/${seg}${p2 || ""})`;
  });
}

async function publishOne(file, idx) {
  const { fm, body } = parseFrontmatter(readFileSync(join(DRAFTS, file), "utf8"));
  if (!fm.slug || !fm.title) { console.warn(`- ${file}: slug/title 없음, 건너뜀`); return; }

  let content = body;
  for (const rel of [...new Set([...content.matchAll(/\]\((images\/[^)]+)\)/g)].map(m => m[1]))]) {
    const url = await uploadImage(rel, fm.slug);
    if (url) content = content.split(`(${rel})`).join(`(${url})`);
  }
  if (fm.thumbnail) { const t = await uploadImage(fm.thumbnail, fm.slug); if (t) content = `![${fm.title}](${t})\n\n${content}`; }
  content = fixInternalLinks(content);

  const { data: exist } = await supabase.from("posts").select("id, publish_at").eq("slug", fm.slug).maybeSingle();
  const when = exist ? (exist.publish_at ?? null) : slotISO(idx);   // 기존글은 현재상태 유지(라이브 숨김 방지), 새 글만 예약
  const row = { title: fm.title, slug: fm.slug, content, excerpt: fm.excerpt || "", tag: fm.tag || null, published: true, publish_at: when };

  if (exist) {
    const { error } = await supabase.from("posts").update(row).eq("id", exist.id);
    console.log(error ? `  ✗ ${fm.slug} update 실패: ${error.message}` : `  ✓ ${fm.slug} 갱신 (예약 ${when.slice(0,10)})`);
  } else {
    const { error } = await supabase.from("posts").insert(row);
    console.log(error ? `  ✗ ${fm.slug} insert 실패: ${error.message}` : `  ✓ ${fm.slug} 예약발행 등록 (${when.slice(0,10)})`);
  }
}

const files = readdirSync(DRAFTS).filter(f => f.endsWith(".md"))
  .filter(f => only.length === 0 || only.some(s => f.includes(s)));
if (files.length === 0) { console.log("발행할 .md 초안이 없습니다."); process.exit(0); }
console.log(`예약 시작 ${BASE.toISOString().slice(0,10)} · ${everyArg}일 간격 · 대상 ${files.length}개`);
for (let i = 0; i < files.length; i++) { try { await publishOne(files[i], i); } catch (e) { console.error(`  ✗ ${files[i]}:`, e.message); } }
console.log("\n완료. 각 예약시각이 지나면 자동으로 사이트에 노출됩니다. (관리자에서 예약시간 조정 가능)");
