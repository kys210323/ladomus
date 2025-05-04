// app/admin/pages/api/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";

// POST: 새 페이지 생성
export async function POST(req: NextRequest) {
  try {
    const {
      parentId,
      type,            // ★ 추가: "page"|"board"|"hidden" 등
      template,
      title,
      slug,
      content,
      seo_title,
      seo_description,
    } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: "title, slug required" }, { status: 400 });
    }

    // content가 null/undefined이면 빈 문자열
    const safeContent = content ?? "";

    const pid = parentId === 0 ? null : parentId;
    const pool = getDBPool();

    // ★ DB Insert 시 type 필드도 함께
    await pool.query(
      `INSERT INTO pages
       (parentId, type, template, title, slug, content, seo_title, seo_description)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        pid,
        type, // ★
        template,
        title,
        slug,
        safeContent,
        seo_title,
        seo_description,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /admin/pages/api error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT: 페이지 수정
export async function PUT(req: NextRequest) {
  try {
    const {
      id,
      type,            // ★ 추가: "page"|"board"|"hidden" 등
      template,
      title,
      slug,
      content,
      seo_title,
      seo_description,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // content가 null/undefined이면 빈 문자열
    const safeContent = content ?? "";

    const pool = getDBPool();

    // ★ UPDATE 시에도 type 필드 반영
    await pool.query(
      `UPDATE pages
       SET type=?, template=?, title=?, slug=?, content=?,
           seo_title=?, seo_description=?
       WHERE id=?`,
      [
        type,  // ★
        template,
        title,
        slug,
        safeContent,
        seo_title,
        seo_description,
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /admin/pages/api error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE: 페이지 삭제 (?id=...)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "missing ?id" }, { status: 400 });
    }

    const pool = getDBPool();
    await pool.query("DELETE FROM pages WHERE id=?", [id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /admin/pages/api error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
