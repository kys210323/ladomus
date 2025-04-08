export default function AdminPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600">
        이 곳은 관리자 전용 페이지입니다. 메뉴를 선택하세요.
      </p>

      {/* 아래는 예시 위젯/박스 */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">사이트 통계</h2>
          <p className="text-sm text-gray-500">
            오늘 방문자: 123명, 전체 회원 수: 456명
          </p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">시스템 알림</h2>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>업데이트 예정 공지</li>
            <li>보안 패치 필요</li>
          </ul>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">작업 로그</h2>
          <p className="text-sm text-gray-500">
            최근 작업: 페이지 생성, 게시판 수정 등
          </p>
        </div>
      </section>
    </>
  );
}
