import { NextRequest, NextResponse } from 'next/server';
import { getDBPool } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    // 클라이언트에서 "username", "password"를 JSON으로 전달
    const { username, password } = await req.json();

    // 유효성 검사
    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디 혹은 비밀번호가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const pool = getDBPool();

    // 1) 사용자 조회 (username 기준)
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: '존재하지 않는 아이디입니다.' }, { status: 401 });
    }

    const user = rows[0];
    const hashedPassword = user.password;

    // 2) 비밀번호 해시 비교
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    // 3) 쿠키/세션 설정 (간단 예)
    // 실제 운영 환경에서는 JWT/NextAuth/custom 세션 등 보안을 더 강화해야 합니다.
    const responseBody = { success: true, message: '로그인 성공' };
    const response = NextResponse.json(responseBody);

    // 예시: userId를 쿠키로 저장
    response.cookies.set({
      name: 'userId',
      value: String(user.id),
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1일
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
