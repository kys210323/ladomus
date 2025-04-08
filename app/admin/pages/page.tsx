"use client";

import React, { useState, useEffect } from "react";
import PageList from "./components/PageList";
import CreatePageForm from "./components/CreatePageForm";

/** IPage: 페이지 데이터 구조 (부모/자식 공통) */
export interface IPage {
  id: number;
  parentId: number | null;
  type: "page"|"board";
  template?: string; // ★ 템플릿 필드
  title: string;
  slug: string;
  content: string;
  sortOrder?: number;
  children?: IPage[];
}

export default function AdminPages() {
  const [parents, setParents] = useState<IPage[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  // 데이터 로드
  async function loadParents() {
    const res = await fetch("/admin/pages/api/hierarchy");
    if (!res.ok) return;
    const data: IPage[] = await res.json();
    // 정렬
    data.sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0));
    data.forEach((p)=>{
      if(p.children){
        p.children.sort((x,y)=>(x.sortOrder??0)-(y.sortOrder??0));
      }
    });
    setParents(data);
  }

  useEffect(() => {
    loadParents();
  }, []);

  // 정렬 취소/저장
  function handleCancelSorting() {
    setIsSorting(false);
    loadParents(); // 원복
  }
  function handleSaveSorting() {
    setIsSorting(false);
  }

  return (
    <div className="p-6 text-sm max-w-4xl mx-auto">
      {/* 상단 박스: 목록, 정렬/관리 버튼 */}
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
                onClick={()=>setIsSorting(true)}
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
              onClick={()=>setIsManaging(!isManaging)}
              className="bg-gray-200 px-3 py-1 text-xs rounded"
            >
              {isManaging ? "관리 해제" : "관리"}
            </button>
          </div>
        </div>

        {/* 페이지 목록 (DnD/편집/삭제) */}
        <PageList
          parents={parents}
          setParents={setParents}
          isSorting={isSorting}
          isManaging={isManaging}
          loadParents={loadParents}
        />
      </div>

      {/* 새 페이지 생성 */}
      <CreatePageForm
        parents={parents}
        loadParents={loadParents}
      />
    </div>
  );
}
