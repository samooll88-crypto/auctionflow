import db from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password, nickname } = await req.json()

    if (!email || !password || !nickname) {
      return Response.json({ message: '모든 값을 입력해주세요' }, { status: 400 })
    }

    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing.rows.length > 0) {
      return Response.json({ message: '이미 존재하는 이메일입니다' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    await db.query(
      'INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3)',
      [email, hashed, nickname]
    )

    return Response.json({ message: '회원가입 성공' })
  } catch (error) {
    console.error('회원가입 오류:', error)
    return Response.json({ message: '회원가입 실패' }, { status: 500 })
  }
}