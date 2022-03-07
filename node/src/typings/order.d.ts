interface Order {
  orderId: string
  clientProfileData: ClientProfileData
  creationDate: string
  value: number
  totals: Total[]
  items: []
  status: string
  statusDescription: string
  sequence: string
  salesChannel: string
  affiliateId: string | null
  origin: string | null
  authorizedDate: string | null
  invoicedDate: string | null
  marketingData?: MarketingData | null
  shippingData: ShippingData
  checkedInPickupPointId: number
}

interface ClientProfileData {
  email: string
  firstName: string
  lastName: string
  documentType: string
  document: string | null
  phone: string
  corporateName: string | null
  tradeName: string | null
  corporateDocument: string | null
  stateInscription: string | null
  corporatePhone: string | null
  isCorporate: boolean
  userProfileId: string | null
}
interface MarketingData {
  coupon: string
}
interface Total {
  id: string
  name: string
  value: string
}
