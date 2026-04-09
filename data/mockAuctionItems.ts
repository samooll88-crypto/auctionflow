export type AuctionItem = {
  auction_id: number
  case_no: string
  property_type: string
  address: string
  appraisal_price: number
  minimum_sale_price: number
}

export const mockAuctionItems: AuctionItem[] = [
  {
    auction_id: 1,
    case_no: '25-1812',
    property_type: '아파트',
    address: '경기 수원시 영통구 예시로 101',
    appraisal_price: 380000000,
    minimum_sale_price: 266000000,
  },
  {
    auction_id: 2,
    case_no: '25-1812',
    property_type: '오피스텔',
    address: '경기 수원시 영통구 예시로 102',
    appraisal_price: 220000000,
    minimum_sale_price: 154000000,
  },
  {
    auction_id: 3,
    case_no: '24-5501',
    property_type: '빌라',
    address: '경기 용인시 수지구 예시로 33',
    appraisal_price: 310000000,
    minimum_sale_price: 217000000,
  },
]