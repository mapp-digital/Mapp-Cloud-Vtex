import type {InstanceOptions, IOContext} from "@vtex/api"
import {ExternalClient} from "@vtex/api"

const TIMEOUT = 4 * 1000

export default class OrdersClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://${ctx.account}.vtexcommercestable.com.br`, ctx, {
      ...options,
      timeout: TIMEOUT,
    })
  }

  public getOrderData = (orderId: string): Promise<Order> =>
    // add this url to global conf file ?
    this.http.get(`/api/oms/pvt/admin/orders/${orderId}`, {
      headers: {
        VtexIdclientAutCookie: this.context.authToken,
      },
      metric: "ordersClient-getOrderData",
    })
}
