import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '비밀번호',
  database: 'auction_db',
})

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM calculations ORDER BY id DESC'
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'DB 오류' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    await pool.query(
      `INSERT INTO calculations
      (caseNo, address, propertyType, appraisalPrice, minimumSalePrice,
       bidPrice, taxRate, tax, loanPercent, loanAmount,
       legalFee, evictionCost, arrearsFee, repairCost, otherCost,
       extraCost, totalCost, ownCapital)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.caseNo,
        body.address,
        body.propertyType,
        body.appraisalPrice,
        body.minimumSalePrice,
        body.bidPrice,
        body.taxRate,
        body.tax,
        body.loanPercent,
        body.loanAmount,
        body.legalFee,
        body.evictionCost,
        body.arrearsFee,
        body.repairCost,
        body.otherCost,
        body.extraCost,
        body.totalCost,
        body.ownCapital,
      ]
    )

    return NextResponse.json({ message: '저장 완료' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: '저장 실패' }, { status: 500 })
  }
}