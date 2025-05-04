// app/admin/pages/api/hierarchy/route.ts

import { NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET() {
  try {
    const pool = getDBPool();

    // 부모 (parentId IS NULL) -- (★) hidden 제외 코드 삭제
    const [parents] = await pool.query<RowDataPacket[]>(`
      SELECT
        id, parentId, type, template, title,
        slug, content,
        seo_title, seo_description,
        sortOrder
      FROM pages
      WHERE parentId IS NULL
      ORDER BY sortOrder ASC
    `);

    // 자식 (parentId IS NOT NULL) -- (★) hidden 제외 코드 삭제
    const [children] = await pool.query<RowDataPacket[]>(`
      SELECT
        id, parentId, type, template, title,
        slug, content,
        seo_title, seo_description,
        sortOrder
      FROM pages
      WHERE parentId IS NOT NULL
      ORDER BY sortOrder ASC
    `);

    // (A) 부모 map 생성
    const parentMap = new Map<number, any>();
    (parents as any[]).forEach((p) => {
      p.children = [];
      parentMap.set(p.id, p);
    });

    // (B) 자식 연결
    (children as any[]).forEach((c) => {
      const pid = c.parentId;
      const parentObj = parentMap.get(pid);
      if (parentObj) {
        parentObj.children.push(c);
      }
    });

    // 최종 결과: 모든 부모 + 자식(숨김 포함)
    return NextResponse.json(parents);
  } catch (err: any) {
    console.error("GET /admin/pages/api/hierarchy error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
