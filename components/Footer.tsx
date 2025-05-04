"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface FooterProps {
  isLoggedIn?: boolean; // 선택적(물음표)
  // 향후 userLevel?: number; 로 확장 가능
}

export default function Footer({ isLoggedIn = false }: FooterProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const res = await fetch("/logout/api", { method: "GET" });
      if (res.ok) {
        // 쿠키 삭제 → 새로고침
        router.refresh();
      } else {
        console.error("로그아웃 실패:", res.status);
      }
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  // 톱니바퀴 클릭 → 드롭다운 열림/닫힘
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <footer className="flex justify-between items-center p-4 bg-gray-200 relative">
      <p className="text-sm">© 2025 My Company. All rights reserved.</p>

      {isLoggedIn ? (
        <>
          {/* 톱니바퀴 버튼 */}
          <button
            onClick={toggleMenu}
            className="text-xl absolute right-4 top-4 hover:text-gray-700"
            title="메뉴 열기"
          >
            ⚙️
          </button>

          {/* 드롭다운 (위로 펼쳐짐) */}
          {menuOpen && (
            <div
              className="absolute right-4 bottom-12 w-32 bg-white border border-gray-300 shadow-md"
              style={{ zIndex: 999 }}
            >
              {/* 관리자 링크 */}
              <a
                href="/admin"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                관리자
              </a>
              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                로그아웃
              </button>
            </div>
          )}
        </>
      ) : (
        // 미로그인 상태 → 자물쇠(로그인 링크)
        <a
          href="/login"
          className="text-xl absolute right-4 top-4 hover:text-gray-700"
          title="로그인"
        >
          🔒
        </a>
      )}
    </footer>
  );
}
