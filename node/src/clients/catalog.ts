import type {EventContext, InstanceOptions, IOContext} from "@vtex/api"
import {ExternalClient} from "@vtex/api"

import type Clients from "."
import type {ProductData} from "../typings/mapp-connect"
import type {VtexInventoryData, VtexPriceData, VtexProductData, VtexSKUData} from "../typings/vtex"
import {getLogger} from "../utils/utils"

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

  public async getProduct(skuId: number, ctx: Context | EventContext<Clients>): Promise<ProductData | undefined> {
    const logger = getLogger(ctx.vtex.logger)

    try {
      const productDetails = await this.getProductDetails(skuId.toString(), ctx)

      if (!productDetails) {
        return undefined
      }

      let stockTotal = 0

      productDetails.inventory.balance.forEach(warehouse => {
        stockTotal += warehouse.totalQuantity - warehouse.reservedQuantity
      })

      return {
        productSKU: productDetails.sku.Id.toString(),
        productName: productDetails.product.Name,
        productPrice: productDetails.price?.basePrice ?? 0,
        stockTotal,
        productURL: `https://${ctx.vtex.host}${productDetails.sku.DetailUrl}`,
        imageURL: productDetails.sku.ImageUrl,
        zoomImageURL: productDetails.sku.ImageUrl,
        brand: productDetails.sku.BrandName,
        category: Object.values(productDetails.sku.ProductCategories).join(", "),
        description: productDetails.product.Description ?? productDetails.product.DescriptionShort,
      } as ProductData
    } catch (err) {
      logger.error(`Exception while fetching product. Msg: ${err?.message}`, {
        err,
        skuId,
        ctxVtexHost: ctx.vtex.host,
      })
    }

    return undefined
  }

  public async getProducts(ctx: Context | EventContext<Clients>): Promise<ProductData[]> {
    const response = await this.getAllSKU()

    const productsPromisses = response.map(skuID => {
      return this.getProduct(skuID, ctx)
    })

    const products = await Promise.all(productsPromisses)

    return products.filter(elm => elm !== undefined) as ProductData[]
  }

  private async getInventoryFromSku(skuID: number | string): Promise<VtexInventoryData> {
    return this.http.get<VtexInventoryData>(`/api/logistics/pvt/inventory/skus/${skuID}`)
  }

  private getAllSKU(Page = 1, pageSize = 100): Promise<number[]> {
    return this.http.get<number[]>(`api/catalog_system/pvt/sku/stockkeepingunitids`, {
      params: {
        Active: true,
        Page,
        pageSize,
      },
    })
  }

  private getSKUByRefId(refId: string): Promise<VtexSKUData> {
    return this.http.get<VtexSKUData>(`/api/catalog_system/pvt/sku/stockkeepingunitbyid/${refId}`)
  }

  private async getProductDetails(
    skuId: string,
    ctx: Context | EventContext<Clients>,
  ): Promise<
    | {sku: VtexSKUData; price: VtexPriceData | undefined; product: VtexProductData; inventory: VtexInventoryData}
    | undefined
  > {
    const sku = await this.getSKUByRefId(skuId)
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
  }

  private async getProductById(id?: number): Promise<VtexProductData | undefined> {
    if (!id) {
      return undefined
    }

    return this.http.get<VtexProductData>(`/api/catalog/pvt/product/${id}`)
  }
}
