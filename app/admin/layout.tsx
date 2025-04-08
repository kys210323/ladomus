// app/admin/layout.tsx
import Link from "next/link";

// 관리자 레이아웃 – <html>/<body> 없이 <div>로만 감싸기
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 왼쪽 사이드바 */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="px-6 py-4 font-bold text-xl border-b border-gray-700">
          Admin Menu
        </div>
        <nav className="flex-1">
          <ul className="mt-4">
            {/* 필요한 링크만 수정 */}
            <li>
              <Link
                href="/admin"
                className="block px-6 py-2 hover:bg-gray-700 transition-colors"
              >
                대시보드
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="block px-6 py-2 hover:bg-gray-700 transition-colors"
              >
                회원 관리
              </Link>
            </li>
            <li>
              <Link
                href="/admin/pages"
                className="block px-6 py-2 hover:bg-gray-700 transition-colors"
              >
                페이지 & 게시판 생성
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
