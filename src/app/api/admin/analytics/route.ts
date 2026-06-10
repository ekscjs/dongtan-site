import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // 로그인 확인
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return NextResponse.json({ error: "Analytics not configured" }, { status: 503 });
  }

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 30);

  const params = new URLSearchParams({
    projectId,
    from: from.toISOString(),
    to: now.toISOString(),
    filter: "{}",
    ...(teamId ? { teamId } : {}),
    environment: "production",
  });

  try {
    const res = await fetch(
      `https://vercel.com/api/web-analytics/stats?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 3600 }, // 1시간 캐시
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
