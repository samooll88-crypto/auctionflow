'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type SavedCalculation = {
  id: number
  userEmail: string
  caseNo: string
  address: string
  propertyType: string
  bidPrice: number
  totalCost: number
  ownCapital: number
  createdAt: string
}

type MyQuestion = {
  id: number
  title: string
  content: string
  status: string
  created_at: string
  nickname: string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatStatus(status: string) {
  if (status === 'open') return '답변대기'
  if (status === 'closed' || status === 'answered') return '답변완료'
  return status
}

export default function MyPage() {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [questions, setQuestions] = useState<MyQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('userEmail') || ''

    if (!savedEmail) {
      alert('로그인 후 이용해주세요.')
      router.push('/login')
      return
    }

    setUserEmail(savedEmail)

    const savedList: SavedCalculation[] = JSON.parse(
      localStorage.getItem('savedCalculations') || '[]'
    )

    const filteredCalculations = savedList.filter(
      (item) => item.userEmail === savedEmail
    )
    setCalculations(filteredCalculations)

    const fetchMyQuestions = async () => {
      try {
        const res = await fetch('/api/my-questions', { cache: 'no-store' })
        const data = await res.json()

        if (Array.isArray(data)) {
          setQuestions(data)
        } else {
          setQuestions([])
        }
      } catch (error) {
        console.error('내 질문 목록 불러오기 오류:', error)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchMyQuestions()
  }, [router])

  const handleDeleteCalculation = (id: number) => {
    const savedList: SavedCalculation[] = JSON.parse(
      localStorage.getItem('savedCalculations') || '[]'
    )

    const nextList = savedList.filter((item) => item.id !== id)
    localStorage.setItem('savedCalculations', JSON.stringify(nextList))
    setCalculations(nextList.filter((item) => item.userEmail === userEmail))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">마이페이지</h1>
        <p className="mt-2 text-sm text-slate-500">
          {userEmail ? `${userEmail}님의 활동 내역입니다.` : '내 활동 내역입니다.'}
        </p>
      </div>

      {/* 계산 기록 */}
      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">저장한 계산 기록</h2>
          <p className="mt-2 text-sm text-slate-500">
            저장해둔 경매 비용 계산 결과를 확인할 수 있습니다.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">불러오는 중...</p>
          </div>
        ) : calculations.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">저장된 계산 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calculations.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{item.address}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      사건번호: {item.caseNo} / 물건종류: {item.propertyType}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      저장일시: {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteCalculation(item.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-slate-500">예상 낙찰가</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {Number(item.bidPrice || 0).toLocaleString()}원
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-slate-500">총 매입금액</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {Number(item.totalCost || 0).toLocaleString()}원
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-blue-600">필요 자기자본</p>
                    <p className="mt-1 text-xl font-extrabold text-blue-600">
                      {Number(item.ownCapital || 0).toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 내가 쓴 질문 */}
      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">내가 쓴 질문글</h2>
          <p className="mt-2 text-sm text-slate-500">
            질문답변 게시판에 내가 작성한 질문을 확인할 수 있습니다.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">불러오는 중...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">작성한 질문이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Link
                key={question.id}
                href={`/qa/${question.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-900">{question.title}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {formatStatus(question.status)}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {question.content}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  작성자: {question.nickname} · {formatDate(question.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}