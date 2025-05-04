"use client";

import React, { useState, useEffect } from "react";
import PageList from "./components/PageList";
import CreatePageForm from "./components/CreatePageForm";

/* ---------- 페이지 인터페이스 ---------- */
export interface IPage {
  id: number;
  parentId: number | null;
  type: "page" | "board" | "hidden";
  template?: string;
  title: string;
  slug: string;
  content: string;
  sortOrder?: number;
  children?: IPage[];
  seo_title?: string;
  seo_description?: string;
}

/* ===================================================================== */
/*                               컴포넌트                                */
/* ===================================================================== */
export default function AdminPages() {
  /* 1) 상위(부모) 계층 구조 */
  const [parents, setParents] = useState<IPage[]>([]);

  /* 2) 정렬/관리 스위치 (한 카드만 사용) */
  const [isSorting, setIsSorting] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  /* 3) 새 페이지 생성 폼 접힘/펼침 */
  const [showCreate, setShowCreate] = useState(false);

  /* ------------------------------------------------------------------ */
  /* A) 계층 구조 로드 */
  /* ------------------------------------------------------------------ */
  async function loadParents() {
    const res = await fetch("/admin/pages/api/hierarchy");
    if (!res.ok) return;
    const data: IPage[] = await res.json();

    /* 부모·자식 sortOrder 정렬 */
    data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    data.forEach((p) => {
      if (p.children) {
        p.children.sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0));
      }
    });

    setParents(data);
  }

  useEffect(() => {
    loadParents();
  }, []);

  /* ------------------------------------------------------------------ */
  /* B) 정렬/관리 처리 */
  /* ------------------------------------------------------------------ */
  const handleCancelSorting = () => {
    setIsSorting(false);
    loadParents(); // 원복
  };
  const handleSaveSorting = () => {
    setIsSorting(false);
    /* 필요 시 정렬 저장 로직 추가 */
  };

  /* ------------------------------------------------------------------ */
  /* C) 렌더 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="p-6 text-sm max-w-4xl mx-auto">
      {/* (1) 전체 페이지 목록 카드 */}
      <div className="bg-white border border-gray-200 p-4 rounded shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">
            전체 페이지 목록
            {isSorting && (
              <span className="ml-2 text-xs text-gray-500">
                (드래그로 순서 정렬)
              </span>
            )}
          </h1>

          <div className="flex space-x-2">
            {!isSorting ? (
              <button
                onClick={() => setIsSorting(true)}
                className="bg-gray-200 px-3 py-1 text-xs rounded"
              >
                정렬
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelSorting}
                  className="bg-red-100 px-3 py-1 text-xs rounded"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveSorting}
                  className="bg-blue-100 px-3 py-1 text-xs rounded"
                >
                  저장
                </button>
              </>
            )}

            <button
              onClick={() => setIsManaging(!isManaging)}
              className="bg-gray-200 px-3 py-1 text-xs rounded"
            >
              {isManaging ? "관리 해제" : "관리"}
            </button>
          </div>
        </div>

        {/* PageList가 내부에서 메인/기타 구역을 나눠 렌더 */}
        <PageList
          parents={parents}
          setParents={setParents}
          isSorting={isSorting}
          isManaging={isManaging}
          loadParents={loadParents}
          onEditWidgets={(pageId, seoTitle) => {
            window.location.href = `/admin/pages/widgets?pageId=${pageId}&title=${encodeURIComponent(
              seoTitle || "",
            )}`;
          }}
        />
      </div>

      {/* (2) 페이지·게시판 생성 카드 */}
      <div className="bg-white border border-gray-200 p-4 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">페이지 & 게시판 생성</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-blue-200 px-3 py-1 text-xs rounded"
          >
            {showCreate ? "접기" : "생성"}
          </button>
        </div>

        {showCreate && (
          <div className="mt-2">
            <CreatePageForm parents={parents} loadParents={loadParents} />
          </div>
        )}
      </div>
    </div>
  );
}
