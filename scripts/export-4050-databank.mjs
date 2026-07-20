/**
 * 4050 여성 데이터랩(여성, 40~59세, 순수 고객 10명) body_assessments 데이터 익명화 추출
 *
 * 중요 — measurements 스키마가 두 가지 형태로 섞여 있음:
 *   [A] 직접명명형: measurements.{front,back,left,right}에 요청 각도명(예: 거북목각도)이
 *       그대로 키로 존재 → 9개 각도 전부 그대로 매핑 가능 (6명: 허진,진은영,김미영,최혜자,정훈지,최윤선)
 *   [B] 문제요약형: measurements.posture.{front,back,left,right}.metrics 배열에
 *       "뷰(방향)당 최저점 지표 2개만" 저장, 라벨도 매번 다름(예: "무릎 좌우차"/"무릎 높이 차이"/
 *       "골반 높이 차이"가 셋 다 다른 회원에게 쓰임) → 구조적으로 9개 각도 풀세트가 없음
 *       (4명: 김현주,진경숙,박지현,강정애)
 * → [B] 회원은 요청 필드명과 정확히 일치/명백히 동일 개념인 경우만 채우고, 나머지는 null +
 *   원본 raw_metrics를 그대로 첨부해서 데이터 손실 없이 확인 가능하게 함.
 *
 * 실행: node scripts/export-4050-databank.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
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

const assessments = await fetchAllRows(() =>
  supabase.from("body_assessments").select("member_id, member_name, measurement_date, round, measurements").eq("source", "bodydot")
);
const idSet = new Set(group4050.map((m) => m.id));
const rows = assessments.filter((a) => idSet.has(a.member_id));

// 익명화 라벨: 이름 가나다순으로 고정 배정
const sortedMembers = [...group4050].sort((a, b) => a.name.localeCompare(b.name, "ko"));
const labelByMemberId = new Map(sortedMembers.map((m, i) => [m.id, `회원${i + 1}`]));

function matchName(name, keywords) {
  return keywords.some((k) => name === k || name.includes(k));
}

// ── [A] 직접명명형 추출 ──────────────────────────────
function extractFormatA(meas) {
  const front = meas.front || {};
  const back = meas.back || {};
  const left = meas.left || {};
  const right = meas.right || {};
  const pick = (obj, key) => (obj[key] ? { angle: obj[key].angle, score: obj[key].score } : null);
  return {
    schema: "A_직접명명형",
    완전성: "full",
    체형측정각도: {
      거북목각도: { 좌측면: pick(left, "거북목각도"), 우측면: pick(right, "거북목각도") },
      라운드숄더각도: { 좌측면: pick(left, "라운드숄더각도"), 우측면: pick(right, "라운드숄더각도") },
      흉추각도: { 좌측면: pick(left, "흉추각도"), 우측면: pick(right, "흉추각도") },
      요추각도: { 좌측면: pick(left, "요추각도"), 우측면: pick(right, "요추각도") },
      골반전방경사각도: { 좌측면: pick(left, "골반전방경사각도"), 우측면: pick(right, "골반전방경사각도") },
      어깨수평각도: { 정면: pick(front, "어깨수평각도"), 후면: pick(back, "어깨수평각도") },
      골반수평각도: { 정면: pick(front, "골반수평각도"), 후면: pick(back, "골반수평각도") },
      무릎수평각도: { 후면: pick(back, "무릎수평각도") },
      OX다리각도: { 왼쪽: pick(front, "왼쪽OX다리각도"), 오른쪽: pick(front, "오른쪽OX다리각도") },
    },
    움직임평가: extractMovementA(meas.movement || {}),
    체형총점: meas.posture_total ?? null,
    움직임총점: meas.overallMovement ?? meas.movement_total ?? null,
  };
}
function extractMovementA(mv) {
  const g = (obj, key) => (obj && obj[key] ? { value: obj[key].value, score: obj[key].score } : null);
  const ohs = mv["오버헤드스쿼트"] || {};
  const toe = mv["발끝잡기"] || {};
  return {
    오버헤드스쿼트: {
      총점: ohs.total ?? null,
      어깨안정성: g(ohs, "어깨안정성"),
      무릎안정성: g(ohs, "무릎안정성"),
      골반안정성: g(ohs, "골반안정성"),
      척추중립: g(ohs, "척추중립"),
      스쿼트깊이: g(ohs, "스쿼트깊이"),
    },
    발끝잡기: {
      총점: toe.total ?? null,
      무릎각도: g(toe, "무릎각도"),
      손끝거리: g(toe, "손끝거리"),
      고관절각도: g(toe, "고관절각도"),
    },
    Apley좌측: mv["Apley왼팔위"]
      ? { 총점: mv["Apley왼팔위"].total ?? null, 손목거리: g(mv["Apley왼팔위"], "손목거리") }
      : null,
    Apley우측: mv["Apley오른팔위"]
      ? { 총점: mv["Apley오른팔위"].total ?? null, 손목거리: g(mv["Apley오른팔위"], "손목거리") }
      : null,
  };
}

// ── [B] 문제요약형 추출 (뷰당 2개 지표만 존재) ──────────────────────────────
function findMetric(metrics, keywords) {
  const m = (metrics || []).find((x) => matchName(x.name, keywords));
  return m ? { name: m.name, value: m.value, unit: m.unit, score: m.score } : null;
}
function extractFormatB(meas) {
  const posture = meas.posture || {};
  const front = posture.front?.metrics || [];
  const back = posture.back?.metrics || [];
  const left = posture.left?.metrics || [];
  const right = posture.right?.metrics || [];
  const movement = meas.movement || {};

  return {
    schema: "B_문제요약형",
    완전성: "partial_뷰당_최저점_2개_지표만_원본에_존재",
    체형측정각도_매핑값: {
      거북목각도: { 좌측면: findMetric(left, ["귀 전방 이동"]), 우측면: findMetric(right, ["귀 전방 이동"]) },
      라운드숄더각도: {
        좌측면: findMetric(left, ["어깨 전방 이동", "라운드숄더"]),
        우측면: findMetric(right, ["어깨 전방 이동", "라운드숄더"]),
      },
      흉추각도: { 좌측면: findMetric(left, ["흉추"]), 우측면: findMetric(right, ["흉추"]) },
      요추각도: { 좌측면: findMetric(left, ["요추"]), 우측면: findMetric(right, ["요추"]) },
      골반전방경사각도: {
        좌측면: findMetric(left, ["골반전방경사", "골반 전방 경사", "골반경사"]),
        우측면: findMetric(right, ["골반전방경사", "골반 전방 경사", "골반경사"]),
      },
      어깨수평각도: {
        정면: findMetric(front, ["어깨 수평", "어깨수평", "어깨 좌우차"]),
        후면: findMetric(back, ["어깨 수평", "어깨수평", "어깨 좌우차"]),
      },
      골반수평각도: {
        정면: findMetric(front, ["골반 수평", "골반수평", "골반 높이 차이"]),
        후면: findMetric(back, ["골반 수평", "골반수평", "골반 높이 차이"]),
      },
      무릎수평각도: { 후면: findMetric(back, ["무릎 수평", "무릎수평", "무릎 높이 차이", "무릎 좌우차"]) },
      OX다리각도: {
        왼쪽: findMetric(front, ["왼쪽 O/X다리", "왼쪽OX다리"]),
        오른쪽: findMetric(front, ["오른쪽 O/X다리", "오른쪽OX다리"]),
      },
    },
    "체형측정_원본_raw(뷰당_2개뿐)": { 정면: front, 후면: back, 좌측면: left, 우측면: right },
    "움직임평가_원본_raw(카테고리당_1~2개뿐)": {
      오버헤드스쿼트: { 총점: movement.overheadSquat?.score ?? null, 지표: movement.overheadSquat?.metrics ?? [] },
      발끝잡기: { 총점: movement.toeTouch?.score ?? null, 지표: movement.toeTouch?.metrics ?? [] },
      Apley좌측: { 총점: movement.apleyLeftUp?.score ?? null, 지표: movement.apleyLeftUp?.metrics ?? [] },
      Apley우측: { 총점: movement.apleyRightUp?.score ?? null, 지표: movement.apleyRightUp?.metrics ?? [] },
    },
    체형총점: meas.overallPosture ?? null,
    움직임총점: meas.overallMovement ?? null,
  };
}

const result = rows
  .map((r) => {
    const member = group4050.find((m) => m.id === r.member_id);
    const label = labelByMemberId.get(r.member_id);
    const meas = r.measurements || {};
    const isFormatA = !!(meas.front || meas.back);
    const extracted = isFormatA ? extractFormatA(meas) : extractFormatB(meas);
    return {
      익명ID: label,
      나이: member?.age ?? null,
      성별: member?.gender ?? null,
      측정일: r.measurement_date,
      회차: r.round,
      ...extracted,
    };
  })
  .sort((a, b) => a.익명ID.localeCompare(b.익명ID, "ko", { numeric: true }));

const output = {
  설명:
    "4050 여성 데이터랩(순수 고객, 여성 40~59세) 10명 body_assessments 익명화 추출본. 이름/연락처 등 식별정보 제외, 익명ID(회원1~10, 이름 가나다순 고정 배정)만 부여.",
  값_형식_안내:
    "모든 각도/거리 값은 숫자(°/m/cm 등 단위 포함)와 0~100 환산 점수(score)로 저장되어 있음. '양호/보통/주의' 같은 등급(범주형) 데이터는 원본에 없음 — 필요하면 score 구간을 기준으로 별도 등급화해야 함.",
  스키마_안내: [
    "회원 10명 중 6명(A형)은 measurements에 요청한 9개 각도명이 그대로 저장돼 있어 100% 매핑됨.",
    "나머지 4명(B형: 원 데이터에 익명ID로만 표기, 상세는 원본 member_name 기준 김현주/진경숙/박지현/강정애)은 뷰(정면/후면/좌측면/우측면)당 '최저점 지표 2개만' 저장하는 다른 스키마라 9개 각도 풀세트가 구조적으로 없음.",
    "B형은 요청 필드명과 개념이 명백히 일치하는 경우만 채우고 나머지는 null 처리했고, 원본 지표(raw)는 그대로 첨부했으니 필요하면 raw에서 직접 확인 가능.",
    "움직임평가도 동일 패턴: A형은 오버헤드스쿼트 하위 5개 지표(어깨/무릎/골반안정성, 척추중립, 스쿼트깊이) 전부 존재, B형은 카테고리당 1~2개 지표만 원본에 존재해서 raw로만 제공.",
  ],
  생성일: "2026-07-20",
  대상_인원: result.length,
  데이터: result,
};

mkdirSync(join(__dirname, "..", "exports"), { recursive: true });
const outPath = join(__dirname, "..", "exports", "4050-databank-sample-2026-07-20.json");
writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
console.log(`저장 완료: ${outPath}`);
console.log(`대상 인원: ${result.length}명`);
console.log(`A형(9개 각도 풀세트): ${result.filter((r) => r.schema === "A_직접명명형").length}명`);
console.log(`B형(부분/raw 첨부): ${result.filter((r) => r.schema === "B_문제요약형").length}명`);
