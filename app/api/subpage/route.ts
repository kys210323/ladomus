import { NextRequest, NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

interface PageRow extends RowDataPacket {
  id: number;
  content: string;
}

interface WidgetRow extends RowDataPacket {
  id: number;
  page_id: number;
  widget_type: string;
  data: string;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "no slug" }, { status: 400 });
  }

  const pool = getDBPool();
  // 1) 자식 페이지 찾기
  const [pageRows] = await pool.query<PageRow[]>(
    "SELECT id, content FROM pages WHERE slug=? LIMIT 1",
    [slug]
  );
  if (!pageRows || pageRows.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const pageData = pageRows[0];

  // 2) 위젯 목록
  const [widgetRows] = await pool.query<WidgetRow[]>(
    "SELECT * FROM page_widgets WHERE page_id=?",
    [pageData.id]
  );
  const widgets = widgetRows.map((w) => ({
    ...w,
    data: JSON.parse(w.data || "{}"),
  }));

  // 3) 응답
  return NextResponse.json({
    content: pageData.content || "",
    widgets,
  });
}
