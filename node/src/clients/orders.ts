import type {InstanceOptions, IOContext} from "@vtex/api"
import {ExternalClient} from "@vtex/api"

import type {OrderData, OrderItem} from "../typings/mapp-connect"
import type {Order} from "../typings/vtex"
import {getAppId, getLogger} from "../utils/utils"

export interface OrderInfo {
  order: OrderData
  userId?: string
}

const ORDER_STATUS = {
  order_created: "Created",
  canceled: "Canceled",
  payment_approved: "Payment approved",
  invoiced: "Invoiced",
} as const

export default class OrdersClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://${ctx.account}.vtexcommercestable.com.br`, ctx, {
      ...options,
      timeout: 10000,
    })
  }

  public async getOrderInfo(
    orderId: string,
    currentState: string,
    ctx: EventChangeContext,
  ): Promise<OrderInfo | undefined> {
    const logger = getLogger(ctx.vtex.logger)

    try {
      const order = await this.getOrderData(orderId)

      // order.status replaced with event current state because order status and event current state doesn't match
      order.status = currentState
      if (!order || !order.status || !order.items) {
        throw new Error("Order or order.status or order.items not found")
      }

      const orderData = await this.buildOrderData(order, ctx)

      return orderData
    } catch (error) {
      logger.error(`Orders[orderStatusChange]: Exception in orders.getOrderData: ${error?.message}`, {
        error,
        data: ctx.body,
      })

      return undefined
    }
  }

  private async getMessageID(ctx: EventChangeContext, orderStatus: string) {
    const appId = getAppId()
    const appSettings = (await ctx.clients.apps.getAppSettings(appId)) as AppSettings

    if (orderStatus === "order-created") {
      return appSettings.messageOrderCreatedID
    }

    if (orderStatus === "canceled") {
      return appSettings.messageOrderCanceledID
    }

    if (orderStatus === "payment-approved") {
      return appSettings.messageOrderPaymentApprovedID
    }

    if (orderStatus === "invoiced") {
      return appSettings.messageOrderInvoicedID
    }

    return undefined
  }

  private async buildOrderData(order: Order, ctx: EventChangeContext): Promise<OrderInfo> {
    const items: OrderItem[] = order.items.map(item => {
      const data = {
        price: item.price / 100,
        sku: item.sellerSku,
        productQuantity: 0,
        name: item.name,
      } as OrderItem

      let discount = 0

      item.priceTags.forEach(elm => {
        if (elm.name.toLowerCase().includes("discount")) {
          discount += Math.abs(elm.rawValue) / item.quantity
        }
      })

      data.discountValue = discount

      if (item.imageUrl) {
        data.base_image = item.imageUrl
      }

      if (item.measurementUnit) {
        data.measurementUnit = item.measurementUnit
      }

      if (item.detailUrl) {
        data.url_path = `https://${ctx.vtex.host}${item.detailUrl.substring(1)}`
      }

      if (item.additionalInfo?.brandName) {
        data.brand = item.additionalInfo.brandName
      }

      if (item.additionalInfo?.categories) {
        data.category = item.additionalInfo.categories.map(category => category.name).join(", ")
      }

      if (order.status === "canceled") {
        data.returnedQuantity = item.quantity
      } else {
        data.qty_ordered = item.quantity
        data.productQuantity = item.quantity
      }

      return data
    })

    const addressInfo = order.shippingData?.address

    const orderData: OrderData = {
      email: order.clientProfileData.email,
      orderId: order.orderId,
      items,
      sequence: order?.sequence,
      currency: order.storePreferencesData.currencyCode,
      timestamp: order.creationDate,
      status: this.getOrderStatus(order),
      discountTotal: this.getTotals("Discounts", order),
      taxTotal: this.getTotals("Tax", order),
      itemsTotal: this.getTotals("Items", order),
      shippingTotal: this.getTotals("Shipping", order),
      shippingAddressReceiverName: addressInfo?.receiverName,
      shippingAddressStreet: addressInfo?.street,
      shippingAddressNumber: addressInfo?.number,
      shippingAddressCity: addressInfo?.city,
      shippingAddressState: addressInfo?.state,
      shippingAddressZip: addressInfo?.postalCode,
      shippingAddressCounty: addressInfo?.country,
      shippingAddressNeighborhood: addressInfo?.neighborhood,
      shippingAddressComplement: addressInfo?.complement,
      shippingEstimate: this.getEstimate(order),
      deliveryCompany: this.getDeliveryCompany(order),
      orderProductsTotal: order.items.length,
      orderItemsTotal: order.items.reduce((previous, current) => {
        return previous + current.quantity
      }, 0),
      orderTotal: order.value / 100,
      orderStatusLink: `https://${ctx.vtex.host}account#/orders/${order.orderId}`,
      billingAddress: this.getBillingAddress(order),
      paymentInfo: this.getPaymentInfo(order),
    }

    const messageId = await this.getMessageID(ctx, order.status)

    if (messageId && messageId !== "0" && messageId.length > 0) {
      orderData.messageId = messageId
    }

    return {
      order: orderData,
      userId: order.clientProfileData.userProfileId ?? undefined,
    }
  }

  private getPaymentInfo(order: Order): string | undefined {
    try {
      if (order.paymentData.transactions[0].payments[0].paymentSystemName) {
        return order.paymentData.transactions[0].payments[0].paymentSystemName
      }

      return undefined
      // eslint-disable-next-line no-empty
    } catch (_err) {}

    return undefined
  }

  private getBillingAddress(order: Order): string | undefined {
    try {
      if (order.paymentData.transactions[0].payments[0].billingAddress) {
        return order.paymentData.transactions[0].payments[0].billingAddress
      }

      return undefined
      // eslint-disable-next-line no-empty
    } catch (_err) {}

    return undefined
  }

  private getEstimate(order: Order): string | undefined {
    if (!order.shippingData?.logisticsInfo || order.shippingData.logisticsInfo.length === 0) {
      return undefined
    }

    if (!order.shippingData.logisticsInfo[0]?.shippingEstimate) {
      return undefined
    }

    const estimate = order.shippingData.logisticsInfo[0]?.shippingEstimate as string

    return estimate.replace("bd", " business days")
  }

  private getDeliveryCompany(order: Order): string | undefined {
    const logistics = order.shippingData?.logisticsInfo

    if (!logistics || logistics.length <= 0) {
      return undefined
    }

    return logistics[0]?.deliveryCompany ? logistics[0].deliveryCompany : undefined
  }

  private getTotals(totalName: string, order: Order): number {
    const total = order.totals.find(elm => elm.id === totalName)

    return total ? Number(total.value) / 100 : 0
  }

  private getOrderStatus(order: Order) {
    const orderStatus = order.status.replace(/-/g, "_")

    const status = ORDER_STATUS[orderStatus as keyof typeof ORDER_STATUS]

    return status || "Processing"
  }

  private getOrderData(orderId: string): Promise<Order> {
    // add this url to global conf file ?
    return this.http.get(`/api/oms/pvt/admin/orders/${orderId}`, {
      headers: {
        VtexIdclientAutCookie: this.context.authToken,
      },
    })
  }
}
