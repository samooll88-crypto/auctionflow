import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'

const NO_CACHE = { headers: { 'Cache-Control': 'no-store' } }

export async function GET() {
  const token = (await cookies()).get('token')?.value

  if (!token) {
    return Response.json({ user: null }, NO_CACHE)
  }

  try {
    const payload = await verifyToken(token)
    return Response.json({ user: payload }, NO_CACHE)
  } catch {
    return Response.json({ user: null }, NO_CACHE)
  }
}