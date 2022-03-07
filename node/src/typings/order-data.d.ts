interface OrderData {
  couponCode?: string
  customerNumber?: string
  dateEntered?: string
  email?: string
  orderNumber: string
  orderTotal?: number
  shipDate?: string
  shippingAddress?: ShippingAddress
  shippingTotal?: number
  status?: OrderDataStatus
}
interface ShippingAddress {
  firstName?: string
  lastName?: string
  phone?: string
  zipCode?: string
  address1: string
  address2?: string
  address3?: string
  city?: string
  country?: string
  state?: string
}
type OrderDataStatus =
  | "NotSet"
  | "Misc"
  | "PreOrder"
  | "BackOrder"
  | "Pending"
  | "Hold"
  | "Processing"
  | "Shipped"
  | "Completed"
  | "Returned"
  | "Canceled"
  | "Unknown"
  | "Closed"
