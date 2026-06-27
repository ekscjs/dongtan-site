import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import KakaoButton from "@/components/KakaoButton";
import {
  ArrowRightIcon,
} from "@/components/Icons";

const stats = [
  { value: "4년+", label: "동탄 센터 오픈" },
  { value: "200명+", label: "누적 회원" },
  { value: "90%", label: "재등록률" },
];

const symptoms = [
  { text: '허리·무릅·어깨가 아픈데 검사하면 "이상 없다"는 분' },
  { text: "치료받으면 잠꺜 낙다가 다시 재발하는 분" },
  { text: '의사에게 "운동 하세요" 들었는데 어떤 운동인지 모르는 분' },
  { text: "거북목·괽은 등·골반 틀어짐이 신경 쓰이는 분" },
  { text: "나이 들면서 몸이 예전 같지 않다고 느끼는 분" },
  { text: "운동을 시작하고 싶은데 내 몸에 맞는 방법을 모르는 분" },
];

const programs = [
  {
    title: "통증 완화 운동",
    desc: "팔이 잘 안 올라가거나 무릅이 빰근한 것도 원인이 있습니다. 일상의 불편함을 회복합니다.",
    color: "border-[#7B2D8B]",
  },
  {
    title: "재활",
    desc: "수술 후 또는 부상 후 몸을 회복하고 싶을 때. 병원과 일상 사이, 그 중간을 채워드립니다.",
    color: "border-[#7B2D8B]",
  },
  {
    title: "체형교정",
    desc: "괽은 등, 거북목, 골반 틀어짐. 자세 문제를 근본 원인부터 잡아드립니다.",
    color: "border-[#7B2D8B]",
  },
];

const steps: { step: string; title: string; desc: string }[] = [
  {
    step: "1",
    title: "무료 상담",
    desc: "카카오톡으로 편하게 말씀해 주세요. 바로 연결됩니다.",
  },
  {
    step: "2",
    title: "1회 체험",
    desc: "직접 움직임을 확인하고 문제 원인을 파악합니다.",
  },
  {
    step: "3",
    title: "맞춤 프로그램",
    desc: "원인에 맞는 운동 방법으로 실질적인 변화를 만들어 드립니다.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>

        <section className="bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-4 tracking-widest uppercase">
              동탄 기능개선 · 재활 · 체형교정 전문
            </p>
            <h1 className="text-2xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              여기저기 다녀봤는데,
              <br />
              <span className="text-[#7B2D8B]">왜 계속 아프고 불편할까요?</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-10 leading-relaxed break-keep">
              허리, 무릅, 어깨 — 통증의 원인은 대부분 움직임에 있습니다.
              <br className="hidden sm:block" />{" "}
              내몸에미소가 원인부터 찾아드립니다.
            </p>
            <KakaoButton className="group inline-flex items-center gap-2 bg-[#7B2D8B] text-white font-bold px-8 py-4 rounded-full text-base md:text-lg hover:bg-[#9B4DAB] transition-all hover:scale-[1.03]">
              카카오로 상담하기
              <ArrowRightIcon size={18} className="transition-transform group-hover:translate-x-1" />
            </KakaoButton>
            <p className="text-sm text-gray-400 mt-4">경기도 화성시 동탄 지성로 134 5층</p>
          </div>
        </section>

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

        <section className="py-12 md:py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
              이런 분들이 찾아오십니다
            </h2>
            <p className="text-center text-gray-500 mb-12 text-sm md:text-base">
              아주 아프지 않아도, 불편함을 느끼고 있다면 충분합니다
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {symptoms.map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl px-6 py-5 border-l-4 border-[#7B2D8B]">
                  <p className="text-gray-700 font-medium leading-relaxed text-sm md:text-base tracking-tight">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#FAF5FB] py-12 md:py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">전문 프로그램</h2>
            <p className="text-center text-gray-500 mb-12 text-sm md:text-base">
              문제의 원인을 먼저 파악하고, 그에 맞는 방법으로 해결합니다
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {programs.map((p, i) => (
                <div key={i} className={`bg-white rounded-2xl p-8 border-t-4 ${p.color} shadow-sm`}>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/programs" className="text-[#7B2D8B] font-semibold hover:underline text-sm md:text-base">
                동탄 재활·체형교정 프로그램 자세히 보기 →
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
              이렇게 시작합니다
            </h2>
            <div className="space-y-8">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="shrink-0 w-11 h-11 rounded-full bg-[#7B2D8B] flex items-center justify-center">
                    <span className="text-white font-bold text-base">{s.step}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-xs font-semibold text-[#9B4DAB] uppercase tracking-widest mb-3">
              센터 & 수업 시간
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">
              이렇게 운동합니다
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/center-2.jpg" alt="내몸에미소 센터 내부" width={800} height={800} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/training-1.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/training-2.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/training-3.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/training-4.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/center-1.jpg" alt="내몸에미소 센터 내부" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/training-6.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/training-7.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/training-8.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/training-9.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/추가1.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/추가3.png" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Image src="/gallery/추가4.jpg" alt="1:1 운동 지도" width={400} height={400} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FAF5FB] py-10 md:py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-3 tracking-widest uppercase">실제 회원 후기</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">직접 확인해보세요</h2>
            <p className="text-gray-500 mb-8 text-sm md:text-base">
              네이버 플레이스에 실제 회원분들의 후기가 쌓여 있습니다
            </p>
            <a
              href="https://map.naver.com/p/entry/place/1101035370"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 border-2 border-[#7B2D8B] text-[#7B2D8B] font-bold px-8 py-4 rounded-full text-base hover:bg-[#7B2D8B] hover:text-white transition-all hover:scale-[1.03]"
            >
              네이버 후기 보러가기
              <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </section>

        <section className="py-10 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10">오시는 길</h2>
            <div className="rounded-2xl overflow-hidden shadow-sm mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3175.123456789!2d127.073!3d37.209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b4b2b2b2b2b2b%3A0x0!2z64yA66Oo7JeQ66GcIOyEseyKpOydtA!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr&q=내몸에미소+경기도+화성시+동탄+지성로+134+5층"
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="내몸에미소 위치"
              />
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 flex flex-col sm:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#7B2D8B] uppercase tracking-widest mb-1">주소</p>
                  <p className="text-gray-800 font-medium">경기도 화성시 동탄 지성로 134 5층</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#7B2D8B] uppercase tracking-widest mb-1">주차</p>
                  <p className="text-gray-800 font-medium">건물 내 주차 가능</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#7B2D8B] uppercase tracking-widest mb-1">운영 시간</p>
                  <p className="text-gray-800 font-medium">평일 10:00 – 22:00</p>
                  <p className="text-gray-600 text-sm">주말 · 공휴일 휴무</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <a
                  href="https://maps.google.com/?q=내몸에미소+경기도+화성시+동탄+지성로+134"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#7B2D8B] text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-[#6a2578] transition-colors text-center"
                >
                  구글 지도로 보기
                </a>
                <a
                  href="https://map.naver.com/p/entry/place/1101035370"
                  target="_blank"
                  rel="noopener noreferrer"
