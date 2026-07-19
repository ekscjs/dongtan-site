/**
 * posts(published+발행됨) → 구글 비즈니스 프로필(GBP) "최신 소식" 게시글용 요약 생성
 *
 * 실행 (관장님 로컬 PC, dongtan-site 폴더에서):
 *   node gbp-sync.mjs
 *
 * - gbp_posted_at IS NULL 인 발행글을 publish_at 오름차순으로 최대 3개까지 조회
 * - Anthropic API(claude-haiku-4-5)로 각 글 content 기반 한국어 요약(1500자 이내) 생성
 * - GBP API 실제 연동은 아직 없음(OAuth 인증정보 발급 대기) → postToGoogleBusinessProfile()은
 *   콘솔에 결과만 출력하고 gbp_posted_at은 업데이트하지 않음(실제 포스팅 안 됐으므로)
 */
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAX_POSTS = 3;

function loadEnv() {
  const env = {}; const txt = readFileSync(join(__dirname, ".env.local"), "utf8");
  for (const line of txt.split("\n")) { const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim(); }
  return env;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

async function fetchTargets() {
  const nowISO = new Date().toISOString();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, content, publish_at")
    .eq("published", true)
    .is("gbp_posted_at", null)
    .or(`publish_at.is.null,publish_at.lte.${nowISO}`)
    .order("publish_at", { ascending: true })
    .limit(MAX_POSTS);
  if (error) throw error;
  return data ?? [];
}

async function generateSummary(post) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `다음은 내몸에미소 건강센터(경기도 화성시 동탄) 블로그 글입니다. 이 글을 바탕으로 구글 비즈니스 프로필 "최신 소식(Local Post)" 게시글용 한국어 요약을 작성해주세요.

규칙:
- 1500자 이내
- 매번 다른 표현을 쓴다. "~하는 분" 나열, "순서가 잘못된" 같은 상투적 문구는 금지
- 과장된 의료 효과 주장 금지, 아래 글 내용에 근거해서만 작성
- 글 마지막 줄에 "자세히 보기: https://www.bodymiso.com/blog/${post.slug}" 형태로 원문 링크 포함
- 요약 텍스트만 출력 (설명·따옴표·마크다운 없이)

제목: ${post.title}

본문:
${post.content}`,
      },
    ],
  });
  return (message.content[0]).text.trim();
}

// TODO: GBP OAuth 인증정보 발급되면 여기에 Business Profile API localPosts.create 호출 추가
async function postToGoogleBusinessProfile(post, summary) {
  console.log(`\n--- [${post.slug}] ---`);
  console.log(summary);
}

const targets = await fetchTargets();
if (targets.length === 0) {
  console.log("GBP 대상 글이 없습니다.");
  process.exit(0);
}
console.log(`GBP 대상 ${targets.length}개`);
for (const post of targets) {
  try {
    const summary = await generateSummary(post);
    await postToGoogleBusinessProfile(post, summary);
  } catch (e) {
    console.error(`  ✗ ${post.slug}:`, e.message);
  }
}
console.log("\n완료. (GBP 실제 포스팅은 아직 미연동 — OAuth 인증정보 발급 후 postToGoogleBusinessProfile()에 API 호출 추가 예정)");
