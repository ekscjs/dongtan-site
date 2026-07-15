import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import type { Metadata } from "next";
import KakaoButton from "@/components/KakaoButton";

export const metadata: Metadata = {
  title: "센터 소개 | 내몸에미소 동탄",
  description: "내몸에미소 박미소 원장의 이야기. 직접 아파봤기 때문에, 어디서 막히는지 압니다.",
};

const SITE = "https://www.bodymiso.com";

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "박미소",
  jobTitle: "원장",
  url: `${SITE}/about`,
  image: `${SITE}/director.jpg`,
  worksFor: { "@type": "Organization", name: "내몸에미소", url: SITE },
  sameAs: [
    "http://pf.kakao.com/_XGxbMG",
    "https://share.google/VbU2JEdmnxyE49qRK",
    "https://map.naver.com/p/entry/place/1101035370",
  ],
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", credentialCategory: "체육지도사" },
    { "@type": "EducationalOccupationalCredential", credentialCategory: "식이지도사" },
    { "@type": "EducationalOccupationalCredential", credentialCategory: "시니어지도사" },
    { "@type": "EducationalOccupationalCredential", credentialCategory: "평생교육사" },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <Header />
      <main>

        {/* 히어로 */}
        <section className="bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-4 tracking-widest uppercase">센터 소개</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              직접 아파봤기 때문에,<br />
              <span className="text-[#7B2D8B]">어디서 막히는지 압니다.</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
              내몸에미소는 병원과 헬스장 사이 어딘가에서 막막해진 분들을 위한 곳입니다.
            </p>
          </div>
        </section>

        {/* 원장 스토리 */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto space-y-10">

            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="shrink-0 mx-auto md:mx-0">
                <Image
                  src="/director.jpg"
                  alt="내몸에미소 박미소 원장"
                  width={220}
                  height={280}
                  className="rounded-2xl object-cover shadow-md"
                />
                <p className="text-sm text-gray-500 mt-2 font-medium">박미소 원장</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  기능성 운동 센터 대표<br />
                  체육 지도사<br />
                  평생교육사
                </p>
              </div>
              <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">박미소 원장 이야기</h2>
              <div className="space-y-5 text-gray-600 leading-relaxed text-sm md:text-base lg:text-lg">
                <p>
                  어릴 때부터 몸이 많이 약했습니다. 만성 질환과 여러 가지 건강 문제로 일상이 힘들었고,
                  병원을 다녀도 나아지지 않아 진통제와 소염제를 입에 달고 살았습니다.
                </p>
                <p>
                  그러다 어느 순간 깨달았습니다. <strong className="text-gray-900">"이 문제는 결국 내가 해결해야 한다"</strong>고.
                  그때부터 꾸준한 운동과 건강한 생활 습관을 통해 스스로 몸을 회복했습니다.
                </p>
                <p>
                  그 과정에서 비슷한 어려움을 겪는 분들이 얼마나 많은지 알게 됐습니다.
                  검사해도 이상 없다는 말, 치료받으면 잠깐 낫다가 다시 재발하는 경험,
                  운동하라는 말은 들었는데 어떤 운동인지는 아무도 알려주지 않는 상황.
                </p>
                <p>
                  내몸에미소는 그런 분들을 위해 시작했습니다.
                </p>
              </div>
              </div>
            </div>

            <div className="border-l-4 border-[#7B2D8B] pl-6 py-2">
              <p className="text-gray-700 font-medium leading-relaxed text-sm md:text-base lg:text-lg">
                "누구나 건강하고 행복한 삶을 누릴 자격이 있습니다.<br />
                운동에 두려움이 있거나, 단순한 체중 감량이 아닌 건강한 몸을 원하신다면<br />
                언제든지 찾아오세요."
              </p>
              <p className="text-sm text-[#7B2D8B] font-semibold mt-3">— 박미소 원장</p>
            </div>

          </div>
        </section>

        {/* 접근 방식 */}
        <section className="bg-[#FAF5FB] py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-10">내몸에미소가 다른 이유</h2>
            <div className="space-y-6">
              {[
                {
                  num: "01",
                  title: "원인부터 찾습니다",
                  desc: "첫 방문 때 근골격계 불균형과 움직임 상태를 먼저 확인합니다. 증상이 아니라 원인을 파악하는 것이 시작입니다.",
                },
                {
                  num: "02",
                  title: "내 몸에 맞는 운동을 설계합니다",
                  desc: "연령, 신체 상태, 운동 목적이 모두 다르기 때문에 개별화된 프로그램이 필요합니다. 똑같은 운동은 없습니다.",
                },
                {
                  num: "03",
                  title: "병원과 일상 사이를 채웁니다",
                  desc: "치료가 끝났는데 예전처럼 움직이기 어려운 분, 아직 병원에 갈 정도는 아닌데 불편한 분 — 그 중간 어딘가에 있는 분들을 위한 곳입니다.",
                },
              ].map((item) => (
                <div key={item.num} className="flex gap-5 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#7B2D8B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {item.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base lg:text-lg">{item.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base lg:text-lg leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 오시는 길 */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-6">오시는 길</h2>
            <div className="rounded-2xl overflow-hidden shadow-sm mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m5!3m3!1m2!1s0x357b45afc4a27497%3A0xb295dc65b7af4820!2z64K0IOuquOyXkCDrr7jshow!5e0!3m2!1sko!2skr!4v1782537380013!5m2!1sko!2skr"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="내몸에미소 위치"
              />
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 space-y-3">
              <p className="text-gray-700 font-medium">경기도 화성시 동탄 지성로 134 5층</p>
              <p className="text-gray-500 text-sm">카카오맵, 네이버 지도에서 "내몸에미소"로 검색하세요.</p>
              <div className="flex gap-3 pt-1">
                <a
                  href="https://maps.google.com/?q=내몸에미소+경기도+화성시+동탄+지성로+134"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#7B2D8B] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#6a2578] transition-colors"
                >
                  구글 지도
                </a>
                <a
                  href="https://map.naver.com/p/entry/place/1101035370"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#7B2D8B] text-[#7B2D8B] font-bold px-5 py-2.5 rounded-full text-sm hover:bg-purple-50 transition-colors"
                >
                  네이버 지도
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#7B2D8B] py-10 md:py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3">먼저 이야기를 들어드립니다</h2>
            <p className="text-purple-200 mb-8 text-sm md:text-base lg:text-lg">무료 상담으로 시작합니다.</p>
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
