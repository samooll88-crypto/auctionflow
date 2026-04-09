'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    const syncUser = () => {
      const savedEmail = sessionStorage.getItem('userEmail') || ''
      setUserEmail(savedEmail)
    }

    syncUser()

    window.addEventListener('storage', syncUser)
    window.addEventListener('user-auth-changed', syncUser as EventListener)

    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('user-auth-changed', syncUser as EventListener)
    }
  }, [pathname])

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  sessionStorage.removeItem('userEmail')
  window.dispatchEvent(new Event('user-auth-changed'))
  router.push('/')
}
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">

        {/* 로고 */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-extrabold text-base">
            ₩
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-extrabold text-[#1B2E4B] tracking-tight">
              낙찰이지<span className="text-orange-500">!</span>
            </span>
            <span className="text-xs font-bold text-orange-500 tracking-wide">
              경매비용 궁금할 땐?
            </span>
          </div>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors">
            홈
          </Link>
          <Link href="/calculator" className="text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors">
            비용계산
          </Link>
          <Link href="/qa" className="text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors">
            질문답변
          </Link>
          <Link href="/mypage" className="text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors">
            마이페이지
          </Link>
        </nav>

        {/* 로그인/로그아웃 */}
        <div className="flex items-center gap-3">
          {mounted && userEmail ? (
            <>
              <span className="hidden text-sm text-slate-600 md:block">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-[#1B2E4B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#253d61] transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#1B2E4B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#253d61] transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}  