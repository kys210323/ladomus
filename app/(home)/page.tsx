"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteHome from "@/components/SiteHome"; // 배경 영상 컴포넌트

export default function HomePage() {
  // (★) pathname 훅
  const pathname = usePathname();

  return (
    <div style={{ position: "relative" }}>
      {/* 헤더 절대 배치 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 10,
        }}
      >
        <Header />
      </div>

      {/* 
        (★) SiteHome 에 key={pathname}
        → 라우트가 변경(다른 페이지 → '/')되면 SiteHome 완전 언마운트 후 재마운트 
        → 동영상 로직(음소거/볼륨=0)이 다시 초기화 
      */}
      <SiteHome key={pathname} />

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
