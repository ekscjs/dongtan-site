import type { Metadata } from "next";
import CheckQuiz from "./CheckQuiz";
import { resultTypes, type TypeKey } from "./data";

const DEFAULT_TITLE = "동탄 체형·통증 셀프체크 + 7일 교정 루틴 | 내몸에미소";
const DEFAULT_DESC =
  "1분 셀프체크로 내 몸 유형(거북목·골반·허리·전신)을 확인하고, 유형별 7일 교정 루틴을 매일 따라 해보세요. 동탄 체형교정·재활 내몸에미소.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const type = sp.type as TypeKey | undefined;
  const valid = !!type && type in resultTypes;

  const title = valid
    ? `나는 ${resultTypes[type!].name}! · 1분 통증·체형 셀프체크 | 내몸에미소`
    : DEFAULT_TITLE;
  const description = valid
    ? `${resultTypes[type!].oneLiner} 동탄 내몸에미소에서 내 몸 유형과 7일 교정 루틴을 확인하세요.`
    : DEFAULT_DESC;
  const image = valid ? `/og/${type}.png` : "/og/default.png";

  return {
    title,
    description,
    alternates: { canonical: "https://www.bodymiso.com/check" },
    openGraph: {
      title,
      description,
      url: "https://www.bodymiso.com/check",
      type: "website",
      locale: "ko_KR",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function CheckPage() {
  return <CheckQuiz />;
}
