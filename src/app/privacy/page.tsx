import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 내몸에미소 동탄",
  description: "내몸에미소의 개인정보 수집 및 이용에 관한 방침입니다.",
};

const sections = [
  {
    title: "1. 수집하는 개인정보 항목",
    content: `상담 신청 시 아래 항목을 수집합니다.\n\n· 필수: 이름, 연락처(전화번호 또는 카카오톡 ID)\n· 선택: 불편 부위, 상담 내용`,
  },
  {
    title: "2. 개인정보 수집 및 이용 목적",
    content: `수집한 정보는 다음 목적으로만 사용됩니다.\n\n· 상담 예약 확인 및 안내\n· 프로그램 관련 안내 및 연락`,
  },
  {
    title: "3. 개인정보 보유 및 이용 기간",
    content: `상담 완료 후 1년간 보관 후 파기합니다.\n단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.`,
  },
  {
    title: "4. 개인정보 제3자 제공",
    content: `내몸에미소는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.\n다만, 이용자가 사전에 동의한 경우 또는 법령에 의한 경우는 예외로 합니다.`,
  },
  {
    title: "5. 개인정보 처리 위탁",
    content: `현재 개인정보 처리 업무를 외부에 위탁하고 있지 않습니다.`,
  },
  {
    title: "6. 정보주체의 권리",
    content: `이용자는 언제든지 다음 권리를 행사할 수 있습니다.\n\n· 개인정보 열람 요청\n· 오류 정정 요청\n· 삭제 요청\n· 처리 정지 요청\n\n요청은 카카오톡 채널 또는 아래 이메일로 연락해 주세요.`,
  },
  {
    title: "7. 개인정보 보호 책임자",
    content: `성명: 박미소\n직책: 대표\n연락처: 카카오톡 채널 "내몸에미소"`,
  },
  {
    title: "8. 방침 변경 안내",
    content: `이 방침은 2025년 5월 1일부터 시행됩니다.\n내용이 변경되는 경우 홈페이지를 통해 사전 공지합니다.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#9B4DAB] font-semibold text-sm mb-4 tracking-widest uppercase">Legal</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
              개인정보처리방침
            </h1>
            <p className="text-gray-500 text-sm">시행일: 2025년 5월 1일</p>
          </div>
        </section>

        <section className="py-10 md:py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-base font-bold text-gray-900 mb-3">{s.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
