import type {InstanceOptions, IOContext} from "@vtex/api"
import {ExternalClient} from "@vtex/api"

import type {OrderData, OrderItem} from "../typings/mapp-connect"
import type {Order} from "../typings/vtex"
import {getAppId, getLogger} from "../utils/utils"

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

  public async getOrder(
    orderId: string,
    currentState: string,
    ctx: EventChangeContext,
  ): Promise<OrderData | undefined> {
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
      return appSettings.messageOrderCreatedID
    }

    if (orderStatus === "payment-approved") {
      return appSettings.messageOrderCreatedID
    }

    if (orderStatus === "invoiced") {
      return appSettings.messageOrderCreatedID
    }

    return undefined
  }

  private async buildOrderData(order: Order, ctx: EventChangeContext): Promise<OrderData> {
    const items: OrderItem[] = order.items.map(item => {
      let data

      if (order.status === "canceled") {
        data = {
          price: item.price / 100,
          sku: item.sellerSku,
          productQuantity: 0,
          returnedQuantity: item.quantity,
          name: item.name,
        }
      } else {
        data = {
          price: item.price / 100,
          qty_ordered: item.quantity,
          productQuantity: item.quantity,
          sku: item.sellerSku,
          name: item.name,
        }
      }

      return data
    })

    const toRet: OrderData = {
      userId: order.clientProfileData.userProfileId,
      email: order.clientProfileData.email,
      orderId: order.sequence,
      items,
      currency: order.storePreferencesData.currencyCode,
      timestamp: order.creationDate,
      status: this.getOrderStatus(order),
    }

    const messageId = await this.getMessageID(ctx, order.status)

    if (messageId && messageId !== "0" && messageId.length > 0) {
      toRet.messageId = messageId
    }

    return toRet
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
      metric: "ordersClient-getOrderData",
    })
  }
}
