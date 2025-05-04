import { NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";
import type { OkPacket, RowDataPacket } from "mysql2/promise";

/**
 * GET /admin/pages/api/widgets
 *   - 예) /admin/pages/api/widgets?page_id=123
 *   - 예) /admin/pages/api/widgets?board_id=456
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("page_id");
  const boardId = searchParams.get("board_id");

  try {
    const pool = getDBPool();
    let sql = "SELECT * FROM page_widgets";
    const params: any[] = [];

    // 여러 조건(page_id, board_id)이 들어올 수 있으므로, WHERE 조건 누적
    const whereClauses: string[] = [];

    if (pageId) {
      whereClauses.push("page_id = ?");
      params.push(pageId);
    }
    if (boardId) {
      whereClauses.push("board_id = ?");
      params.push(boardId);
    }

    if (whereClauses.length > 0) {
      sql += " WHERE " + whereClauses.join(" AND ");
    }
    sql += " ORDER BY sort_order ASC, id ASC";

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET widgets error:", err);
    return NextResponse.json({ error: "Error fetching widgets" }, { status: 500 });
  }
}

/**
 * POST /admin/pages/api/widgets
 *   Body JSON 예시:
 *   {
 *     "page_id": 123,        // or "board_id": 456
 *     "widget_type": "text",
 *     "data": { "content": "hello world" },
 *     "sort_order": 1
 *   }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { page_id, board_id, widget_type, data, sort_order } = body;

    // 최소한 page_id나 board_id 중 하나는 필요하다고 가정
    if (!page_id && !board_id) {
      return NextResponse.json(
        { error: "Either page_id or board_id is required" },
        { status: 400 }
      );
    }
    if (!widget_type) {
      return NextResponse.json(
        { error: "widget_type is required" },
        { status: 400 }
      );
    }

    // data는 JSON.stringify
    const dataStr = data ? JSON.stringify(data) : null;

    const pool = getDBPool();

    // INSERT
    // page_id, board_id 중 하나만 쓰는 구조라면,
    // NULL이 될 수 있는 컬럼에 null을 할당
    const sql = `
      INSERT INTO page_widgets (page_id, board_id, widget_type, data, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      page_id || null,
      board_id || null,
      widget_type,
      dataStr,
      sort_order || 0,
    ];

    const [result] = await pool.query<OkPacket>(sql, params);
    const insertedId = result.insertId;

    // 새로 추가된 레코드 조회
    const [insertedRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM page_widgets WHERE id = ?",
      [insertedId]
    );

    return NextResponse.json(insertedRows[0]);
  } catch (err: any) {
    console.error("POST widgets error:", err);
    return NextResponse.json({ error: "Error creating widget" }, { status: 500 });
  }
}
