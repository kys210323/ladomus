// app/admin/pages/api/hierarchy/childsort/route.ts

import { NextRequest, NextResponse } from "next/server"; // ✅ 최상단 import
import { getDBPool } from "@/lib/db";                    // ✅ 최상단 import

export async function PATCH(req: NextRequest) {
  try {
    // Body: { parentId, children: [ {id, sortOrder}, ... ] }
    const { parentId, children } = await req.json();

    if (!children || !Array.isArray(children)) {
      return NextResponse.json(
        { error: "Invalid children array" },
        { status: 400 }
      );
    }

    const pool = getDBPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Loop & update sortOrder for each child
      for (const c of children) {
        await conn.query(
          "UPDATE pages SET sortOrder=? WHERE id=? AND parentId=?",
          [c.sortOrder, c.id, parentId]
        );
      }

      await conn.commit();
      conn.release();

    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err; // re-throw the error
    }

    // Success
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
