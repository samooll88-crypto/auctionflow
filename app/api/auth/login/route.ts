import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/session'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return Response.json({ message: '이메일 또는 비밀번호 오류' }, { status: 400 })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return Response.json({ message: '이메일 또는 비밀번호 오류' }, { status: 400 })
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return new Response(JSON.stringify({ message: '로그인 성공' }), {
      headers: {
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=604800`,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('로그인 오류:', error)
    return Response.json({ message: '로그인 실패' }, { status: 500 })
  }
}