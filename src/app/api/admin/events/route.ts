import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabaseAdmin
    .from("events")
    .select("event_name, properties, created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];

  // 이벤트별 카운트
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.event_name] = (counts[r.event_name] ?? 0) + 1;
  }

  // 체형진단 완료 시 유형별 분포
  const typeBreakdown: Record<string, number> = {};
  for (const r of rows) {
    if (r.event_name === "self_check_complete" && r.properties?.type) {
      const t = r.properties.type as string;
      typeBreakdown[t] = (typeBreakdown[t] ?? 0) + 1;
    }
  }

  // 통증지도 완료 시 부위별 분포 (areas: "목,허리" 형태)
  const areaBreakdown: Record<string, number> = {};
  for (const r of rows) {
    if (r.event_name === "pain_map_complete" && r.properties?.areas) {
      const areas = (r.properties.areas as string).split(",");
      for (const a of areas) {
        if (a) areaBreakdown[a] = (areaBreakdown[a] ?? 0) + 1;
      }
    }
  }

  // 일별 이벤트 추이 (최근 30일)
  const dailyMap: Record<string, { check: number; pain: number }> = {};
  for (const r of rows) {
    const date = r.created_at.slice(0, 10);
    if (!dailyMap[date]) dailyMap[date] = { check: 0, pain: 0 };
    if (r.event_name === "self_check_complete") dailyMap[date].check++;
    if (r.event_name === "pain_map_complete") dailyMap[date].pain++;
  }
  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  return NextResponse.json({ counts, typeBreakdown, areaBreakdown, daily });
}
