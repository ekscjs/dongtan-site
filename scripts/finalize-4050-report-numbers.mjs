/**
 * 연구노트 4050 리포트 "핵심 발견" 섹션용 최종 수치 확정
 * (터미널 페이스트로 인한 줄바꿈 잘림 방지 — 스크립트가 직접 파일로 저장)
 *
 * 방법론 결정:
 *   - 뷰(정면/후면/좌우측면)별 개별 각도 + 오버헤드스쿼트 세부(어깨/무릎/골반안정성)
 *     → A형(9개 각도 풀세트, 6명)만 사용. B형은 "뷰당 최저점 2개만" 선택 저장되는
 *       구조라 포함 시 실제보다 나쁜 쪽으로 편향(selection bias)됨.
 *   - 발끝잡기/Apley 좌우 "총점"은 스키마와 무관하게 전원 존재하고 선택 편향이 없어
 *     10명 전체(A+B) 합산.
 *
 * 실행: node scripts/finalize-4050-report-numbers.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(__dirname, "..", "exports", "4050-databank-sample-2026-07-20.json"), "utf8"));
const rows = d.데이터;

function num(v) {
  if (v === null || v === undefined) return null;
  const m = String(v).match(/(-?[0-9.]+)/);
  return m ? parseFloat(m[1]) : null;
}
function stat(vals) {
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { n: vals.length, avg: Math.round(avg * 100) / 100, min: Math.min(...vals), max: Math.max(...vals) };
}
function collectAngleValues(row, key) {
  const src = row.schema === "A_직접명명형" ? row.체형측정각도 : row.체형측정각도_매핑값;
  const obj = src ? src[key] : null;
  if (!obj) return [];
  const vals = [];
  for (const side of Object.keys(obj)) {
    const entry = obj[side];
    if (!entry) continue;
    const raw = entry.angle !== undefined ? entry.angle : entry.value;
    const n = num(raw);
    if (n !== null) vals.push(n);
  }
  return vals;
}
function ohsSub(row, subKey) {
  if (row.schema !== "A_직접명명형") return null;
  const s = row.움직임평가?.오버헤드스쿼트?.[subKey];
  return s && s.score !== null && s.score !== undefined ? s.score : null;
}
function totalScore(row, path) {
  if (row.schema === "A_직접명명형") return row.움직임평가?.[path]?.총점 ?? null;
  return row["움직임평가_원본_raw(카테고리당_1~2개뿐)"]?.[path]?.총점 ?? null;
}

const aRows = rows.filter((r) => r.schema === "A_직접명명형");

const angleStats = {};
for (const key of ["거북목각도", "라운드숄더각도", "흉추각도", "요추각도", "골반전방경사각도"]) {
  let vals = [];
  for (const r of aRows) vals = vals.concat(collectAngleValues(r, key));
  angleStats[key] = stat(vals);
}

const ohsStats = {};
for (const sub of ["어깨안정성", "무릎안정성", "골반안정성"]) {
  const vals = rows.map((r) => ohsSub(r, sub)).filter((v) => v !== null);
  ohsStats[sub] = stat(vals);
}

const movementTotalStats = {};
for (const cat of ["발끝잡기", "Apley좌측", "Apley우측"]) {
  const vals = rows.map((r) => totalScore(r, cat)).filter((v) => v !== null && v !== undefined);
  movementTotalStats[cat] = stat(vals);
}

const avgAge = Math.round((rows.reduce((a, r) => a + (r.나이 || 0), 0) / rows.length) * 10) / 10;

const lines = [];
lines.push("# 연구노트 4050 리포트 — 핵심 발견 최종 수치 (확정)");
lines.push("");
lines.push(`생성일: 2026-07-20 · 출처: exports/4050-databank-sample-2026-07-20.json`);
lines.push(`표본: 10명 (완전측정 A형 6명 + 부분측정 B형 4명), 평균연령 ${avgAge}세, 수집시작 2026-06-19`);
lines.push("");
lines.push("## 방법론 (페이지 방법론 섹션에도 반영할 것)");
lines.push("");
lines.push("- 체형측정 각도(거북목·라운드숄더·흉추·요추·골반전방경사) + 오버헤드스쿼트 세부(어깨/무릎/골반안정성): **A형 6명만 사용(N은 좌우측면 합산값)**. B형은 뷰(방향)당 점수가 가장 낮은 지표 2개만 선택 저장되는 구조라, 포함하면 실제보다 나쁜 쪽으로 편향(selection bias)됨 — 그래서 제외.");
lines.push("- 발끝잡기·Apley좌우 총점: 스키마와 무관하게 10명 전원 존재하고 선택 편향이 없어 **10명 전체 합산**.");
lines.push("- 어깨수평각도·골반수평각도·무릎수평각도·OX다리각도는 좌우 부호가 섞여 단순 평균이 무의미 → 1차 공개 제외(스펙 문서 4번 항목 그대로 유지).");
lines.push("");
lines.push("## 체형측정 각도 평균 (A형 6명, N=좌우측면 합산)");
lines.push("");
for (const [key, s] of Object.entries(angleStats)) {
  lines.push(`- ${key}: 평균 ${s.avg}°, 범위 ${s.min}~${s.max}°, N=${s.n}`);
}
lines.push("");
lines.push("## 오버헤드스쿼트 세부 안정성 점수 (A형 6명, 0~100)");
lines.push("");
for (const [key, s] of Object.entries(ohsStats)) {
  lines.push(`- 오버헤드스쿼트-${key}: 평균 ${s.avg}점, 범위 ${s.min}~${s.max}점, N=${s.n}`);
}
lines.push("");
lines.push("## 움직임평가 총점 (10명 전체, 0~100)");
lines.push("");
for (const [key, s] of Object.entries(movementTotalStats)) {
  lines.push(`- ${key}: 평균 ${s.avg}점, 범위 ${s.min}~${s.max}점, N=${s.n}`);
}
lines.push("");
lines.push("## 스펙 문서 4번 항목과의 대조");
lines.push("");
lines.push("- 이전 '확정된 평균' 값(라운드숄더각도 45.3°/N=12, 요추각도 51.3°/N=12, 오버헤드스쿼트-무릎안정성 57.3점/N=6, 발끝잡기 64.8점/N=10, Apley우측 55.6점/N=10) — 위 재계산과 동일, 변경 없음.");
lines.push("- 이전 '확정 대기' 값 → 이번에 확정:");
lines.push(`  - 거북목각도: 평균 ${angleStats["거북목각도"].avg}°, 범위 ${angleStats["거북목각도"].min}~${angleStats["거북목각도"].max}°, N=${angleStats["거북목각도"].n}`);
lines.push(`  - 골반전방경사각도: 평균 ${angleStats["골반전방경사각도"].avg}°, 범위 ${angleStats["골반전방경사각도"].min}~${angleStats["골반전방경사각도"].max}°, N=${angleStats["골반전방경사각도"].n}`);
lines.push(`  - 오버헤드스쿼트-어깨안정성: 평균 ${ohsStats["어깨안정성"].avg}점, 범위 ${ohsStats["어깨안정성"].min}~${ohsStats["어깨안정성"].max}점, N=${ohsStats["어깨안정성"].n}`);
lines.push(`  - 오버헤드스쿼트-골반안정성: 평균 ${ohsStats["골반안정성"].avg}점, 범위 ${ohsStats["골반안정성"].min}~${ohsStats["골반안정성"].max}점, N=${ohsStats["골반안정성"].n}`);
lines.push(`  - Apley좌측: 평균 ${movementTotalStats["Apley좌측"].avg}점, 범위 ${movementTotalStats["Apley좌측"].min}~${movementTotalStats["Apley좌측"].max}점, N=${movementTotalStats["Apley좌측"].n}`);
lines.push("");

const outPath = join(__dirname, "..", "exports", "4050-report-key-findings-final-2026-07-20.md");
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`저장 완료: ${outPath}`);
