export function calculateAuctionCost(params: {
  bidPrice: number
  acquisitionTaxRate: number
  loanPercent: number
  legalFee: number
  evictionCost: number
  arrearsFee: number
  repairCost: number
  otherCost: number
}) {
  const acquisitionTax = Math.round(params.bidPrice * (params.acquisitionTaxRate / 100))
  const loanAmount = Math.round(params.bidPrice * (params.loanPercent / 100))

  const extraCost =
    acquisitionTax +
    params.legalFee +
    params.evictionCost +
    params.arrearsFee +
    params.repairCost +
    params.otherCost

  const totalCost = params.bidPrice + extraCost
  const ownCapital = totalCost - loanAmount

  return {
    acquisitionTax,
    loanAmount,
    extraCost,
    totalCost,
    ownCapital,
  }
}