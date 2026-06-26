"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Summary = { today: number; week: number; month: number };
type DailyPoint = { date: string; count: number };
type SourcePoint = { source: string; count: number };
type PagePoint = { page: string; count: number };
type NewVsReturn = { new: number; return: number };
type SearchQuery = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

type AnalyticsData = {
  summary: Summary;
  dailyChart: DailyPoint[];
  sourceChart: SourcePoint[];
  topPages: PagePoint[];
  exitPages: PagePoint[];
  newVsReturn: NewVsReturn;
};

type SearchData = {
  queries: SearchQuery[];
  pages: SearchQuery[];
  period: { start: string; end: string } | null;
  error?: string;
};

const SOURCE_LABELS: Record<string, string> = {
  google: "구글",
  naver: "네이버",
  kakao: "카카오",
  instagram: "인스타그램",
  direct: "직접 방문",
  internal: "내부 이동",
  other: "기타",
};

const SOURCE_COLORS: Record<string, string> = {
  google: "#4285F4",
  naver: "#03C75A",
  kakao: "#FEE500",
  instagram: "#E1306C",
  direct: "#7B2D8B",
  internal: "#9CA3AF",
  other: "#D1D5DB",
};

const PAGE_LABELS: Record<string, string> = {
  "/": "홈",
  "/about": "센터 소개",
  "/programs": "프로그램",
  "/blog": "블로그",
  "/reviews": "후기",
  "/check": "자가진단",
  "/class/breathing": "호흡 클래스",
  "/privacy": "개인정보처리방침",
};

function pageLabel(path: string) {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith("/blog/")) return `블로그: ${path.replace("/blog/", "")}`;
  return path;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

function BarChart({ data, colorKey }: { data: { label: string; count: number; color?: string }[]; colorKey?: boolean }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 truncate shrink-0">{d.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-5 rounded-full flex items-center justify-end pr-2 text-xs font-semibold text-white"
              style={{
                width: `${Math.max((d.count / max) * 100, 3)}%`,
                backgroundColor: d.color ?? "#7B2D8B",
              }}
            >
              {d.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DailyChart({ data }: { data: DailyPoint[] }) {
  if (!data.length) return <p className="text-xs text-gray-400">데이터 없음</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  const recent = data.slice(-30);

  return (
    <div className="flex items-end gap-0.5 h-28 w-full">
      {recent.map((d, i) => {
        const height = Math.max((d.count / max) * 100, 2);
        const date = new Date(d.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative">
            <div
              className="w-full rounded-t bg-[#7B2D8B] group-hover:bg-[#6a2678] transition-colors"
              style={{ height: `${height}%` }}
            />
            {/* 툴팁 */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
              {label}: {d.count}명
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [search, setSearch] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchSearch = useCallback(async () => {
    setSearchLoading(true);
    try {
      const res = await fetch("/api/admin/search-console");
      const json = await res.json();
      setSearch(json);
    } catch {
      setSearch({ queries: [], pages: [], period: null, error: "Search Console 미연동" });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchSearch();
  }, [fetchData, fetchSearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">데이터 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-2">{error}</p>
          <button onClick={fetchData} className="text-[#7B2D8B] text-sm underline">다시 시도</button>
        </div>
      </div>
    );
  }

  const summary = data?.summary ?? { today: 0, week: 0, month: 0 };
  const sourceData = (data?.sourceChart ?? []).map((s) => ({
    label: SOURCE_LABELS[s.source] ?? s.source,
    count: s.count,
    color: SOURCE_COLORS[s.source],
  }));
  const topPageData = (data?.topPages ?? []).map((p) => ({
    label: pageLabel(p.page),
    count: p.count,
  }));
  const exitPageData = (data?.exitPages ?? []).map((p) => ({
    label: pageLabel(p.page),
    count: p.count,
  }));

  const totalVisitors = (data?.newVsReturn.new ?? 0) + (data?.newVsReturn.return ?? 0);
  const newPct = totalVisitors ? Math.round(((data?.newVsReturn.new ?? 0) / totalVisitors) * 100) : 0;
  const returnPct = 100 - newPct;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">애널리틱스</h1>
            <p className="text-sm text-gray-400 mt-1">내몸에미소 방문자 현황</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { fetchData(); fetchSearch(); }}
              className="border border-gray-200 text-gray-500 rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
            >
              새로고침
            </button>
            <a
              href="/admin"
              className="border border-[#7B2D8B] text-[#7B2D8B] rounded-lg px-4 py-2 text-sm hover:bg-[#FAF5FB]"
            >
              ← 관리자
            </a>
          </div>
        </div>

        {/* 방문자 요약 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="오늘 방문자" value={summary.today} />
          <StatCard label="주간 방문자 (7일)" value={summary.week} />
          <StatCard label="월간 방문자 (30일)" value={summary.month} />
        </div>

        {/* 날짜별 방문자 그래프 */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">날짜별 방문자 (최근 30일)</h2>
          <DailyChart data={data?.dailyChart ?? []} />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{data?.dailyChart[0]?.date ?? ""}</span>
            <span>{data?.dailyChart[data.dailyChart.length - 1]?.date ?? ""}</span>
          </div>
        </div>

        {/* 유입경로 + 신규/재방문 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">유입 경로 (30일)</h2>
            {sourceData.length ? (
              <BarChart data={sourceData} />
            ) : (
              <p className="text-xs text-gray-400">데이터 없음</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">신규 vs 재방문 (30일)</h2>
            {totalVisitors > 0 ? (
              <>
                <div className="flex rounded-full overflow-hidden h-8 mb-4">
                  <div
                    className="bg-[#7B2D8B] flex items-center justify-center text-white text-xs font-semibold"
                    style={{ width: `${newPct}%` }}
                  >
                    {newPct >= 15 ? `신규 ${newPct}%` : ""}
                  </div>
                  <div
                    className="bg-[#D8B4E2] flex items-center justify-center text-[#7B2D8B] text-xs font-semibold"
                    style={{ width: `${returnPct}%` }}
                  >
                    {returnPct >= 15 ? `재방문 ${returnPct}%` : ""}
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="inline-block w-3 h-3 rounded-full bg-[#7B2D8B] mr-1.5" />
                    신규 <strong>{data?.newVsReturn.new ?? 0}</strong>명
                  </div>
                  <div>
                    <span className="inline-block w-3 h-3 rounded-full bg-[#D8B4E2] mr-1.5" />
                    재방문 <strong>{data?.newVsReturn.return ?? 0}</strong>명
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400">데이터 없음</p>
            )}
          </div>
        </div>

        {/* 인기 페이지 + 이탈 지점 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">인기 페이지 Top 10</h2>
            {topPageData.length ? (
              <BarChart data={topPageData} />
            ) : (
              <p className="text-xs text-gray-400">데이터 없음</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">이탈 지점 Top 10</h2>
            <p className="text-xs text-gray-400 mb-3">세션의 마지막 페이지 기준</p>
            {exitPageData.length ? (
              <BarChart data={exitPageData} />
            ) : (
              <p className="text-xs text-gray-400">데이터 없음</p>
            )}
          </div>
        </div>

        {/* 구글 검색어 순위 */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">구글 검색어 순위표</h2>
              {search?.period && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {search.period.start} ~ {search.period.end} (Search Console 기준)
                </p>
              )}
            </div>
            {searchLoading && <span className="text-xs text-gray-400">불러오는 중...</span>}
          </div>

          {search?.error && !search.queries.length ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-yellow-700 mb-1">⚠ Search Console 미연동</p>
              <p className="text-yellow-600 text-xs">
                Google Cloud Console에서 서비스 계정 생성 후 환경변수에 추가하면 여기에 검색어가 표시됩니다.<br />
                <code className="bg-yellow-100 px-1 rounded">GOOGLE_SERVICE_ACCOUNT_JSON</code>, <code className="bg-yellow-100 px-1 rounded">SEARCH_CONSOLE_SITE_URL</code>
              </p>
            </div>
          ) : search?.queries.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold">검색어</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">클릭</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">노출</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">CTR</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">평균순위</th>
                  </tr>
                </thead>
                <tbody>
                  {search.queries.map((q, i) => (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                      <td className="py-2 px-3 font-medium text-gray-800">{q.keys[0]}</td>
                      <td className="py-2 px-3 text-right text-gray-600">{q.clicks}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{q.impressions.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{(q.ctr * 100).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right">
                        <span className={`text-xs font-semibold ${q.position <= 3 ? "text-green-600" : q.position <= 10 ? "text-[#7B2D8B]" : "text-gray-400"}`}>
                          {q.position.toFixed(1)}위
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
