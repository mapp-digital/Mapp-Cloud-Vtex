import {JanusClient} from "@vtex/api"

import type {VtexPriceData} from "../typings/vtex"

export default class PricingClient extends JanusClient {
  public getPrice(skuId: string | number): Promise<VtexPriceData> {
    return this.http.get<VtexPriceData>(`${this.context.account}/pricing/prices/${skuId}`, {
      headers: {
        "X-Vtex-Use-Https": true,
        "VtexIdclientAutCookie": this.context.authToken,
      },
    })
  }
}
