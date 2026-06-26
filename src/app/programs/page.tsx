import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import KakaoButton from "@/components/KakaoButton";
import { ZapIcon, RefreshCwIcon, UserIcon, CheckIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "동탄 재활·체형교정·통증 운동 프로그램 | 내몸에미소",
  description:
    "동탄에서 재활, 체형교정, 통증 완화 운동을 1:1 맞춤으로. 증상이 아닌 원인부터 찾는 프로그램, 1회 체험 3만원. 누적 166명·재등록률 90%.",
  keywords: [
    "동탄 재활",
    "동탄 체형교정",
    "동탄 통증 운동",
    "동탄 재활 PT",
    "동탄 자세교정",
    "동탄 운동센터",
  ],
  alternates: { canonical: "https://www.bodymiso.com/programs" },
};

const stats = [
  { value: "4년+", label: "동탄 센터 오픈" },
  { value: "166명+", label: "누적 회원" },
  { value: "90%", label: "재등록률" },
];

const certs = [
  { year: "2023.12", title: "국민체육진흥공단", desc: "스포츠·장애인 바우처 가맹 시설" },
  { year: "2025.01", title: "국민체육진흥공단", desc: "국민체력 100 협력 센터" },
  { year: "2025.07", title: "특허청", desc: "스포츠 교육 기관 특허 등록" },
  { year: "2006", title: "문화체육관광부", desc: "지도자 전원 스포츠 지도사 자격 보유" },
];

const programIcons = {
  pain: ZapIcon,
  rehab: RefreshCwIcon,
  posture: UserIcon,
};

const programs = [
  {
    id: "pain",
    title: "통증 완화 운동",
    short: "일상의 불편함을 회복합니다",
    desc: "팔이 잘 안 올라가거나 무릎이 뻐근한 것도 원인이 있습니다. 증상이 아닌 움직임의 원인을 찾아 해결합니다.",
    targets: [
      "팔이 머리 위로 잘 안 올라가는 분",
      "걸을 때 한쪽 다리가 이상한 분",
      "앉았다 일어날 때 무릎이 아픈 분",
    ],
    review: {
      name: "40대 직장인",
      issue: "어깨 통증",
      content: "운동하다 다친 곳이 계속 재발해서 정형외과와 운동을 번갈아 다니다 더 나빠졌어요. 팔이 올라가지 않아 이곳에 왔는데, 처음부터 가동범위를 꼼꼼히 확인하고 상태에 맞게 진행해줘서 신기했어요. 20회 하고 너무 좋아져서 재등록해서 다니고 있어요.",
    },
  },
  {
    id: "rehab",
    title: "재활",
    short: "병원과 일상 사이를 채웁니다",
    desc: "수술 후 또는 부상 후, 치료는 끝났는데 몸이 예전 같지 않은 분을 위한 프로그램입니다.",
    targets: [
      "수술 후 회복 중인 분",
      "디스크 치료 후 관리가 필요한 분",
      "스포츠 부상 후 복귀를 준비 중인 분",
    ],
    review: {
      name: "30대 주부",
      issue: "허리 디스크",
      content: "필라테스, 요가, PT 다 해봤는데 여기가 진짜 달라요. 허리디스크로 걷기도 힘든 상태로 왔는데, 이제 덤벨 들고 워킹런지도 가능하게 만들어주셨어요. 몸에 대해 제대로 공부한 분께 받는 느낌이에요.",
    },
  },
  {
    id: "posture",
    title: "체형교정",
    short: "자세 문제를 근본 원인부터 잡습니다",
    desc: "굽은 등, 거북목, 골반 틀어짐. 자세 문제에는 반드시 원인이 있습니다.",
    targets: [
      "오래 앉아 있으면 허리가 아픈 분",
      "목·어깨가 항상 뭉쳐 있는 분",
      "한쪽 어깨가 올라가 있는 분",
    ],
    review: {
      name: "50대 여성",
      issue: "체형·부상 예방",
      content: "운동 전에 몸을 풀어주고 시작하는데 다치지 않도록 신경 써주시는 게 느껴져요. 급하게 하지 않고 천천히 관리해주셔서 운동을 겁내는 분들께 특히 추천드려요.",
    },
  },
];

const pricing = [
  { name: "무료 상담", price: "0원", desc: "몸 상태 파악 및 방향 상담" },
  { name: "1회 체험 1:1 운동", price: "30,000원", desc: "직접 경험해보고 결정하세요" },
  { name: "8주 내몸관리 프로그램", price: "480,000원", desc: "원인부터 해결하는 8주 집중 케어" },
  { name: "개인 맞춤형 수업 10회권", price: "600,000원", desc: "장기적으로 내 몸을 관리하고 싶은 분" },
];

const beforeAfterImages = [
  { src: "/before-after/ba-1.jpg", alt: "체형교정 비포에프터 1" },
  { src: "/before-after/ba-2.jpg", alt: "체형교정 비포에프터 2" },
  { src: "/before-after/ba-3.jpg", alt: "체형교정 비포에프터 3" },
];

export default function ProgramsPage() {
  return (
    <>
      <Header />
      <main>

        {/* 히어로 */}
        <section className="bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-4 tracking-widest uppercase">동탄 기능개선 · 재활 · 체형교정</p>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 break-keep">
              동탄에서 통증·재활·체형교정,<br />
              <span className="text-[#7B2D8B]">원인부터 해결합니다</span>
            </h1>
            <p className="text-gray-600 mt-5 leading-relaxed max-w-2xl mx-auto break-keep">
              허리·무릎·어깨 통증, 수술 후 재활, 굽은 등·거북목·골반 틀어짐까지 — 증상이 아닌 움직임의 원인을 1:1로 찾아 해결하는 동탄 운동센터입니다.
            </p>
          </div>
        </section>

        {/* 신뢰 지표 */}
        <section className="py-10 px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-2xl md:text-3xl font-bold text-[#7B2D8B]">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 공식 인증 */}
        <section className="py-10 px-4 bg-[#FAF5FB] border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-xs font-semibold text-[#9B4DAB] tracking-widest uppercase mb-6">공식 인증 현황</p>
            <div className="grid grid-cols-2 gap-4">
              {certs.map((c, i) => (
                <div key={i} className="bg-white rounded-xl px-5 py-4 border border-purple-100 flex flex-col gap-1">
                  <p className="text-xs text-gray-400">{c.year}</p>
                  <p className="text-xs font-semibold text-[#7B2D8B]">{c.title}</p>
                  <p className="text-sm font-medium text-gray-800">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 프로그램 빠른 이동 */}
        <section className="py-10 px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 justify-center">
            {programs.map((p) => (
              <a key={p.id} href={`#${p.id}`}
                className="flex-1 text-center border border-[#7B2D8B] text-[#7B2D8B] font-semibold py-3 px-4 rounded-full text-sm hover:bg-[#7B2D8B] hover:text-white transition-colors">
                {p.title}
              </a>
            ))}
          </div>
        </section>

        {/* 각 프로그램 섹션 */}
        {programs.map((p, i) => {
          const PIcon = programIcons[p.id as keyof typeof programIcons];
          return (
          <section key={p.id} id={p.id}
            className={`py-12 md:py-20 px-4 ${i % 2 === 1 ? "bg-[#FAF5FB]" : ""}`}>
            <div className="max-w-3xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#FAF5FB] flex items-center justify-center mb-4">
                <PIcon className="text-[#7B2D8B]" size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{p.title}</h2>
              <p className="text-[#7B2D8B] font-semibold mb-4">{p.short}</p>
              <p className="text-gray-600 mb-8 leading-relaxed">{p.desc}</p>

              {/* 대상자 */}
              <div className="space-y-3 mb-10">
                {p.targets.map((t, j) => (
                  <div key={j} className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100">
                    <CheckIcon className="text-[#7B2D8B] shrink-0" size={16} />
                    <p className="text-gray-700 text-sm md:text-base">{t}</p>
                  </div>
                ))}
              </div>

              {/* 후기 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                <span className="inline-block bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {p.review.issue}
                </span>
                <p className="text-gray-700 leading-relaxed mb-4">{p.review.content}</p>
                <p className="text-sm text-gray-400">{p.review.name}</p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <KakaoButton className="flex-1 text-center bg-[#7B2D8B] text-white font-semibold py-4 px-6 rounded-full hover:bg-[#6a2578] transition-colors">
                  이 프로그램 상담하기
                </KakaoButton>
                <a href="https://map.naver.com/p/entry/place/1101035370" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center border border-gray-200 text-gray-500 font-semibold py-4 px-6 rounded-full hover:border-[#7B2D8B] hover:text-[#7B2D8B] transition-colors">
                  네이버 후기 보기
                </a>
              </div>
            </div>
          </section>
          );
        })}

        {/* 비포에프터 */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">실제 변화 사례</h2>
            <p className="text-gray-500 text-center mb-12">내몸에미소 실제 회원분들의 변화입니다</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {beforeAfterImages.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={400}
                    height={400}
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 가격 */}
        <section className="bg-[#FAF5FB] py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">가격 안내</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {pricing.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-sm text-[#7B2D8B] font-semibold mb-1">{item.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{item.price}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#7B2D8B] py-10 md:py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3">어떤 프로그램이 맞는지 모르겠다면</h2>
            <p className="text-purple-200 mb-8 text-sm md:text-base">무료 상담으로 먼저 파악합니다.</p>
            <KakaoButton className="inline-block bg-white text-[#7B2D8B] font-bold px-10 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
              카카오로 상담하기
            </KakaoButton>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
