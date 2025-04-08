// app/templates/DefaultTemplate.tsx
import React from "react";

interface PageProps {
  page: {
    id: number;
    title: string;
    content: string;
    // 기타 needed fields
  };
}

// DefaultTemplate: 기본적/공통적 디자인
export default function DefaultTemplate({ page }: PageProps) {
  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
        (Default Template) {page.title}
      </h2>
      <div
        style={{ color: "#333" }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
