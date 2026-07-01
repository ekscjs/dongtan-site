import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 80,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `이 이미지를 보고 내몸에미소 건강센터 블로그용 SEO 정보를 JSON으로 작성해주세요.
규칙:
- alt: 한국어 25자 이내, 동탄·화성 지역명·부위(허리·무릎·어깨 등)·동작 키워드 포함
- filename: 영어 소문자+하이픈만, 3~5단어, 동탄(dontan)·부위·동작 키워드 포함, 확장자 제외
- JSON만 출력, 예: {"alt":"동탄 허리통증 재활운동 자세","filename":"dontan-lower-back-rehab-exercise"}`,
            },
          ],
        },
      ],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    // 코드블록 제거 (```json ... ``` 또는 ``` ... ```)
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    let alt = "";
    let filename = "";
    try {
      const json = JSON.parse(cleaned);
      alt = json.alt || "";
      filename = json.filename || "";
    } catch {
      alt = cleaned;
    }
    return NextResponse.json({ alt, filename });
  } catch (err) {
    console.error("generate-alt error:", err);
    return NextResponse.json({ error: "생성 실패" }, { status: 500 });
  }
}
