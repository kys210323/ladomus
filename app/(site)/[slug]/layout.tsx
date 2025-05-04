import React from "react";
import { notFound } from "next/navigation";
import DefaultTemplate from "@/app/templates/DefaultTemplate";
import LandingTemplate from "@/app/templates/LandingTemplate";
import BoardTemplate from "@/app/templates/BoardTemplate";
import { getDBPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

/* ------------- ISR·동적 설정 ------------- */
export const revalidate    = 0;
export const dynamic       = "force-dynamic";
export const dynamicParams = true;

/* --- 인터페이스들 (동일) --- */
interface PageRow extends RowDataPacket {
  id: number;
  type: "page" | "board";
  title: string;
  slug: string;
  content: string;
  template?: string;
  parentId?: number | null;
}
interface WidgetRow extends RowDataPacket {
  id: number;
  page_id: number;
  widget_type: string;
  data: string;
  sort_order: number;
}
interface SubPageRow extends RowDataPacket {
  id: number;
  type: "page" | "board";
  title: string;
  slug: string;
  parentId?: number | null;
}

/* =================================================================== */
/*                           LAYOUT COMPONENT                           */
/* =================================================================== */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  /* 1) params 해소 */
  const { slug } = await params;
  const parentSlug = `/${slug}`;

  /* 2) 부모 페이지 조회 */
  const pool = getDBPool();
  const [rows] = await pool.query<PageRow[]>(
    "SELECT * FROM pages WHERE slug=? LIMIT 1",
    [parentSlug],
  );
  if (!rows?.length) notFound();
  const page = rows[0];

  /* 3) 자식 목록 */
  let subPages: SubPageRow[] = [];
  if (page.type === "page") {
    const [childRows] = await pool.query<SubPageRow[]>(
      "SELECT id, type, title, slug FROM pages WHERE parentId=? ORDER BY id ASC",
      [page.id],
    );
    subPages = childRows;
  }

  /* 4) 부모 위젯 */
  const [widgetRows] = await pool.query<WidgetRow[]>(
    "SELECT * FROM page_widgets WHERE page_id=? ORDER BY sort_order ASC, id ASC",
    [page.id],
  );
  const widgets = widgetRows.map((w) => ({
    ...w,
    data: w.data ? JSON.parse(w.data) : {},
  }));

  /* 5) 최종 page 객체 */
  const finalPage = { ...page, subPages };

  /* 6) 템플릿 분기 */
  switch (page.template) {
    case "landing":
      return (
        <LandingTemplate page={finalPage} widgets={widgets}>
          {children}
        </LandingTemplate>
      );
    case "board":
      return (
        <BoardTemplate page={finalPage} widgets={widgets}>
          {children}
        </BoardTemplate>
      );
    default:
      return (
        <DefaultTemplate page={finalPage} widgets={widgets}>
          {children}
        </DefaultTemplate>
      );
  }
}
