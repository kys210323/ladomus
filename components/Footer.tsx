"use client";

import React from "react";

export default function Footer({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <footer className="flex justify-between items-center p-4 bg-gray-200 relative">
      <p className="text-sm">© 2025 My Company. All rights reserved.</p>

      {isLoggedIn ? (
        // 로그인 상태 → 톱니바퀴(⚙️) → /admin
        <a
          href="/admin"
          className="text-xl absolute right-4 top-4 hover:text-gray-700"
          title="관리자 페이지"
        >
          ⚙️
        </a>
      ) : (
        // 미로그인 상태 → 자물쇠(🔒) → /login
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
