// app/admin/pages/api/hierarchy/parentsort/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    // body: [ { id, sortOrder }, ... ]
    const updates = await req.json();
    if(!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid array" }, { status:400 });
    }

    const pool = getDBPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      for (const item of updates) {
        await conn.query(
          "UPDATE pages SET sortOrder=? WHERE id=? AND parentId IS NULL",
          [item.sortOrder, item.id]
        );
      }

      await conn.commit();
      conn.release();
    } catch(err:any) {
      await conn.rollback();
      conn.release();
      throw err;
    }
    return NextResponse.json({ success: true });
  } catch (err:any) {
    console.error(err);
    return NextResponse.json({ error:String(err) }, { status:500 });
  }
}
