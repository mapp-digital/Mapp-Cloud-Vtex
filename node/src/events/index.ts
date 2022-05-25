import type {EventContext} from "@vtex/api"

import type Clients from "../clients"
import type {ProductData} from "../typings/mapp-connect"
import {getAppId, getLogger, getUser} from "../utils/utils"

export async function skuChange(ctx: EventContext<Clients>): Promise<void> {
  const logger = getLogger(ctx.vtex.logger)

  if (!ctx.vtex.host) {
    const info = await ctx.clients.tenant.info()

    if (info?.bindings.length > 0 && info?.bindings[0].canonicalBaseAddress) {
      ctx.vtex.host = info?.bindings[0].canonicalBaseAddress
    }
  }

  logger.info("Events[SKUChange] -> Request received", {
    body: ctx.body,
  })

  const skuID = ctx.body.IdSku

  if (!skuID) {
    logger.error(`Events[SKUChange] -> Missing IdSKU from request body`, {
      body: ctx.body,
    })

    return
  }

  const product = await ctx.clients.catalog.getProduct(skuID, ctx)

  if (!product) {
    logger.error(`Events[SKUChange] -> Cannot find product`, {
      skuID,
      host: ctx.vtex.host,
    })

    return
  }

  await ctx.clients.mappConnectAPI.updateProduct(product as ProductData)
}

export async function orderStatusOnChange(ctx: EventChangeContext, next: () => Promise<any>) {
  const {
    clients: {orders, mappConnectAPI},
    body,
  } = ctx

  const logger = getLogger(ctx.vtex.logger)

  if (!ctx.vtex.host) {
    const info = await ctx.clients.tenant.info()

    if (info?.bindings.length > 0 && info?.bindings[0].canonicalBaseAddress) {
      ctx.vtex.host = info?.bindings[0].canonicalBaseAddress
    }
  }

  if (body.domain !== "Marketplace") {
    await next()

    return
  }

  // ignore this
  if (body.currentState === "payment-approved" && body.lastState !== "approve-payment") {
    await next()

    return
  }

  // // If its canceled event, but its not fulfilment, ignore it
  // if (body.currentState === "canceled" && body.domain !== "Fulfillment") {
  //   await next()

  //   return
  // }

  // // Ignore if payment-approved happens after invoice
  // if (body.currentState === "payment-approved" && body.lastState === "invoice") {
  //   await next()

  //   return
  // }

  // // Ignore if invoice happens and its Fulfillment domain
  // if (body.currentState === "invoice" && body.domain === "Fulfillment") {
  //   await next()

  //   return
  // }

  // Log data
  logger.info("Events[orderStatusChange]: event received", {
    data: ctx.body,
  })

  const orderId = body.orderId as string

  if (!orderId) {
    logger.warn("Events[orderStatusChange]: Missing orderID", {
      data: ctx.body,
    })

    await next()

    return
  }

  const orderInfo = await orders.getOrderInfo(orderId, body.currentState, ctx)
  const order = orderInfo?.order
  const userId = orderInfo?.userId

  if (!order) {
    logger.warn("Events[orderStatusChange]: Order not found!", {
      data: ctx.body,
      orderId,
    })

    await next()

    return
  }

  // Create user first
  if (order.status === "Created" && userId) {
    try {
      const user = await getUser(ctx, userId)

      if (!user) {
        logger.warn("Events[orderStatusChange]: Cannot find user for order!", {
          order,
          dat: ctx.body,
        })

        await next()

        return
      }

      const appId = getAppId()
      const appSettings = (await ctx.clients.apps.getAppSettings(appId)) as AppSettings

      await mappConnectAPI.updateUser(user, appSettings, false)
    } catch (err) {
      logger.warn("Events[orderStatusChange]: Failed to update user!", {
        order,
        data: ctx.body,
        orderId,
        err,
      })
    }
  }

  try {
    await mappConnectAPI.updateOrder(order)
  } catch (err) {
    logger.warn("Events[orderStatusChange]: Failed to update order!", {
      order,
      dat: ctx.body,
      orderId,
      err,
    })
  }

  await next()
}

export default {
  orderStatusOnChange,
  skuChange,
}
