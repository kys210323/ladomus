// app/templates/BoardTemplate.tsx
import React from "react";

interface BoardTemplateProps {
  page: {
    id: number;
    title: string;
    slug: string;
    template?: string;
    content: string;
  };
  widgets: {
    id: number;
    widget_type: string;
    data: any;
    sort_order: number;
  }[];
  children?: React.ReactNode; // ★ 추가
}

export default function BoardTemplate({
  page,
  widgets,
  children, // ★ 파라미터로 수신
}: BoardTemplateProps) {
  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <h1>{page.title}</h1>
      <div style={{ marginBottom: "10px" }}>{page.content}</div>

      {/* 위젯 목록 */}
      {widgets.map((w) => {
        if (w.widget_type === "image") {
          return (
            <div key={w.id} style={{ margin: "10px 0" }}>
              <img
                src={w.data?.src || ""}
                alt={w.data?.alt || ""}
                style={{ maxWidth: "100%" }}
              />
            </div>
          );
        }
        // 기본 출력
        return (
          <div key={w.id} style={{ margin: "10px 0", color: "gray" }}>
            위젯 타입: {w.widget_type}
            <br />
            {JSON.stringify(w.data)}
          </div>
        );
      })}

      {/* layout.tsx에서 넘긴 children (자식 라우트 등) */}
      {children}
    </div>
  );
}
