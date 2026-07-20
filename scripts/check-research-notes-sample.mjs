/**
 * 연구노트(4050 여성 데이터랩 + 청소년 리포트) 표본 현황 확인
 *
 * 실행: node scripts/check-research-notes-sample.mjs
 *
 * 스키마 참고 — 요청 당시 가정과 실제 컬럼이 달라 아래처럼 치환함:
 *   - members에 생년월일 컬럼 없음 → members.age(정수, 스냅샷 값) 사용
 *   - body_assessments에 assessed_at 컬럼 없음 → measurement_date 사용
 *
 * 스태프/셀프테스트 계정 제외 방식:
 *   - 이름 직접 지정(STAFF_NAMES)
 *   - trainer/consultant 필드에 등장하는 이름이 회원명으로도 존재하면 자동 제외
 *     (담당자 본인이 테스트로 자기 이름을 회원으로 등록한 경우를 걸러내기 위함)
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
const assessments = await fetchAllRows(() =>
  supabase.from("body_assessments").select("member_id, member_name, measurement_date, summary_korean").eq("source", "bodydot")
);

// ── 1. 스태프/셀프테스트 계정 식별 ──────────────────────────────
const STAFF_NAMES = new Set(["미소원장", "전종우", "송경천"]);

const staffFieldNames = new Set(
  members.flatMap((m) => [m.trainer, m.consultant]).filter((v) => v && v.trim())
);
const memberNames = new Set(members.map((m) => m.name));
const autoDetected = [...staffFieldNames].filter((n) => memberNames.has(n) && !STAFF_NAMES.has(n));

const excludeNames = new Set([...STAFF_NAMES, ...autoDetected]);
const excludedMembers = members.filter((m) => excludeNames.has(m.name));
const cleanMembers = members.filter((m) => !excludeNames.has(m.name));

console.log("=== 1. 스태프/셀프테스트 계정 제외 ===");
console.log(`직접 지정: ${[...STAFF_NAMES].join(", ")}`);
console.log(
  autoDetected.length
    ? `trainer/consultant 필드와 이름이 겹쳐 자동 감지: ${autoDetected.join(", ")}`
    : "trainer/consultant 필드와 이름이 겹치는 추가 계정 없음 (담당자는 '미소원장'/'센터장' 두 값만 존재, '센터장'은 role=admin으로 별도 확인됨 — 아래 참고)"
);
console.log(
  "참고: '센터장'도 role='admin'이고 age=1982(오입력)라 같은 패턴의 셀프테스트 계정으로 보이는데 요청 목록엔 없었음 — 필요하면 STAFF_NAMES에 추가해서 재실행하면 됨"
);
console.log(`제외 대상 최종: ${[...excludeNames].join(", ")} (${excludedMembers.length}명)`);
console.log(`members 전체 ${members.length}명 → 순수 고객 ${cleanMembers.length}명\n`);

// ── 2. 순수 고객 기준 재집계 ──────────────────────────────
const earliestByMember = new Map();
for (const a of assessments) {
  if (!a.member_id || !a.measurement_date) continue;
  const cur = earliestByMember.get(a.member_id);
  if (!cur || a.measurement_date < cur) earliestByMember.set(a.member_id, a.measurement_date);
}

function summarize(label, group) {
  const withAssessment = group.filter((m) => earliestByMember.has(m.id));
  const dates = withAssessment.map((m) => earliestByMember.get(m.id)).sort();
  return {
    그룹: label,
    "회원 수(모수)": group.length,
    "body_assessments 있는 인원": withAssessment.length,
    "최초 측정일": dates[0] ?? "-",
  };
}

const group4050 = cleanMembers.filter((m) => m.gender === "여" && m.age >= 40 && m.age <= 59);
const groupTeen = cleanMembers.filter((m) => m.age >= 13 && m.age <= 19);

console.log("=== 2. 순수 고객 기준 최종 표본 ===");
console.table([summarize("4050 여성 데이터랩 (여성, 40~59세)", group4050), summarize("청소년 리포트 (13~19세)", groupTeen)]);

// ── 3. body_assessments 원본에 독립적인 나이/생년월일 정보가 있는지 검증 ──────
// summary_korean 문장에 나이가 언급되는지 확인하고, members.age와 대조해 값이 어디서 왔는지 역추적
console.log("\n=== 3. body_assessments에 독립적인 나이/생년월일 소스가 있는가 ===");
const memberById = new Map(members.map((m) => [m.id, m]));
let echoesMembersAge = 0;
let noMention = 0;
let mismatch = 0;
for (const a of assessments) {
  const m = memberById.get(a.member_id);
  const ageMatch = (a.summary_korean || "").match(/(\d{1,4})세/);
  if (!ageMatch) {
    noMention++;
    continue;
  }
  const mentioned = Number(ageMatch[1]);
  if (m && mentioned === m.age) echoesMembersAge++;
  else mismatch++;
}
console.log(`summary_korean에 "N세" 언급 있는 레코드: ${assessments.length - noMention}/${assessments.length} (없음: ${noMention})`);
console.log(`그 중 members.age 값과 정확히 일치: ${echoesMembersAge}건, 불일치: ${mismatch}건`);
console.log(
  `→ age=0인 회원은 요약문에도 나이 언급이 아예 빠지고, age=1982(오입력)인 '센터장'은 요약문에도 "982세"라는 동일 오류가 그대로 찍힘.`
);
console.log(
  `→ 결론: summary_korean의 나이 언급은 측정 당시 members.age를 그대로 문장에 삽입한 것일 뿐, 바디닷 raw 데이터에서 온 독립적인 값이 아님.`
);
console.log(
  `→ measurements(JSON) 컬럼에도 birth/생년월일/나이 관련 키 없음(체형·움직임 점수만 존재).`
);
console.log(
  `→ 즉 body_assessments를 나이 소스로 바꿔도 근본 해결 안 됨. 지금 17명 미입력·4명 오입력 문제는 members.age 자체를(또는 그 앞단 — 바디닷 기기/앱에서 넘어오는 원본 값을) 고쳐야 풀림.`
);
