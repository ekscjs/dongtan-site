export const CATEGORIES = ["전체", "임상노트", "몸 이야기"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PER_PAGE = 10;

export function normalizeCategory(raw: string | null | undefined): Category {
  return (CATEGORIES as readonly string[]).includes(raw ?? "") ? (raw as Category) : "전체";
}

export function getPostCategory(tag: string | null): "임상노트" | "몸 이야기" {
  return tag === "임상노트" ? "임상노트" : "몸 이야기";
}

export function buildBlogUrl(cat: Category, page: number) {
  const params = new URLSearchParams();
  if (cat !== "전체") params.set("cat", cat);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export function buildBlogTitle(cat: Category, page: number): string {
  const base = cat === "전체" ? "블로그" : cat;
  const suffix = page > 1 ? ` (${page}페이지)` : "";
  return `${base}${suffix} | 내몸에미소`;
}
