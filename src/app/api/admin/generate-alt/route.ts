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
              text: `이 이미지를 보고 내몸에미소 건강센터 블로그에 맞는 SEO 대체텍스트(alt)를 한국어로 작성해주세요.
규칙:
- 25자 이내
- 동탄·화성 지역명, 부위(허리·무릎·어깨 등), 동작·자세 키워드 포함
- 텍스트만 출력, 따옴표 없이`,
            },
          ],
        },
      ],
    });

    const alt = (message.content[0] as { type: string; text: string }).text.trim();
    return NextResponse.json({ alt });
  } catch (err) {
    console.error("generate-alt error:", err);
    return NextResponse.json({ error: "생성 실패" }, { status: 500 });
  }
}
