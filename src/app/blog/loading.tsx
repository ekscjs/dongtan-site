import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogLoading() {
  return (
    <>
      <Header />
      <main className="pt-12 pb-12 md:pt-16 md:pb-20 px-4">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-9 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-5 w-64 bg-gray-100 rounded mb-8" />
          <div className="flex gap-2 mb-10">
            <div className="h-8 w-16 bg-gray-200 rounded-full" />
            <div className="h-8 w-20 bg-gray-100 rounded-full" />
            <div className="h-8 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b border-gray-100 pb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
                <div className="h-7 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
