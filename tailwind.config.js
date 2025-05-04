/** @type {import('tailwindcss').Config} */
module.exports = {
  /* ───────────────────────────────────── content ───────────────────────────────────── */
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    /* 위젯·템플릿 소스가 여기에 있다면 경로 추가 */
    "./app/admin/pages/**/*.{js,ts,jsx,tsx}",
  ],

  /* ───────────────────────────────────── safelist ────────────────────────────────────
     ▸ 동적 HTML(DB)로 삽입되는 클래스들을 빌드 시 강제로 포함
     ▸ 패턴 대신 “문자열 직접 나열” 방식으로 누락·순서 문제 차단
  ───────────────────────────────────────────────────────────────────────────────────── */
  safelist: [
    /* 정렬 ------------------------------------------------------------------------- */
    "text-left",
    "text-center",
    "text-right",
    "md:text-left",
    "md:text-center",
    "md:text-right",

    /* 글꼴 굵기 --------------------------------------------------------------------- */
    "font-thin",
    "font-light",
    "font-normal",
    "font-medium",
    "font-bold",
    "font-black",

    /* 색상 – Tailwind 기본 팔레트 --------------------------------------------------- */
    "text-red-500",
    "text-blue-500",
    "text-green-500",
    "text-gray-500",
    "text-black",

    /* 색상 – 프로젝트 확장 팔레트 ---------------------------------------------------- */
    "text-beige-gold",
    "text-my-red",
    "text-my-gray",
  ],

  /* ───────────────────────────────────── theme.extend ─────────────────────────────── */
  theme: {
    extend: {
      /* 커스텀 색상 */
      colors: {
        "beige-gold": "#9e896e",
        "my-red": "#ef4444",
        "my-gray": "#6b7280",
      },

      /* 커스텀 글자 크기 */
      fontSize: {
        "1rem": "1rem",
        "1.2rem": "1.2rem",
        "1.5rem": "1.5rem",
        "2rem": "2rem",
      },
    },
  },

  /* ───────────────────────────────────── plugins ──────────────────────────────────── */
  plugins: [
    require("@tailwindcss/container-queries"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};
