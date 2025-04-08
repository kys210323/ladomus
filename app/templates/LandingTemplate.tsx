// app/templates/LandingTemplate.tsx
import React from "react";

// 페이지 객체 구조에 맞춰 Props 정의 (예시)
interface PageProps {
  page: {
    id: number;
    title: string;
    content: string;
    // 필요한 필드 더 추가
  };
}

// LandingTemplate: 예: 랜딩 페이지 스타일, 배경, Hero 섹션 등
export default function LandingTemplate({ page }: PageProps) {
  return (
    <div style={{ padding: "2rem", backgroundColor: "#eef" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        (Landing Template) {page.title}
      </h2>
      <p>
        여기에 랜딩페이지용 Hero 영역, 슬라이드, 버튼 등을 자유롭게 배치하세요.
      </p>
      {/* 내용 표시 (예: HTML) */}
      <div
        style={{ marginTop: "1rem" }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
