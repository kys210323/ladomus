"use client";

import React from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

/* ---------------- 인터페이스 ---------------- */
interface SubPage {
  id: number;
  type: "page" | "board";
  title: string;
  slug: string;
}
interface Board {
  id: number;
  title: string;
  slug: string | null;
  description?: string | null;
  pageId?: number | null;
}
interface PageData {
  id: number;
  type: "page" | "board";
  title: string;
  slug: string;
  content: string;
  template?: string;
  subPages?: SubPage[];
  boards?: Board[];
}
interface WidgetData {
  id: number;
  widget_type: string;
  data?: any;
  sort_order: number;
}
interface DefaultTemplateProps {
  page: PageData;
  widgets?: WidgetData[];
  children?: React.ReactNode;
}

/* ====================== DefaultTemplate ====================== */
export default function DefaultTemplate({
  page,
  widgets,
  children,
}: DefaultTemplateProps) {
  /* 1) 자식(페이지·게시판) 합치기 */
  const allChildren = [...(page.subPages || []), ...(page.boards || [])];
  const hasChildren = allChildren.length > 0;

  /* 2) 위젯 분류 */
  const safeWidgets = widgets || [];
  const headerWidget = safeWidgets.find((w) => w.widget_type === "header");
  const otherWidgets = safeWidgets.filter((w) => w.widget_type !== "header");

  /* ---------------- 헤더 ---------------- */
  const headerSection = headerWidget ? (
    <div className="relative w-full h-[400px] overflow-hidden">
      <div
        className="w-full h-full bg-center bg-cover bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${headerWidget.data?.bg || ""})` }}
      >
        <Link href={page.slug}>
          <h1 className="text-white text-3xl font-bold tracking-wide text-center hover:opacity-90">
            {page.title}
          </h1>
        </Link>
      </div>

      {hasChildren && (
        <div className="absolute bottom-0 w-full flex justify-center items-center py-2 text-sm tracking-[-0.01em] bg-[rgba(248,247,245,0.7)]">
          {allChildren.map((child) => (
            <Link
              key={child.id}
              href={child.slug || "/"}
              className="mx-2 font-semibold text-[#655c58] hover:text-[#9e896e]"
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  ) : null;

  /* ---------------- 위젯 렌더 ---------------- */
  const renderedOtherWidgets = otherWidgets.map((w) => {
    switch (w.widget_type) {
      case "image":
        return (
          <div key={w.id} className="m-0 p-0">
            <img
              src={w.data?.src || ""}
              alt={w.data?.alt || ""}
              className="w-full block"
            />
          </div>
        );
      case "text":
        return (
          <div
            key={w.id}
            className="my-6 leading-relaxed prose mx-auto"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(w.data?.content || ""),
            }}
          />
        );
      default:
        return (
          <div key={w.id} className="my-3 text-red-500">
            알 수 없는 위젯: {w.widget_type}
          </div>
        );
    }
  });

  /* ---------------- 부모 본문 (자식 없을 때) ---------------- */
  const parentContentSection = !hasChildren ? (
    <div className="m-4 p-4 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-center">{page.title}</h2>
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(page.content),
        }}
      />
    </div>
  ) : null;

  /* ---------------- 최종 렌더 ---------------- */
  return (
    <div className="m-0 p-0">
      {headerSection}
      {renderedOtherWidgets}
      {parentContentSection}
      {children}
    </div>
  );
}
