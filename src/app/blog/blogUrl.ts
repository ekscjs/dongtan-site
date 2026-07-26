export const CATEGORIES = ["전체", "임상노트", "몸 이야기"] as const;
export type Category = (typeof CATEGORIES)[number];

export function normalizeCategory(raw: string | null | undefined): Category {
  return (CATEGORIES as readonly string[]).includes(raw ?? "") ? (raw as Category) : "전체";
}

export function buildBlogUrl(cat: Category, page: number) {
  const params = new URLSearchParams();
  if (cat !== "전체") params.set("cat", cat);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}
