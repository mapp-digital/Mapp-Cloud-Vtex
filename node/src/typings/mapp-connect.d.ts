export interface ProductData {
  productSKU: string
  productName: string
  productPrice: number
  stockTotal: number
  productURL: string
  imageURL: string
  zoomImageURL: string
  brand: string
  category: string
  description: string
}

interface OrderData {
  email: string
  messageId?: string
  sequence?: string
  items: OrderItem[]
  group?: number
  messageId?: string
  orderId: string
  timestamp: string
  currency: string
  status?: string
  itemsTotal?: number
  discountTotal?: number
  taxTotal?: number
  shippingTotal?: number
  shippingAddressReceiverName?: string
  shippingAddressStreet?: string
  shippingAddressComplement?: string
  shippingAddressCounty?: string
  shippingAddressNeighborhood?: string
  shippingAddressNumber?: string
  shippingAddressCity?: string
  shippingAddressState?: string
  shippingAddressZip?: string
  shippingEstimate?: string
  deliveryCompany?: string
  orderItemsTotal?: number
  orderProductsTotal?: number
  orderTotal?: number
  orderStatusLink?: string
  billingAddress?: string
  paymentInfo?: string
}
interface OrderItem {
  sku: string | null
  name: string
  price: number
  qty_ordered?: number
  productQuantity?: number
  returnedQuantity?: number
  base_image?: string
  url_path?: string
  category?: string
  brand?: string
  discountValue: number
  measurementUnit?: string
}

type OrderDataStatus = "Created" | "Canceled" | "Processing"
