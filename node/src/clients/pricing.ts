import type {InstanceOptions, IOContext} from "@vtex/api"
import {ExternalClient} from "@vtex/api"

import type {VtexPriceData} from "../typings/vtex"

export default class PricingClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.myvtex.com/api/pricing`, context, {
      ...options,
      headers: {
        ...options?.headers,
        "Accept": "application/vnd.vtex.pricing.v3+json",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "X-Vtex-Use-Https": "true",
        "VtexIdclientAutcookie": context.adminUserAuthToken ?? "",
      },
    })
  }

  public getPrice(skuId: string | number): Promise<VtexPriceData> {
    return this.http.get<VtexPriceData>(`/prices/${skuId}`)
  }
}
