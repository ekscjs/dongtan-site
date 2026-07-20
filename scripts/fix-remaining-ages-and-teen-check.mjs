/**
 * 1) 세는나이→만나이 오차로 확인된 나머지 5명 age 수정
 * 2) 청소년 리포트(13~19세) 표본 이름 리스트 확인 + 문우주 포함 여부 확인
 *
 * 실행: node scripts/fix-remaining-ages-and-teen-check.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = {};
  const txt = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const PAGE_SIZE = 1000;
async function fetchAllRows(buildQuery) {
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

const members = await fetchAllRows(() =>
  supabase.from("members").select("id, name, age, gender, trainer, consultant, role")
);

// ── 1. 나머지 5명 age 수정 ──────────────────────────────
const FIXES = [
  { name: "손예원", to: 15 },
  { name: "김현주", to: 48 },
  { name: "진경숙", to: 49 },
  { name: "문홍서", to: 51 },
  { name: "김유민", to: 16 },
];

console.log("=== 1. 세는나이→만나이 수정 대상 확인 ===");
for (const fix of FIXES) {
  const matches = members.filter((m) => m.name === fix.name);
  if (matches.length === 0) {
    console.log(`⚠ ${fix.name}: members에서 이름 매칭 없음 — 건너뜀`);
    continue;
  }
  if (matches.length > 1) {
    console.log(`⚠ ${fix.name}: 동명이인 ${matches.length}명 존재 (id: ${matches.map((m) => m.id).join(", ")}) — 자동 수정 건너뜀, 수동 확인 필요`);
    continue;
  }
  const m = matches[0];
  if (m.age === fix.to) {
    console.log(`- ${fix.name} (id=${m.id}): 이미 age=${fix.to}, 변경 없음`);
    continue;
  }
  console.log(`- ${fix.name} (id=${m.id}): age ${m.age} → ${fix.to}`);
  const { error } = await supabase.from("members").update({ age: fix.to }).eq("id", m.id);
  if (error) {
    console.log(`  ✗ 업데이트 실패: ${error.message}`);
  } else {
    console.log(`  ✓ 업데이트 완료`);
  }
}

// ── 2. 청소년 리포트(13~19세) 표본 확인 ──────────────────────────────
const membersAfter = await fetchAllRows(() =>
  supabase.from("members").select("id, name, age, gender, trainer, consultant, role")
);

const STAFF_NAMES = new Set(["미소원장", "전종우", "송경천"]);
const staffFieldNames = new Set(
  membersAfter.flatMap((m) => [m.trainer, m.consultant]).filter((v) => v && v.trim())
);
const memberNames = new Set(membersAfter.map((m) => m.name));
const autoDetected = [...staffFieldNames].filter((n) => memberNames.has(n) && !STAFF_NAMES.has(n));
const excludeNames = new Set([...STAFF_NAMES, ...autoDetected]);
const cleanMembers = membersAfter.filter((m) => !excludeNames.has(m.name));

const groupTeen = cleanMembers.filter((m) => m.age >= 13 && m.age <= 19);

console.log("\n=== 2. 청소년 리포트(13~19세) 표본 이름 리스트 ===");
console.table(
  groupTeen
    .map((m) => ({ id: m.id, name: m.name, age: m.age, gender: m.gender }))
    .sort((a, b) => a.age - b.age)
);
console.log(`표본 인원: ${groupTeen.length}명`);

const munwoojoo = membersAfter.filter((m) => m.name === "문우주");
console.log("\n--- 문우주 검색 결과 ---");
if (munwoojoo.length === 0) {
  console.log("members 테이블에 '문우주' 이름 자체가 없음");
} else {
  for (const m of munwoojoo) {
    const inTeen = m.age >= 13 && m.age <= 19;
    const excluded = excludeNames.has(m.name);
    console.log(
      `id=${m.id}, age=${m.age}, gender=${m.gender}, role=${m.role ?? "-"}, 청소년범위(13-19)=${inTeen}, 스태프제외대상=${excluded}`
    );
  }
}

// 13~19 범위 근처(스태프 제외 전 포함해서) 전체를 보여줘서 왜 3명에서 안 늘었는지 추적
console.log("\n--- (참고) 스태프 제외 전, age 10~22 전체 회원 ---");
console.table(
  membersAfter
    .filter((m) => m.age >= 10 && m.age <= 22)
    .map((m) => ({ id: m.id, name: m.name, age: m.age, gender: m.gender, role: m.role, excluded: excludeNames.has(m.name) }))
    .sort((a, b) => a.age - b.age)
);
