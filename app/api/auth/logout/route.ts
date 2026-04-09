export async function POST() {
  return new Response(JSON.stringify({ message: '로그아웃 되었습니다.' }), {
    headers: {
      'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0',
      'Content-Type': 'application/json',
    },
  })
}