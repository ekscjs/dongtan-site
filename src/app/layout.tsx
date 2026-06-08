import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans-kr",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif-kr",
});

export const metadata: Metadata = {
  verification: {
    google: "Rq1WFAvVjevRApPRg2EE2jB5l4Ht_J4JBxN9lck3DD4",
  },
  title: "내몸에미소 - 기능개선·재활·체형교정 전문 | 동탄",
  description:
    "허리, 무릎, 어깨가 불편하신가요? 내몸에미소는 기능개선, 재활, 체형교정을 전문으로 하는 동탄 운동센터입니다. 몸의 불편함을 원인부터 해결합니다.",
  keywords: ["동탄 체형교정", "동탄 재활운동", "동탄 기능개선", "동탄 자세교정", "동탄 허리통증 운동"],
  openGraph: {
    title: "내몸에미소 - 기능개선·재활·체형교정 전문",
    description: "허리, 무릎, 어깨가 불편하신가요? 동탄에서 몸의 불편함을 원인부터 해결합니다.",
    locale: "ko_KR",
    type: "website",
    url: "https://dongtan.naemiso.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full ${notoSansKR.variable} ${notoSerifKR.variable}`}>
      <body className={`${notoSansKR.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
