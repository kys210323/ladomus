"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // username, password 상태
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 아이디 저장 체크박스 상태
  const [saveId, setSaveId] = useState(false);

  // 컴포넌트 로드 시 localStorage에서 저장된 아이디 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("savedUsername");
    if (saved) {
      setUsername(saved);
      setSaveId(true); // 체크박스도 체크 상태로
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    try {
      // 로그인 요청 (아이디/비밀번호)
      // 경로를 '/login' → '/login/api' 로 수정!
      const res = await fetch("/login/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        // 필요하다면 CORS 상황에서 쿠키 전송이 필요할 때 credentials 추가
        // credentials: 'include',
      });

      if (res.ok) {
        // 아이디 저장 여부에 따라 localStorage 처리
        if (saveId) {
          localStorage.setItem("savedUsername", username);
        } else {
          localStorage.removeItem("savedUsername");
        }

        // 로그인 성공 → 관리자 페이지로 이동
        router.push("/admin");
      } else {
        // 로그인 실패
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "로그인에 실패했습니다.");
      }
    } catch (error) {
      setErrorMsg("서버와 통신 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* 메인 컨테이너 */}
      <div className="w-80 bg-white border border-gray-300 py-8 px-10 flex flex-col items-center mb-3">
        <h1 className="mb-6 text-2xl font-bold">MySite</h1>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          <input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="text-sm w-full mb-2 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="text-sm w-full mb-2 rounded border bg-gray-100 border-gray-300 px-2 py-2 focus:outline-none focus:border-gray-400"
          />

          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="text-xs text-red-500 mb-2">{errorMsg}</p>
          )}

          {/* 아이디 자동저장 체크박스 */}
          <label className="flex items-center mb-4 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={saveId}
              onChange={(e) => setSaveId(e.target.checked)}
              className="mr-1"
            />
            <span>아이디 저장</span>
          </label>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="bg-gray-500 text-white py-2 rounded font-medium hover:bg-gray-600"
          >
            로그인
          </button>
        </form>
      </div>

      {/* 회원가입 안내 박스 */}
      <div className="w-80 bg-white border border-gray-300 text-center py-4">
        <span className="text-sm">계정이 없으신가요?</span>
        <a
          href="/register"
          className="text-gray-500 text-sm font-semibold ml-1 hover:text-gray-600"
        >
          회원가입
        </a>
      </div>
    </div>
  );
}
