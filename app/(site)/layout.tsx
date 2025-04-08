import { cookies } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 쿠키로 로그인 여부 확인
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const isLoggedIn = !!userId;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-8">
        {children}
      </main>

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  );
}
