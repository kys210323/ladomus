import { notFound, redirect } from "next/navigation";
import { RowDataPacket } from "mysql2/promise";
import { getDBPool } from "@/lib/db";

/* 동적 설정 */
export const dynamic       = "force-dynamic";
export const dynamicParams = true;

/* DB Row 타입 */
interface PageRow extends RowDataPacket {
  id: number;
  type: "page" | "board";
  slug: string;          // ex) "/introduction"
}
interface ChildRow extends RowDataPacket {
  slug: string;          // ex) "/introduction/ladomus"
}

/* ================= 부모 페이지 컴포넌트 ================= */
export default async function ParentPage({
  params,                                  // ✨ Promise 제공
}: {
  params: Promise<{ slug: string }>;       // ✨ 타입 수정
}) {
  /* 1) params 해소 */
  const { slug } = await params;           // ✨ 반드시 await
  const parentSlug = `/${slug}`;           // ex) "/introduction"

  /* 2) 부모 페이지 조회 */
  const pool = getDBPool();
  const [rows] = await pool.query<PageRow[]>(
    "SELECT id, type, slug FROM pages WHERE slug=? LIMIT 1",
    [parentSlug],
  );
  if (!rows?.length) notFound();
  const page = rows[0];

  /* 3) 자식 페이지 조회 */
  const [childRows] = await pool.query<ChildRow[]>(
    "SELECT slug FROM pages WHERE parentId=? ORDER BY id ASC",
    [page.id],
  );

  /* 4) 자식이 있으면 첫 자식으로 리다이렉트 */
  if (childRows.length > 0) {
    redirect(childRows[0].slug);           // ex) "/introduction/ladomus"
  }

  /* 5) 자식이 없으면 부모 본문 표시 */
  return (
    <div className="p-6 prose mx-auto">
      <h2>{page.slug} (부모 기본 화면)</h2>
      <p>자식 페이지가 전혀 없어서 여기서 부모 본문을 직접 표시합니다.</p>
    </div>
  );
}
