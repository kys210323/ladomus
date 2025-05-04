import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // JSON 형태로 응답할 내용(단순 예시)
  const responseBody = { success: true, message: '로그아웃 완료' };
  
  // 응답 생성
  const response = NextResponse.json(responseBody);

  // 여기서 쿠키를 빈 값 + 만료 시점 0 으로 설정 → userId 쿠키 삭제
  // (로그인 시 쿠키 이름/경로와 동일하게 해주어야 함)
  response.cookies.set('userId', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0, // 즉시 만료 (쿠키 삭제 효과)
    // domain: 'localhost',   // 만약 로그인 때 domain을 별도로 지정했다면 동일하게 추가
  });

  return response;
}
