import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { brandImage } from "@/lib/brandImage";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "1";
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim() || undefined;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  const isPng = file.type === "image/png";
  const arrayBuffer = await file.arrayBuffer();
  const rawBuffer = Buffer.from(arrayBuffer);

  let buffer: Buffer;
  try {
    buffer = await brandImage(rawBuffer, { title, png: isPng });
  } catch (e) {
    return NextResponse.json(
      { error: `이미지 브랜딩 실패: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }

  const ext = isPng ? "png" : "jpg";
  const contentType = isPng ? "image/png" : "image/jpeg";
  const filename = `${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("blog-images")
    .upload(filename, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("blog-images")
    .getPublicUrl(data.path);

  return NextResponse.json({ url: urlData.publicUrl });
}
