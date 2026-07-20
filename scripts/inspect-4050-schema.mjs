/**
 * 4050 여성 데이터랩 대상자의 body_assessments 스키마 형태 사전 점검
 * (실제 export 스크립트 작성 전, 포맷 편차 확인용)
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
const STAFF_NAMES = new Set(["미소원장", "전종우", "송경천"]);
const staffFieldNames = new Set(members.flatMap((m) => [m.trainer, m.consultant]).filter((v) => v && v.trim()));
const memberNames = new Set(members.map((m) => m.name));
const autoDetected = [...staffFieldNames].filter((n) => memberNames.has(n) && !STAFF_NAMES.has(n));
const excludeNames = new Set([...STAFF_NAMES, ...autoDetected]);
const cleanMembers = members.filter((m) => !excludeNames.has(m.name));
const group4050 = cleanMembers.filter((m) => m.gender === "여" && m.age >= 40 && m.age <= 59);

console.log(`4050 여성 그룹: ${group4050.length}명`);
const ids = new Set(group4050.map((m) => m.id));

const assessments = await fetchAllRows(() =>
  supabase.from("body_assessments").select("id, member_id, member_name, measurement_date, round, measurements").eq("source", "bodydot")
);
const rows = assessments.filter((a) => ids.has(a.member_id));
console.log(`해당 그룹 body_assessments 레코드 수: ${rows.length}`);

for (const r of rows) {
  const meas = r.measurements || {};
  const format = meas.posture ? "B(posture.metrics배열)" : meas.front || meas.back ? "A(직접명명 각도필드)" : "UNKNOWN";
  console.log(`- ${r.member_name} | ${r.measurement_date} round=${r.round} | format=${format}`);
}

// 회원별 몇 건씩 있는지
const byMember = {};
for (const r of rows) {
  byMember[r.member_name] = (byMember[r.member_name] || 0) + 1;
}
console.log("\n회원별 레코드 수:", byMember);
