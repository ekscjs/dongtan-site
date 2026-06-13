import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
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

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HealthClub"],
  name: "내몸에미소",
  description:
    "동탄 기능개선·재활·체형교정·퍼스널 트레이닝(PT) 전문 운동센터. 몸의 불편함을 원인부터 해결합니다.",
  url: "https://dongtan.naemiso.com",
  image: "https://dongtan.naemiso.com/logo.png",
  logo: "https://dongtan.naemiso.com/logo.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "동탄 지성로 134 5층",
    addressLocality: "화성시",
    addressRegion: "경기도",
    addressCountry: "KR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "22:00",
    },
  ],
  areaServed: ["동탄", "화성시", "오산", "수원"],
  knowsAbout: [
    "재활운동",
    "체형교정",
    "기능개선",
    "퍼스널 트레이닝",
    "허리통증",
    "자세교정",
    "시니어 운동",
  ],
  priceRange: "₩₩",
  sameAs: ["http://pf.kakao.com/_XGxbMG"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full ${notoSansKR.variable} ${notoSerifKR.variable}`}>
      <body className={`${notoSansKR.className} min-h-full flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {children}
        <Analytics />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8K7R4OR4T1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8K7R4OR4T1');
          `}
        </Script>
      </body>
    </html>
  );
}
