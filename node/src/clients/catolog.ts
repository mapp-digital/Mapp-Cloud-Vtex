import type {InstanceOptions, IOContext} from "@vtex/api"
import {ExternalClient} from "@vtex/api"

import type {InventoryData, PriceData, ProductData, SKUData} from "../typings/product"

export interface GetProductsAndSkuIdsReponse {
  items: number[]
  paging: {
    total: number
    page: number
    perPage: number
    pages: number
  }
}

const PAGE_SIZE = 100

export class CatalogClient extends ExternalClient {
  constructor(protected context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.vtexcommercestable.com.br`, context, {
      ...(options ?? {}),
      headers: {
        ...(options?.headers ?? {}),
        "Content-Type": "application/json",
        "VtexIdclientAutCookie": context.authToken,
        "X-Vtex-Use-Https": "true",
      },
    })
  }

  public async getInventoryFromSku(skuID: number | string): Promise<InventoryData> {
    return this.http.get<InventoryData>(`/api/logistics/pvt/inventory/skus/${skuID}`)
  }

  public getProductsIds(page: number, salesChannels?: string[]): Promise<GetProductsAndSkuIdsReponse> {
    return this.http.get("/api/catalog_system/pvt/products/GetProductsIds", {
      params: {
        ...(salesChannels ? {SalesChannelId: salesChannels.join(",")} : {}),
        Active: true,
        Page: page,
        pageSize: PAGE_SIZE,
      },
    })
  }

  public getAllSKU(): Promise<number[]> {
    return this.http.get<number[]>(`api/catalog_system/pvt/sku/stockkeepingunitids`, {
      params: {
        Active: true,
        Page: 1,
        pageSize: PAGE_SIZE,
      },
    })
  }

  public getSKUByRefId(refId: string): Promise<SKUData> {
    return this.http.get<SKUData>(`/api/catalog_system/pvt/sku/stockkeepingunitbyid/${refId}`)
  }

  public async getStockData(skuId: string): Promise<any> {
    return this.http.post(`/api/fulfillment/pvt/orderForms/simulation?sc=1`, {
      items: [
        {
          id: skuId,
          quantity: 1,
          seller: "1",
        },
      ],
    })
  }

  public async getAllProductDetails(
    skuId: string,
    ctx: Context,
  ): Promise<{sku: SKUData; price: PriceData | undefined; product: ProductData; inventory: InventoryData} | undefined> {
    try {
      const sku = await this.getSKUByRefId(skuId)

      if (!sku.IsActive) {
        return undefined
      }

      const price = await ctx.clients.pricing.getPrice(skuId)
      const product = await this.getProductById(sku.ProductId)
      const inventory = await this.getInventoryFromSku(skuId)

      if (!product) {
        return undefined
      }

      return {
        sku,
        price,
        product,
        inventory,
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }

    return undefined
  }

  public async getProductById(id?: number): Promise<ProductData | undefined> {
    if (!id) {
      return undefined
    }

    return this.http.get<ProductData>(`/api/catalog/pvt/product/${id}`)
  }
}
