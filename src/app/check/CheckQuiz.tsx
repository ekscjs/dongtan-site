"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const questions = [
  {
    q: "어떤 불편함이 있으세요?",
    options: [
      { label: "허리·무릎·어깨 등 통증", value: "pain" },
      { label: "수술·부상 후 회복 중", value: "rehab" },
      { label: "자세·체형이 신경 쓰여요", value: "posture" },
      { label: "전반적으로 몸 관리가 필요해요", value: "general" },
    ],
  },
  {
    q: "얼마나 됐나요?",
    options: [
      { label: "1개월 미만", value: "short" },
      { label: "1~6개월", value: "mid" },
      { label: "6개월 이상", value: "long" },
    ],
  },
  {
    q: "병원 치료를 받아보셨나요?",
    options: [
      { label: "받았는데 계속 재발해요", value: "relapse" },
      { label: "치료 중이에요", value: "ongoing" },
      { label: "받지 않았어요", value: "none" },
    ],
  },
];

const results: Record<string, { title: string; desc: string; href: string }> = {
  pain: {
    title: "통증 완화 운동",
    desc: "통증의 원인은 대부분 잘못된 움직임 패턴에 있습니다. 증상이 아닌 원인을 찾아 해결해드립니다.",
    href: "/programs#pain",
  },
  rehab: {
    title: "재활 프로그램",
    desc: "치료는 끝났는데 몸이 예전 같지 않다면, 병원과 일상 사이의 빈틈을 채워드립니다.",
    href: "/programs#rehab",
  },
  posture: {
    title: "체형교정 프로그램",
    desc: "굽은 등, 거북목, 골반 틀어짐 — 자세 문제를 근본 원인부터 잡아드립니다.",
    href: "/programs#posture",
  },
  general: {
    title: "맞춤 상담",
    desc: "어떤 프로그램이 맞는지 모를 때, 무료 상담으로 내 몸 상태를 먼저 파악합니다.",
    href: "/programs",
  },
};

export default function CheckQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (value: string) => {
    const next = [...answers, value];
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length); // show result
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
  };

  const result = results[answers[0]] ?? results["general"];
  const progress = Math.round((step / questions.length) * 100);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF5FB] py-20 px-4">
        <div className="max-w-xl mx-auto">

          {step < questions.length ? (
            <>
              {/* 진행 바 */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>{step + 1} / {questions.length}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-[#7B2D8B] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* 질문 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-[#9B4DAB] uppercase tracking-widest mb-4">내 몸 상태 체크</p>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">
                  {questions[step].q}
                </h2>
                <div className="space-y-3">
                  {questions[step].options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm md:text-base hover:border-[#7B2D8B] hover:text-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* 결과 */
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <span className="inline-block bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full mb-6">
                추천 프로그램
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{result.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-10">{result.desc}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="http://pf.kakao.com/_XGxbMG/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#7B2D8B] text-white font-bold py-4 px-6 rounded-full hover:bg-[#6a2578] transition-colors"
                >
                  무료 상담하기
                </a>
                <a
                  href={result.href}
                  className="flex-1 border border-gray-200 text-gray-500 font-semibold py-4 px-6 rounded-full hover:border-[#7B2D8B] hover:text-[#7B2D8B] transition-colors"
                >
                  프로그램 자세히 보기
                </a>
              </div>
              <button
                onClick={reset}
                className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline"
              >
                다시 체크하기
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
