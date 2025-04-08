import { NextRequest, NextResponse } from 'next/server';
import { getDBPool } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const pool = getDBPool();

    // 비밀번호 해시
    const hashed = await bcrypt.hash(password, 10);

    // DB INSERT (role='user' 등 기본값)
    const [result] = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashed, 'user']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
