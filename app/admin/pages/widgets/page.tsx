"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WidgetList from "../components/WidgetList";
import WidgetForm from "../components/WidgetForm";

/**
 * /admin/pages/widgets?pageId=xxx&title=... 
 */
export default function WidgetManagerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pidStr = searchParams.get("pageId");
  const pageTitle = searchParams.get("title"); // ← 여기에 실제 SEO 타이틀 값이 들어감
  const pageId = pidStr ? parseInt(pidStr, 10) : null;
  

  useEffect(() => {
    if (!pageId) {
      alert("pageId 파라미터가 없습니다.");
      router.push("/admin/pages");
    }
  }, [pageId, router]);

  if (!pageId) return null;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 text-sm flex flex-col">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-4">
        {/* ★ pageTitle이 있으면 그걸 표시, 없으면 "페이지 {pageId}" */}
        <h2 className="text-xl font-bold">{pageTitle || `페이지 ${pageId}`}</h2>
        <button
          onClick={() => router.push("/admin/pages")}
          className="px-3 py-1 rounded bg-gray-200 text-xs"
        >
          목록으로
        </button>
      </div>

      {/* (A) 위젯 목록 */}
      <div className="w-full mb-4 bg-white border border-gray-300 rounded p-4">
        <h3 className="text-md font-semibold mb-2">
          위젯 목록 (page_id: {pageId})
        </h3>
        <WidgetList pageId={pageId} />
      </div>

      {/* (B) 위젯 생성 */}
      <div className="w-full bg-white border border-gray-300 rounded p-4">
        <h3 className="text-md font-semibold mb-2">위젯 생성</h3>
        <WidgetForm
          pageId={pageId}
          onCreated={() => {
            // 필요 시 WidgetList 갱신
          }}
        />
      </div>
    </div>
  );
}
