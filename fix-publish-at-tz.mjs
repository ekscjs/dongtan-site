/**
 * posts.publish_at 중 "UTC 자정(T00:00:00Z)"으로 잘못 저장된 값을
 * "KST 자정(=UTC 전날 15:00)"으로 일괄 보정한다.
 *
 * 배경: publish-drafts.mjs가 09:00 KST(=UTC 자정)로 예약 저장하던 시절 값들이
 * 남아있음. 이제 목록/상세 페이지가 publish_at을 표시 날짜로 쓰므로,
 * 게시 시각을 KST 자정으로 통일한다.
 *
 * 보정 전 반드시 현재값→보정후값 비교표를 출력하고, Asia/Seoul 기준 표시
 * 날짜(연월일)가 바뀌는 행이 하나라도 있으면 DB는 건드리지 않고 중단한다.
 *
 * 실행: node fix-publish-at-tz.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = {};
  const txt = readFileSync(join(__dirname, ".env.local"), "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const UTC_MIDNIGHT = /T00:00:00(\.\d+)?(Z|\+00:00)$/;

function kstDateStr(iso) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

const { data: posts, error } = await supabase
  .from("posts")
  .select("id, slug, publish_at")
  .not("publish_at", "is", null);

if (error) {
  console.error("조회 실패:", error.message);
  process.exit(1);
}

const targets = posts.filter((p) => UTC_MIDNIGHT.test(p.publish_at));

if (targets.length === 0) {
  console.log("보정 대상 없음 (UTC 자정으로 저장된 publish_at이 없습니다).");
  process.exit(0);
}

const rows = targets.map((p) => {
  const oldIso = p.publish_at;
  const newIso = new Date(new Date(oldIso).getTime() - 9 * 3600 * 1000).toISOString();
  const oldDate = kstDateStr(oldIso);
  const newDate = kstDateStr(newIso);
  return { id: p.id, slug: p.slug, oldIso, newIso, oldDate, newDate, dateChanged: oldDate !== newDate };
});

console.log(`보정 대상 ${rows.length}건\n`);
console.log("slug".padEnd(30), "old (UTC)".padEnd(26), "new (UTC)".padEnd(26), "old KST일자", "new KST일자", "변경?");
for (const r of rows) {
  console.log(
    r.slug.padEnd(30),
    r.oldIso.padEnd(26),
    r.newIso.padEnd(26),
    r.oldDate.padEnd(11),
    r.newDate.padEnd(11),
    r.dateChanged ? "⚠ 날짜변경" : "-"
  );
}

const changed = rows.filter((r) => r.dateChanged);
if (changed.length > 0) {
  console.log(`\n중단: 표시 날짜(KST 연월일)가 바뀌는 행이 ${changed.length}건 있습니다. DB는 수정하지 않았습니다.`);
  console.log("바뀌는 slug:", changed.map((r) => r.slug).join(", "));
  process.exit(1);
}

console.log("\n표시 날짜 변경 없음 확인. DB 업데이트를 진행합니다...");

let ok = 0, fail = 0;
for (const r of rows) {
  const { error: upErr } = await supabase.from("posts").update({ publish_at: r.newIso }).eq("id", r.id);
  if (upErr) {
    console.error(`  ✗ ${r.slug}: ${upErr.message}`);
    fail++;
  } else {
    ok++;
  }
}
console.log(`\n완료: 성공 ${ok}건, 실패 ${fail}건`);
