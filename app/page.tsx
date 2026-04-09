'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HomePage() {
  const [caseNo, setCaseNo] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    if (!caseNo.trim()) {
      alert('사건번호를 입력하세요.')
      return
    }

    router.push(`/calculator?caseNo=${encodeURIComponent(caseNo.trim())}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">

      {/* 히어로 섹션 */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <span className="mb-4 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-500">
            경매 투자 비용 계산 서비스
          </span>

          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-[#1B2E4B]">
            경매 입찰 전,
            <br />
            실제 필요한 돈부터
            <br />
            먼저 확인하세요
          </h1>

          <p className="mb-6 text-sm leading-7 text-slate-500">
            사건번호 검색 후 예상 낙찰가, 취득세, 대출비율을 입력하면
            총 매입금액과 실제 필요한 자기자본을 한눈에 확인할 수 있습니다.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              placeholder="사건번호 입력 (예: 25-1812)"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
            />
            <button
              onClick={handleSearch}
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              비용 확인하기 →
            </button>
          </div>
        </div>

        <div className="relative">
          <img
            src="/building.jpg"
            alt="건물 이미지"
            className="h-[320px] w-full rounded-3xl object-cover shadow-lg"
          />
        </div>
      </section>

      {/* 예시 매물 카드 */}
      <section className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row">
        <img
          src="/building.jpg"
          alt="예시 물건 이미지"
          className="h-[180px] w-full rounded-xl object-cover md:w-1/3"
        />

        <div className="flex-1 space-y-2">
          <p className="text-2xl font-bold text-[#1B2E4B]">서울시 강남구 역삼동 123-4</p>
          <p className="text-sm font-medium text-orange-500">아파트</p>

          <div className="space-y-1 text-sm text-slate-700">
            <p>감정가: 5억</p>
            <p>최저가: 3억 5천</p>
            <p>예상 낙찰가: 4억</p>
          </div>
        </div>

        <div className="min-w-[140px] text-center">
          <p className="text-sm text-slate-500">필요 자기자본</p>
          <p className="text-3xl font-extrabold text-orange-500">1억 2천</p>
        </div>
      </section>

      {/* 핵심 기능 섹션 */}
      <section>
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold text-orange-500">핵심 기능</p>
          <h2 className="text-3xl font-extrabold text-[#1B2E4B]">
            필요한 기능만 깔끔하게 모았습니다
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            계산부터 질문, 회원 기능까지 흐름에 맞게 이용할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            title="경매 비용 계산기"
            desc="사건번호 검색 후 실제 들어갈 비용을 입력해 총 매입금액을 계산합니다."
            href="/calculator"
            linkText="계산하러 가기"
          />
          <FeatureCard
            title="질문답변"
            desc="명도비용, 체납관리비, 수리비처럼 실전에서 헷갈리는 부분을 질문할 수 있습니다."
            href="/qa"
            linkText="질문하러 가기"
          />
          <FeatureCard
            title="회원 기능"
            desc="계산 결과 저장, 관심 물건 정리, 질문 내역 확인 같은 기능을 제공합니다."
            href="/login"
            linkText="로그인 / 회원가입"
          />
        </div>
      </section>

      {/* 하단 CTA 배너 */}
      <section className="rounded-3xl bg-[#1B2E4B] px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-extrabold mb-2">지금 바로 경매 비용을 계산해보세요</h2>
        <p className="text-sm text-slate-300 mb-6">
          낙찰이지!와 함께 경매 투자의 첫걸음을 시작하세요.
        </p>
        <Link
          href="/calculator"
          className="inline-block rounded-xl bg-orange-500 px-8 py-3 text-sm font-bold text-white hover:bg-orange-600 transition"
        >
          무료로 계산하기 →
        </Link>
      </section>

    </div>
  )
}

function FeatureCard({
  title,
  desc,
  href,
  linkText,
}: {
  title: string
  desc: string
  href: string
  linkText: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-orange-200">
      <h3 className="mb-3 text-xl font-bold text-[#1B2E4B]">{title}</h3>
      <p className="mb-5 text-sm leading-6 text-slate-500">{desc}</p>
      <Link href={href} className="text-sm font-semibold text-orange-500 hover:text-orange-600">
        {linkText} →
      </Link>
    </div>
  )
}