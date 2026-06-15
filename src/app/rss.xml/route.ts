import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export async function GET() {
  const base = "https://www.bodymiso.com";

  let posts: { title: string; slug: string; description: string; created_at: string }[] = [];
  try {
    const { data } = await supabase
      .from("posts")
      .select("title, slug, description, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    posts = data ?? [];
  } catch {
    posts = [];
  }

  const items = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${base}/blog/${p.slug}</link>
      <guid>${base}/blog/${p.slug}</guid>
      <description><![CDATA[${p.description ?? ""}]]></description>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>내몸에미소 칼럼</title>
    <link>${base}</link>
    <description>동탄 기능개선·재활·체형교정 전문 내몸에미소의 건강 칼럼</description>
    <language>ko</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
