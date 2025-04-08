import { NextRequest, NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

/**
 * GET /admin/users
 *  - 전체 유저 목록 반환
 */
export async function GET(req: NextRequest) {
  try {
    const pool = getDBPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, role, createdAt FROM users ORDER BY id DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /admin/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /admin/users
 *  - 새 유저 생성 (username, password, role)
 * body: { username: string, password: string, role?: "admin" | "user" }
 */
export async function POST(req: NextRequest) {
  try {
    const { username, password, role } = await req.json();

    // 간단 검증
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username, password required" },
        { status: 400 }
      );
    }

    const userRole = role === "admin" ? "admin" : "user"; // 기본값 user
    const pool = getDBPool();

    // 비밀번호 암호화는 생략(bcrypt 등 추가 권장)
    await pool.query(
      "INSERT INTO users (username, password, role, createdAt) VALUES (?, ?, ?, NOW())",
      [username, password, userRole]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /admin/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

/**
 * PUT /admin/users
 *  - 기존 유저 수정 (role 변경 / password 수정 등)
 * body: { id: number, username?: string, password?: string, role?: string }
 */
export async function PUT(req: NextRequest) {
  try {
    const { id, username, password, role } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 업데이트할 필드를 동적으로 구성
    const fields: string[] = [];
    const values: any[] = [];

    if (username) {
      fields.push("username = ?");
      values.push(username);
    }
    if (password) {
      // 비밀번호 암호화 권장
      fields.push("password = ?");
      values.push(password);
    }
    if (role) {
      fields.push("role = ?");
      values.push(role);
    }

    if (fields.length === 0) {
      // 수정할 내용이 없음
      return NextResponse.json({ success: true });
    }

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    const pool = getDBPool();
    await pool.query(sql, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /admin/users error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

/**
 * DELETE /admin/users?id=xxx
 *  - 유저 삭제
 * query: id=123
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
    }

    const pool = getDBPool();
    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /admin/users error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
