interface OrderData {
  email: string
  messageId?: string
  items: OrderItem[]
  group?: string
  orderId: string
  timestamp: string
  currency: string
  status?: string
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
