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
  items: OrderItem[]
  group?: number
  messageId?: string
  orderId: string
  timestamp: string
  currency: string
  status?: string
  discountTotal?: number
  taxTotal?: number
  shippingTotal?: number
  shippingAddress?: string
  shippingEstimate?: string
  orderItemsTotal?: number
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
}

type OrderDataStatus = "Created" | "Canceled" | "Processing"
