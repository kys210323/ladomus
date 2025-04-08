// app/admin/pages/api/hierarchy/route.ts
import { NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET(){
  try {
    const pool = getDBPool();
    // 부모
    const [parents] = await pool.query<RowDataPacket[]>(`
      SELECT id, parentId, type, template, title, slug, content, sortOrder
      FROM pages
      WHERE parentId IS NULL
      ORDER BY sortOrder ASC
    `);
    // 자식
    const [children] = await pool.query<RowDataPacket[]>(`
      SELECT id, parentId, type, template, title, slug, content, sortOrder
      FROM pages
      WHERE parentId IS NOT NULL
      ORDER BY sortOrder ASC
    `);

    // map
    const parentMap = new Map<number,any>();
    (parents as any[]).forEach((p)=>{
      p.children = [];
      parentMap.set(p.id, p);
    });
    (children as any[]).forEach((c)=>{
      const pid = c.parentId;
      const parentObj = parentMap.get(pid);
      if(parentObj) {
        parentObj.children.push(c);
      }
    });
    return NextResponse.json(parents);
  } catch(err:any){
    console.error(err);
    return NextResponse.json({ error:String(err)}, {status:500});
  }
}
