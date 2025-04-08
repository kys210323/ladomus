"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

/** 페이지 인터페이스 (부모 + 자식 구조) */
interface IPage {
  id: number;
  parentId: number | null;
  type: "page" | "board";
  template?: string;
  title: string;
  slug: string;
  content: string;
  sortOrder?: number;
  children?: IPage[];
}

export default function Header() {
  // 상위(부모) 페이지들
  const [topLevelPages, setTopLevelPages] = useState<IPage[]>([]);

  // 컴포넌트 마운트 시, 부모 페이지 목록 로드
  useEffect(() => {
    async function loadParents() {
      try {
        const res = await fetch("/admin/pages/api/hierarchy");
        if (res.ok) {
          const data: IPage[] = await res.json();
          // 필요하면 parentId=null 필터링: data.filter(p=>p.parentId===null)
          setTopLevelPages(data);
        }
      } catch (err) {
        console.error("헤더 상위 페이지 로드 실패:", err);
      }
    }
    loadParents();
  }, []);

  return (
    // 최외곽 헤더: 전체 폭, 어두운 반투명 배경, 수평 중앙 정렬
    <header className="w-full bg-black/70 flex justify-center">
      {/* 내부 컨테이너: 최대 폭 1280px, 좌우 패딩, 상하 패딩 등 */}
      <div className="w-full max-w-[1280px] px-4 py-3 flex items-center justify-between">
        {/* 왼쪽 로고영역 */}
        <div className="flex items-center">
          <Link href="/">
            {/* <Link> 자체가 블록/인라인을 제어하므로 특별한 스타일이 필요없다면 생략 가능 */}
            <Image
              src="/images/logo.png"
              alt="로고"
              width={120}
              height={40}
              priority
            />
          </Link>
        </div>

        {/* 오른쪽 메뉴(nav) */}
        <nav className="flex items-center">
          {topLevelPages.map((page) => (
            <Link
              key={page.id}
              href={page.slug}
              className="ml-4 text-white font-medium no-underline hover:underline"
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
