// app/templates/BoardTemplate.tsx

import React from "react";

interface PageProps {
  page: any; 
  // ↑ 실제 구조에 맞춰서 { id:number, title:string, ... } 등으로 정의 가능
}

export default function BoardTemplate({ page }: PageProps) {
  return (
    <div>
      <h2>BoardTemplate</h2>
      <p>Title: {page.title}</p>
      {/* 여기에 게시판 관련 UI를 구성... */}
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
