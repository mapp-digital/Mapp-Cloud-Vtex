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
  userId: string | null
}
interface OrderItem {
  sku: string | null
  name: string
  price: number
  qty_ordered?: number
  productQuantity?: number
  returnedQuantity?: number
}

type OrderDataStatus = "Created" | "Canceled" | "Processing"
