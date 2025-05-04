import { notFound } from "next/navigation";
import DefaultTemplate from "@/app/templates/DefaultTemplate";
import LandingTemplate from "@/app/templates/LandingTemplate";
import BoardTemplate from "@/app/templates/BoardTemplate";
import ChildTemplate from "@/app/templates/ChildTemplate";
import { getDBPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export const dynamic       = "force-dynamic";
export const dynamicParams = true;

/* ---- DB Row 타입 ---- */
interface PageRow extends RowDataPacket {
  id: number;
  type: "page" | "board";
  title: string;
  slug: string;
  content: string;
  template?: string;
}
interface WidgetRow extends RowDataPacket {
  id: number;
  page_id: number;
  widget_type: string;
  data: string;
  sort_order: number;
}

interface ChildPageProps {
  params: Promise<{ slug: string; childSlug: string }>;
}

export default async function ChildPage({ params }: ChildPageProps) {
  /* 1) await params */
  const { slug, childSlug } = await params;
  const joinedSlug = `/${slug}/${childSlug}`;

  /* 2) 페이지·위젯 조회 */
  const pool = getDBPool();

  const [pageRows] = await pool.query<PageRow[]>(
    "SELECT * FROM pages WHERE slug=? LIMIT 1",
    [joinedSlug],
  );
  if (!pageRows?.length) notFound();
  const page = pageRows[0];

  const [widgetRows] = await pool.query<WidgetRow[]>(
    "SELECT * FROM page_widgets WHERE page_id=? ORDER BY sort_order ASC, id ASC",
    [page.id],
  );
  const widgets = widgetRows.map((w) => ({
    ...w,
    data: w.data ? JSON.parse(w.data) : {},
  })) as any[];   // 타입 넓힘(필요하면 ChildWidgetData[]로 정의·캐스팅)

  /* 3) 템플릿 분기 */
  switch (page.template) {
    case "board":
      return <BoardTemplate   page={page} widgets={widgets} />;
    case "landing":
      return <LandingTemplate page={page} widgets={widgets} />;
    case "child":
      return <ChildTemplate   page={page} widgets={widgets} />;  {/* ✅ page 포함 */}
    default:
      return <DefaultTemplate page={page} widgets={widgets} />;
  }
}
