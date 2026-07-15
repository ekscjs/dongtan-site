import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CheckLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
        <div className="max-w-xl mx-auto animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-24" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
