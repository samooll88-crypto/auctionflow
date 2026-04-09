'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { calculateAuctionCost } from '@/lib/calc'
import type { AuctionItem } from '@/data/mockAuctionItems'

type CalcResult = {
  acquisitionTax: number
  loanAmount: number
  extraCost: number
  totalCost: number
  ownCapital: number
}

type InputProps = {
  label: string
  value: number
  setValue: React.Dispatch<React.SetStateAction<number>>
  suffix?: string
}

type SavedCalculation = {
  id: number
  userEmail: string
  caseNo: string
  address: string
  propertyType: string
  appraisalPrice: number
  minimumSalePrice: number
  bidPrice: number
  taxRate: number
  loanRate: number
  legalFee: number
  evictionCost: number
  arrears: number
  repairCost: number
  otherCost: number
  acquisitionTax: number
  loanAmount: number
  extraCost: number
  totalCost: number
  ownCapital: number
  createdAt: string
}

export default function CalculatorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [caseNumber, setCaseNumber] = useState('')
  const [searchMessage, setSearchMessage] = useState('')
  const [searchError, setSearchError] = useState(false)
  const [searchResults, setSearchResults] = useState<AuctionItem[]>([])
  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null)

  const [bidPrice, setBidPrice] = useState(0)
  const [taxRate, setTaxRate] = useState(3)
  const [loanRate, setLoanRate] = useState(70)

  const [legalFee, setLegalFee] = useState(0)
  const [evictionCost, setEvictionCost] = useState(0)
  const [arrears, setArrears] = useState(0)
  const [repairCost, setRepairCost] = useState(0)
  const [otherCost, setOtherCost] = useState(0)

  const [result, setResult] = useState<CalcResult | null>(null)

  const formatNumber = (value: number) => value.toLocaleString('ko-KR') + '원'

  const handleSearch = async (inputCaseNo?: string) => {
    const targetCaseNo = (inputCaseNo ?? caseNumber).trim()

    setSearchMessage('')
    setSearchError(false)
    setSearchResults([])
    setSelectedItem(null)
    setResult(null)

    if (!targetCaseNo) {
      setSearchMessage('사건번호를 입력하세요.')
      setSearchError(true)
      return
    }

    try {
      const response = await fetch(`/api/search?caseNo=${encodeURIComponent(targetCaseNo)}`)
      const data = await response.json()

      if (!response.ok) {
        setSearchMessage(data.message || '검색 실패')
        setSearchError(true)
        return
      }

      const items = Array.isArray(data) ? data : []
      setSearchResults(items)

      if (items.length === 1) {
        setSelectedItem(items[0])
        setBidPrice(items[0].minimum_sale_price)
        setSearchMessage('검색 완료 (1건) · 자동 선택되었습니다.')
      } else {
        setSearchMessage(`검색 완료 (${items.length}건) · 물건을 선택하세요.`)
      }

      setSearchError(false)
    } catch (error) {
      console.error(error)
      setSearchMessage('검색 중 오류가 발생했습니다.')
      setSearchError(true)
    }
  }

  const handleSelectItem = (item: AuctionItem) => {
    setSelectedItem(item)
    setBidPrice(item.minimum_sale_price)
    setResult(null)
  }

  const handleCalculate = () => {
    if (!selectedItem) {
      alert('먼저 사건번호를 검색하고 물건을 선택하세요.')
      return
    }

    if (!bidPrice) {
      alert('예상 낙찰가를 입력하세요.')
      return
    }

    const res = calculateAuctionCost({
      bidPrice,
      acquisitionTaxRate: taxRate,
      loanPercent: loanRate,
      legalFee,
      evictionCost,
      arrearsFee: arrears,
      repairCost,
      otherCost,
    })

    setResult(res)
  }

  const handleSave = () => {
    const userEmail = sessionStorage.getItem('userEmail') || ''

    if (!userEmail) {
      alert('로그인 후 저장해주세요.')
      router.push('/login')
      return
    }

    if (!selectedItem) {
      alert('먼저 물건을 선택하세요.')
      return
    }

    if (!result) {
      alert('먼저 계산을 해주세요.')
      return
    }

    const existing: SavedCalculation[] = JSON.parse(
      localStorage.getItem('savedCalculations') || '[]'
    )

    const newItem: SavedCalculation = {
      id: Date.now(),
      userEmail,
      caseNo: selectedItem.case_no,
      address: selectedItem.address,
      propertyType: selectedItem.property_type,
      appraisalPrice: selectedItem.appraisal_price,
      minimumSalePrice: selectedItem.minimum_sale_price,
      bidPrice,
      taxRate,
      loanRate,
      legalFee,
      evictionCost,
      arrears,
      repairCost,
      otherCost,
      acquisitionTax: result.acquisitionTax,
      loanAmount: result.loanAmount,
      extraCost: result.extraCost,
      totalCost: result.totalCost,
      ownCapital: result.ownCapital,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('savedCalculations', JSON.stringify([newItem, ...existing]))
    alert('계산 결과가 저장되었습니다.')
  }

  useEffect(() => {
    const caseNoFromUrl = searchParams.get('caseNo')

    if (caseNoFromUrl) {
      setCaseNumber(caseNoFromUrl)
      handleSearch(caseNoFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">경매 비용 계산기</h1>
        <p className="mt-2 text-sm text-slate-500">
          사건번호를 검색한 뒤 물건을 선택하고, 실제 들어갈 비용을 계산해보세요.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-semibold">1. 사건번호 검색</h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            placeholder="예: 25-1812"
            className="flex-1 rounded-lg border p-3"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
          />
          <button
            onClick={() => handleSearch()}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            검색하기
          </button>
        </div>

        {searchMessage && (
          <p className={`mt-3 text-sm ${searchError ? 'text-red-600' : 'text-green-600'}`}>
            {searchMessage}
          </p>
        )}

        {searchResults.length > 1 && (
          <div className="mt-4 grid gap-3">
            {searchResults.map((item) => (
              <button
                key={item.auction_id}
                type="button"
                onClick={() => handleSelectItem(item)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedItem?.auction_id === item.auction_id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-sm text-gray-700"><strong>사건번호:</strong> {item.case_no}</div>
                <div className="text-sm text-gray-700"><strong>소재지:</strong> {item.address}</div>
                <div className="text-sm text-gray-700"><strong>물건종류:</strong> {item.property_type}</div>
                <div className="text-sm text-gray-700"><strong>감정가:</strong> {formatNumber(item.appraisal_price)}</div>
                <div className="text-sm text-gray-700"><strong>최저매각가:</strong> {formatNumber(item.minimum_sale_price)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-semibold">2. 선택된 물건</h2>

        {selectedItem ? (
          <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p><strong>사건번호:</strong> {selectedItem.case_no}</p>
            <p><strong>소재지:</strong> {selectedItem.address}</p>
            <p><strong>물건종류:</strong> {selectedItem.property_type}</p>
            <p><strong>감정가:</strong> {formatNumber(selectedItem.appraisal_price)}</p>
            <p><strong>최저매각가:</strong> {formatNumber(selectedItem.minimum_sale_price)}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">검색 후 물건을 선택하면 여기에 표시됩니다.</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-semibold">3. 비용 입력</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="예상 낙찰가" value={bidPrice} setValue={setBidPrice} suffix="원" />
          <Input label="취득세" value={taxRate} setValue={setTaxRate} suffix="%" />
          <Input label="대출 비율" value={loanRate} setValue={setLoanRate} suffix="%" />
          <Input label="법무비용" value={legalFee} setValue={setLegalFee} suffix="원" />
          <Input label="명도비용" value={evictionCost} setValue={setEvictionCost} suffix="원" />
          <Input label="체납관리비" value={arrears} setValue={setArrears} suffix="원" />
          <Input label="수리비" value={repairCost} setValue={setRepairCost} suffix="원" />
          <Input label="기타비용" value={otherCost} setValue={setOtherCost} suffix="원" />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleCalculate}
            className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white"
          >
            계산하기
          </button>

          <button
            onClick={handleSave}
            className="flex-1 rounded-lg border border-slate-300 bg-white py-3 font-semibold text-slate-700"
          >
            계산 결과 저장
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-semibold">4. 계산 결과</h2>

          <div className="space-y-3">
            <Result label="취득세" value={result.acquisitionTax} />
            <Result label="총 추가비용" value={result.extraCost} />
            <Result label="총 매입금액" value={result.totalCost} />
            <Result label="대출금" value={result.loanAmount} />
            <Result label="필요 자기자본" value={result.ownCapital} highlight />
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ label, value, setValue, suffix }: InputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full rounded-lg border p-3 pr-10"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function Result({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className={`flex justify-between border-b pb-2 ${highlight ? 'font-bold text-green-600' : ''}`}>
      <span>{label}</span>
      <span>{value.toLocaleString('ko-KR')} 원</span>
    </div>
  )
}