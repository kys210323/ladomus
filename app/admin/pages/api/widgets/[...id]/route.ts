import { NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";
import type { RowDataPacket, OkPacket } from "mysql2/promise";

/**
 * GET /admin/pages/api/widgets/[id]
 *   - 특정 위젯 상세 조회
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const widgetId = params.id;
  try {
    const pool = getDBPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM page_widgets WHERE id = ?",
      [widgetId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("GET widget error:", err);
    return NextResponse.json({ error: "Error fetching widget" }, { status: 500 });
  }
}

/**
 * PATCH /admin/pages/api/widgets/[id]
 *   Body JSON 예시:
 *   {
 *     "page_id": 123,          // or board_id: 456
 *     "widget_type": "text",
 *     "data": { "content": "hello" },
 *     "sort_order": 3
 *   }
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const widgetId = params.id;

  try {
    const body = await request.json();
    const { widget_type, data, sort_order, page_id, board_id } = body;

    // 동적으로 업데이트할 필드 구성
    const updates: string[] = [];
    const values: any[] = [];

    if (widget_type !== undefined) {
      updates.push("widget_type = ?");
      values.push(widget_type);
    }
    if (data !== undefined) {
      updates.push("data = ?");
      values.push(JSON.stringify(data));
    }
    if (sort_order !== undefined) {
      updates.push("sort_order = ?");
      values.push(sort_order);
    }
    if (page_id !== undefined) {
      updates.push("page_id = ?");
      values.push(page_id);
    }
    if (board_id !== undefined) {
      updates.push("board_id = ?");
      values.push(board_id);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE page_widgets
      SET ${updates.join(", ")}
      WHERE id = ?
    `;
    values.push(widgetId);

    const pool = getDBPool();
    await pool.query<OkPacket>(sql, values);

    // 수정된 레코드 반환
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM page_widgets WHERE id = ?",
      [widgetId]
    );
    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }
    return NextResponse.json(updatedRows[0]);
  } catch (err: any) {
    console.error("PATCH widget error:", err);
    return NextResponse.json({ error: "Error updating widget" }, { status: 500 });
  }
}

/**
 * DELETE /admin/pages/api/widgets/[id]
 *   - 위젯 삭제
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const widgetId = params.id;
  try {
    const pool = getDBPool();
    await pool.query<OkPacket>(
      "DELETE FROM page_widgets WHERE id = ?",
      [widgetId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE widget error:", err);
    return NextResponse.json({ error: "Error deleting widget" }, { status: 500 });
  }
}
