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
  yearlyChart: DailyPoint[];
  sourceChart: SourcePoint[];
  topPages: PagePoint[];
  exitPages: PagePoint[];
  newVsReturn: NewVsReturn;
  slugToTitle: Record<string, string>;
};

type SearchData = {
  queries: SearchQuery[];
  pages: SearchQuery[];
  period: { start: string; end: string } | null;
  error?: string;
};

type Ga4Country = { country: string; sessions: number };
type Ga4City = { city: string; sessions: number };
type Ga4Device = { device: string; sessions: number };
type Ga4Page = { path: string; views: number; avgDuration: number; engagementRate: number };
type Ga4Channel = { channel: string; sessions: number };
type Ga4Data = {
  countries: Ga4Country[];
  cities: Ga4City[];
  devices: Ga4Device[];
  pages: Ga4Page[];
  channels: Ga4Channel[];
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

function pageLabel(path: string, slugToTitle?: Record<string, string>) {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith("/blog/")) {
    const slug = path.replace("/blog/", "");
    return slugToTitle?.[slug] ?? "블로그: " + slug;
  }
  return path;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col">
      <p className="text-xs text-gray-400 flex-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; count: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-28 shrink-0 truncate" title={d.label}>{d.label}</span>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
              <div
                className="h-5 rounded-full"
                style={{
                  width: Math.max((d.count / max) * 100, 3) + "%",
                  backgroundColor: d.color ?? "#7B2D8B",
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-6 text-right shrink-0">{d.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

type ChartMode = "month" | "year";

function LineChart({ data, mode }: { data: DailyPoint[]; mode: ChartMode }) {
  if (!data.length) return <p className="text-xs text-gray-400">데이터 없음</p>;

  // 연간: date가 "YYYY-MM" 형식, 월간: "YYYY-MM-DD"
  const pts_raw = data.map((d) => ({
    label: mode === "year" ? d.date.slice(0, 7).replace("-", "/") : d.date.slice(5),
    count: d.count,
    tooltip: d.date + ": " + d.count + "명",
  }));

  const max = Math.max(...pts_raw.map((d) => d.count), 1);
  const W = 600, H = 180;
  const PAD = { top: 16, right: 16, bottom: 36, left: 36 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const pts = pts_raw.map((d, i) => ({
    x: PAD.left + (pts_raw.length === 1 ? cW / 2 : (i / (pts_raw.length - 1)) * cW),
    y: PAD.top + (1 - d.count / max) * cH,
    ...d,
  }));

  const linePath = pts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
  const areaPath = linePath
    + " L" + pts[pts.length - 1].x.toFixed(1) + "," + (PAD.top + cH).toFixed(1)
    + " L" + pts[0].x.toFixed(1) + "," + (PAD.top + cH).toFixed(1) + " Z";

  const yTicks = [0, Math.round(max / 2), max];

  // 연간은 전부 표시, 월간은 6개만
  const xLabelIndices = mode === "year"
    ? pts.map((_, i) => i)
    : [0, 5, 10, 15, 20, 25, pts.length - 1].filter((i) => i < pts.length);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={"0 0 " + W + " " + H} className="w-full" style={{ minWidth: "280px" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B2D8B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7B2D8B" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {yTicks.map((v) => {
          const y = PAD.top + (1 - v / max) * cH;
          return (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={PAD.left + cW} y2={y} stroke="#D1D5DB" strokeWidth="1.2" strokeDasharray="4 3" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#6B7280" fontWeight="500">{v}</text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="#7B2D8B" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={mode === "year" ? 6 : 3.5} fill="white" stroke="#7B2D8B" strokeWidth="2.5" />
            <title>{p.tooltip}</title>
          </g>
        ))}
        {xLabelIndices.map((i) => (
          <text key={i} x={pts[i].x} y={H - 8} textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="500">
            {pts[i].label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? m + "분 " + s + "초" : s + "초";
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [search, setSearch] = useState<SearchData | null>(null);
  const [ga4, setGa4] = useState<Ga4Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [ga4Loading, setGa4Loading] = useState(false);
  const [error, setError] = useState("");
  const [chartMode, setChartMode] = useState<ChartMode>("month");
  const chartData = chartMode === "year" ? (data?.yearlyChart ?? []) : (data?.dailyChart ?? []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.status === 401) { router.push("/admin"); return; }
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

  const fetchGa4 = useCallback(async () => {
    setGa4Loading(true);
    try {
      const res = await fetch("/api/admin/ga4");
      const json = await res.json();
      setGa4(json);
    } catch {
      setGa4({ countries: [], devices: [], pages: [], channels: [], error: "GA4 미연동" });
    } finally {
      setGa4Loading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchSearch();
    fetchGa4();
  }, [fetchData, fetchSearch, fetchGa4]);

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
  const slugToTitle = data?.slugToTitle ?? {};
  const sourceData = (data?.sourceChart ?? []).map((s) => ({
    label: SOURCE_LABELS[s.source] ?? s.source,
    count: s.count,
    color: SOURCE_COLORS[s.source],
  }));
  const topPageData = (data?.topPages ?? []).map((p) => ({
    label: pageLabel(p.page, slugToTitle),
    count: p.count,
  }));
  const exitPageData = (data?.exitPages ?? []).map((p) => ({
    label: pageLabel(p.page, slugToTitle),
    count: p.count,
  }));

  const totalVisitors = (data?.newVsReturn.new ?? 0) + (data?.newVsReturn.return ?? 0);
  const newPct = totalVisitors ? Math.round(((data?.newVsReturn.new ?? 0) / totalVisitors) * 100) : 0;
  const returnPct = 100 - newPct;

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">애널리틱스</h1>
            <p className="text-sm text-gray-400 mt-1">내몸에미소 방문자 현황</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { fetchData(); fetchSearch(); fetchGa4(); }}
              className="border border-gray-200 text-gray-500 rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
            >
              새로고침
            </button>
            <a href="/admin" className="border border-[#7B2D8B] text-[#7B2D8B] rounded-lg px-4 py-2 text-sm hover:bg-[#FAF5FB]">
              &larr; 관리자
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="오늘 방문자" value={summary.today} />
          <StatCard label="주간 방문자 (7일)" value={summary.week} />
          <StatCard label="월간 방문자 (30일)" value={summary.month} />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              방문자 추이{" "}
              <span className="text-xs font-normal text-gray-400">
                {chartMode === "month" ? "(최근 30일)" : "(월별 누적)"}
              </span>
            </h2>
            <div className="flex gap-1.5">
              {(["month", "year"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    chartMode === m
                      ? "bg-[#7B2D8B] text-white border-[#7B2D8B]"
                      : "border-gray-200 text-gray-500 hover:border-[#7B2D8B]"
                  }`}
                >
                  {m === "month" ? "월간" : "연간"}
                </button>
              ))}
            </div>
          </div>
          <LineChart data={chartData} mode={chartMode} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">유입 채널 <span className="text-xs font-normal text-gray-400">(GA4 30일)</span></h2>
            </div>
            {ga4?.channels && ga4.channels.length > 0 ? (
              <BarChart data={ga4.channels.map((c) => ({ label: c.channel, count: c.sessions }))} />
            ) : sourceData.length ? (
              <>
                <p className="text-xs text-gray-400 mb-2">GA4 로딩 중 — 임시 데이터</p>
                <BarChart data={sourceData} />
              </>
            ) : (
              <p className="text-xs text-gray-400">데이터 없음</p>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">신규 vs 재방문 (30일)</h2>
            {totalVisitors > 0 ? (
              <>
                <div className="flex rounded-full overflow-hidden h-8 mb-4">
                  <div className="bg-[#7B2D8B] flex items-center justify-center text-white text-xs font-semibold" style={{ width: newPct + "%" }}>
                    {newPct >= 15 ? "신규 " + newPct + "%" : ""}
                  </div>
                  <div className="bg-[#D8B4E2] flex items-center justify-center text-[#7B2D8B] text-xs font-semibold" style={{ width: returnPct + "%" }}>
                    {returnPct >= 15 ? "재방문 " + returnPct + "%" : ""}
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div><span className="inline-block w-3 h-3 rounded-full bg-[#7B2D8B] mr-1.5" />신규 <strong>{data?.newVsReturn.new ?? 0}</strong>명</div>
                  <div><span className="inline-block w-3 h-3 rounded-full bg-[#D8B4E2] mr-1.5" />재방문 <strong>{data?.newVsReturn.return ?? 0}</strong>명</div>
                </div>
              </>
            ) : <p className="text-xs text-gray-400">데이터 없음</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">인기 페이지 Top 10</h2>
            {topPageData.length ? <BarChart data={topPageData} /> : <p className="text-xs text-gray-400">데이터 없음</p>}
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">이탈 지점 Top 10</h2>
            <p className="text-xs text-gray-400 mb-3">세션의 마지막 페이지 기준</p>
            {exitPageData.length ? <BarChart data={exitPageData} /> : <p className="text-xs text-gray-400">데이터 없음</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">국가 / 도시별 방문자 <span className="text-xs font-normal text-gray-400">(GA4 30일)</span></h2>
              {ga4Loading && <span className="text-xs text-gray-400">불러오는 중...</span>}
            </div>
            {ga4?.error && !ga4.countries.length ? (
              <p className="text-xs text-gray-400">{ga4.error}</p>
            ) : (
              <>
                {ga4?.countries.length ? (
                  <>
                    <p className="text-xs font-semibold text-gray-400 mb-2">국가</p>
                    <BarChart data={ga4.countries.map((c) => ({ label: c.country === "(not set)" ? "미분류" : c.country, count: c.sessions }))} />
                  </>
                ) : <p className="text-xs text-gray-400">데이터 없음</p>}
                {ga4?.cities && ga4.cities.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 mt-5 mb-2">도시</p>
                    <BarChart data={ga4.cities.map((c) => ({ label: c.city, count: c.sessions, color: "#B05CC2" }))} />
                  </>
                )}
              </>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">기기별 방문자 <span className="text-xs font-normal text-gray-400">(GA4 30일)</span></h2>
            </div>
            {ga4?.devices.length ? (
              <>
                <BarChart data={ga4.devices.map((d, i) => ({ label: d.device, count: d.sessions, color: ["#7B2D8B", "#B05CC2", "#D8A8E8"][i % 3] }))} />
                <div className="mt-4 flex gap-4 text-xs text-gray-500">
                  {ga4.devices.map((d, i) => {
                    const total = ga4.devices.reduce((s, x) => s + x.sessions, 0);
                    const pct = total ? Math.round((d.sessions / total) * 100) : 0;
                    return <span key={i}>{d.device} <strong>{pct}%</strong></span>;
                  })}
                </div>
              </>
            ) : <p className="text-xs text-gray-400">데이터 없음</p>}
          </div>
        </div>

        {ga4?.pages && ga4.pages.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">페이지별 참여 현황 <span className="text-xs font-normal text-gray-400">(GA4 30일)</span></h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold">페이지</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">조회수</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">평균 참여시간</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500 font-semibold">참여율</th>
                  </tr>
                </thead>
                <tbody>
                  {ga4.pages.map((p, i) => (
                    <tr key={i} className={"border-b border-gray-50 " + (i % 2 === 0 ? "" : "bg-gray-50/50")}>
                      <td className="py-2 px-3 text-gray-800 font-medium max-w-[200px] truncate" title={pageLabel(p.path, slugToTitle)}>{pageLabel(p.path, slugToTitle)}</td>
                      <td className="py-2 px-3 text-right text-gray-600">{p.views.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{fmtDuration(p.avgDuration)}</td>
                      <td className="py-2 px-3 text-right">
                        <span className={"text-xs font-semibold " + (p.engagementRate >= 0.5 ? "text-green-600" : p.engagementRate >= 0.3 ? "text-[#7B2D8B]" : "text-gray-400")}>
                          {(p.engagementRate * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">구글 검색어 순위표</h2>
              {search?.period && (
                <p className="text-xs text-gray-400 mt-0.5">{search.period.start} ~ {search.period.end} (Search Console 기준)</p>
              )}
            </div>
            {searchLoading && <span className="text-xs text-gray-400">불러오는 중...</span>}
          </div>
          {search?.error && !search.queries.length ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-yellow-700 mb-1">Search Console 미연동</p>
              <p className="text-yellow-600 text-xs">GOOGLE_SERVICE_ACCOUNT_JSON, SEARCH_CONSOLE_SITE_URL 환경변수를 추가하면 검색어가 표시됩니다.</p>
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
                    <tr key={i} className={"border-b border-gray-50 " + (i % 2 === 0 ? "" : "bg-gray-50/50")}>
                      <td className="py-2 px-3 font-medium text-gray-800">{q.keys[0]}</td>
                      <td className="py-2 px-3 text-right text-gray-600">{q.clicks}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{q.impressions.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-gray-400">{(q.ctr * 100).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right">
                        <span className={"text-xs font-semibold " + (q.position <= 3 ? "text-green-600" : q.position <= 10 ? "text-[#7B2D8B]" : "text-gray-400")}>
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
