// app/admin/pages/api/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDBPool } from "@/lib/db";

// POST: 새 페이지 생성
export async function POST(req: NextRequest) {
  try {
    const { parentId, type, template, title, slug, content } = await req.json();

    if(!title || !slug){
      return NextResponse.json({ error:"title, slug required" }, { status:400 });
    }
    const pid = (parentId===0)? null : parentId;
    const pool = getDBPool();
    await pool.query(
      "INSERT INTO pages (parentId, type, template, title, slug, content) VALUES (?,?,?,?,?,?)",
      [pid, type, template, title, slug, content]
    );
    return NextResponse.json({ success:true });
  } catch(err:any){
    console.error(err);
    return NextResponse.json({ error:String(err)}, {status:500});
  }
}

// PUT: 페이지 수정
export async function PUT(req: NextRequest) {
  try {
    const { id, type, template, title, slug, content } = await req.json();
    if(!id){
      return NextResponse.json({ error:"id required"}, {status:400});
    }
    const pool = getDBPool();
    await pool.query(
      "UPDATE pages SET type=?, template=?, title=?, slug=?, content=? WHERE id=?",
      [type, template, title, slug, content, id]
    );
    return NextResponse.json({ success:true });
  } catch(err:any){
    console.error(err);
    return NextResponse.json({ error:String(err)}, {status:500});
  }
}

// DELETE: 페이지 삭제 (?id=...)
export async function DELETE(req:NextRequest){
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if(!id){
      return NextResponse.json({ error:"missing ?id"}, {status:400});
    }
    const pool = getDBPool();
    await pool.query("DELETE FROM pages WHERE id=?", [id]);
    return NextResponse.json({ success:true });
  } catch(err:any){
    console.error(err);
    return NextResponse.json({ error:String(err)}, {status:500});
  }
}
