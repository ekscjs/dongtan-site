import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DAILY_PER_IP_LIMIT = 15;
const DAILY_TOTAL_LIMIT = 300;

const LIMIT_MESSAGE = "오늘은 충분히 살펴보신 것 같아요, 내일 다시 이용해주세요.";

const ROOMS = [
  { label: "체형 유형 확인 (1분 셀프체크)", href: "/check", desc: "거북목·골반·허리·전신 유형을 확인하고 7일 교정 루틴을 받는 셀프체크" },
  { label: "통증지도 (부위별 체크)", href: "/check/pain", desc: "목·어깨·허리·골반·무릎·발목 중 아픈 부위를 선택해 원인 패턴을 확인" },
  { label: "바디 리셋 세션 (4주 1:1 프로그램)", href: "/class/breathing", desc: "원인 불명 통증, 트레이너·선수처럼 몸을 제대로 쓰고 싶은 분을 위한 4주 1:1. 긴장은 풀고 약화된 곳은 강화해 몸을 원래 자리로 되돌리는 프로그램" },
  { label: "프로그램 안내", href: "/programs", desc: "센터에서 진행하는 기능개선·재활·체형교정 프로그램 소개" },
];

const FALLBACK_TOOLS = [
  { label: "체형 유형 확인 (1분 셀프체크)", href: "/check" },
  { label: "통증지도 (부위별 체크)", href: "/check/pain" },
];

const SYSTEM_PROMPT = `너는 내몸에미소(동탄) 센터의 AI, 이름은 **미소AI**다. **움직임·운동·자세교정 전문 컨시어지**
역할을 한다. 근골격계 불균형,
움직임 패턴, 자세, 운동 부하 같은 **비의료 영역에서는 전문가답게 확신 있고 구체적으로
설명한다** — "잘 모르겠다", "병원 가서 확인하세요"를 기본 답으로 쓰지 않는다.
사용자가 증상을 말하면:
1. 관련 있는 우리 블로그 글 2~3개를 고른다.
2. 맞는 자가진단(/check, /check/pain)·운동(/class)·프로그램(/programs)으로 라우팅한다.
3. 공감 1~2줄 + **구체적인 움직임/자세 관점의 원인 설명과 운동 방향 제시** (우리 블로그·자가진단이
   이미 하는 수준으로 — 얼버무리지 말 것).

**막을 건 딱 두 가지뿐, 이거 말고는 전문가로서 자유롭게 답한다:**
1. **특정 질환명을 진단처럼 단정하는 것 금지** (예: "그건 회전근개파열입니다", "디스크
   3-4번 문제입니다" 같이 영상·촉진 검사가 필요한 병명 확정. 대신 "어깨 안쪽 구조물이
   부딪히는 패턴으로 보여요", "허리 쪽에 부담이 실리는 패턴이에요"처럼 움직임/부담 패턴으로
   설명하는 건 얼마든지 구체적으로 해도 됨 — 이게 우리 전문 영역.)
2. **약물·주사·시술·수술 언급이나 추천 금지.**
"진단", "처방", "치료", "완치"라는 단어는 안 쓰고 "확인", "안내", "관리", "운동 설계"로 쓰되,
내용 자체(운동 방법·강도·순서 등)는 구체적이고 실용적으로 준다.

**응급 신호**(마비·감각소실·대소변장애·극심한 야간통·발열 동반 등)가 보이면 위 절차 대신
"지금 바로 병원(응급실)에 가보시는 걸 권해드려요"를 최우선으로 답하고 다른 안내는 생략한다.
이때만 병원 언급을 답변에 직접 넣는다 — 그 외 일반 답변에는 병원/상담 권유 문구를 매번
반복해서 넣지 않는다(UI 하단에 상시 고지 문구가 별도로 있음).

우리 콘텐츠(posts·방 목록)에 없는 내용을 지어내지 않는다.

반드시 아래 JSON 스키마로만 답하라. 코드블록이나 부연설명 없이 JSON 객체 하나만 출력한다:
{"answer": string, "related_posts": [{"title": string, "slug": string}], "tools": [{"label": string, "href": string}], "show_consult": boolean, "is_emergency": boolean}`;

type Post = { title: string; slug: string; tag: string | null; content: string | null };
type AskResult = {
  answer: string;
  related_posts: { title: string; slug: string }[];
  tools: { label: string; href: string }[];
  show_consult: boolean;
  is_emergency: boolean;
};

function excerptFromContent(content: string | null, len = 180): string {
  if (!content) return "";
  const stripped = content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.slice(0, len);
}

// 특정 질환명을 진단 확정형으로 단정하는 문장 감지 (패턴 설명은 허용, 단정형만 차단)
function hasDiagnosisConfirmation(text: string): boolean {
  const diseases = [
    "회전근개파열", "회전근개 파열", "추간판탈출증", "디스크\\s?\\d?-?\\d?번",
    "골절", "협착증", "근막염", "건염", "점액낭염",
    "충돌증후군", "충돌 증후군", "후관절증후군", "후관절 증후군", "족저근막염",
  ].join("|");
  const pattern = new RegExp(`(${diseases})[^.!?\\n]{0,20}(입니다|이에요|예요|이다|맞습니다|맞아요)`);
  return pattern.test(text);
}

// 약물·주사·시술·수술 언급 감지
function hasTreatmentMention(text: string): boolean {
  const terms = ["주사", "시술", "수술", "약물", "진통제", "스테로이드", "마취", "처방약", "소염제", "항생제"];
  return terms.some((t) => text.includes(t));
}

function checkSafety(answer: string): boolean {
  return hasDiagnosisConfirmation(answer) || hasTreatmentMention(answer);
}

function extractJson(raw: string): AskResult | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as AskResult;
  } catch {
    return null;
  }
}

async function callClaude(query: string, posts: Post[], correction?: string): Promise<AskResult | null> {
  const postsList = posts
    .map((p) => `- [${p.slug}] ${p.title}${p.tag ? ` (태그: ${p.tag})` : ""}: ${excerptFromContent(p.content)}`)
    .join("\n");
  const roomsList = ROOMS.map((r) => `- ${r.label} → ${r.href}: ${r.desc}`).join("\n");

  const userMessage = `[우리 블로그 글 목록]
${postsList || "(글 없음)"}

[안내 가능한 방(라우팅 대상) 목록]
${roomsList}

[사용자 증상]
${query}${correction ? `\n\n[수정 요청]\n${correction}` : ""}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();
  return extractJson(raw);
}

function ipHashOf(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  return createHash("sha256").update(ip + "naemiso-ask-salt").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body.query ?? "").trim();
    if (!query) {
      return NextResponse.json({ error: "증상을 입력해주세요." }, { status: 400 });
    }
    if (query.length > 300) {
      return NextResponse.json({ error: "300자 이내로 입력해주세요." }, { status: 400 });
    }

    const ipHash = ipHashOf(req);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ count: ipCount }, { count: totalCount }] = await Promise.all([
      supabaseAdmin.from("ask_logs").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since),
      supabaseAdmin.from("ask_logs").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]);

    if ((ipCount ?? 0) >= DAILY_PER_IP_LIMIT || (totalCount ?? 0) >= DAILY_TOTAL_LIMIT) {
      return NextResponse.json({
        answer: LIMIT_MESSAGE,
        related_posts: [],
        tools: [],
        show_consult: false,
        is_emergency: false,
        limited: true,
      });
    }

    await supabaseAdmin.from("ask_logs").insert({ query, ip_hash: ipHash });

    const { data: postsData } = await supabaseAdmin
      .from("posts")
      .select("title, slug, tag, content")
      .eq("published", true)
      .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
      .order("publish_at", { ascending: false, nullsFirst: false })
      .limit(300);
    const posts = (postsData ?? []) as Post[];

    let result = await callClaude(query, posts);
    if (!result) {
      return NextResponse.json({ error: "답변 생성에 실패했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }

    if (checkSafety(result.answer)) {
      const retry = await callClaude(
        query,
        posts,
        "이전 답변에 특정 질환명 단정 표현이나 약물·주사·시술·수술 언급이 포함됐습니다. 두 가지를 모두 제거하고 움직임/부담 패턴 설명으로 다시 작성하세요."
      );
      if (retry && !checkSafety(retry.answer)) {
        result = retry;
      } else {
        result = {
          answer: "죄송해요, 지금은 정확한 안내가 어려워요. 아래 셀프체크로 먼저 확인해보시거나 상담을 통해 안내받아보세요.",
          related_posts: [],
          tools: FALLBACK_TOOLS,
          show_consult: true,
          is_emergency: false,
        };
        console.error("[ask] safety filter triggered twice, using fallback answer");
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[ask] error:", err);
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}
