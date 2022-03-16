/* eslint-disable no-console */
import {getAppId, getLogger, getUser} from "../utils/utils"

const ORDER_STATUS = {
  on_order_completed: "Created",
  cancel: "Canceled",
} as const

const getOrderStatus = (order: Order) => {
  const orderStatus = order.status.replace(/-/g, "_")

  const status = ORDER_STATUS[orderStatus as keyof typeof ORDER_STATUS]

  return status || "Processing"
}

const buildOrderData = (order: Order): OrderData => {
  const items: OrderItem[] = order.items.map(item => {
    let data

    if (order.status === "cancel") {
      data = {
        price: item.price / 100,
        sku: item.sellerSku,
        productQuantity: item.quantity,
        returnedQuantity: item.quantity,
        name: item.name,
      }
    } else {
      data = {
        price: item.price / 100,
        qty_ordered: item.quantity,
        sku: item.sellerSku,
        name: item.name,
      }
    }

    return data
  })

  return {
    email: order.clientProfileData.email,
    orderId: order.sequence,
    items,
    group: order.orderGroup,
    currency: order.storePreferencesData.currencyCode,
    timestamp: order.creationDate,
    status: getOrderStatus(order),
  }
}

export async function orderStatusOnChange(ctx: EventChangeContext, next: () => Promise<any>) {
  const {
    clients: {orders, mappConnectAPI},
    body,
  } = ctx

  const logger = getLogger(ctx.vtex.logger)

  // Log data
  logger.info("Orders[orderStatusChange]: event received", {
    data: ctx.body,
  })

  let order: Order

  // call api to get order data
  try {
    order = await orders.getOrderData(body.orderId)

    // order.status replaced with event current state because order status and event current state doesn't match
    order.status = body.currentState
    if (!order || !order.status || !order.items) {
      return
    }
  } catch (error) {
    logger.error(`Orders[orderStatusChange]: Exception in orders.getOrderData: ${error?.message}`, {
      error,
      data: ctx.body,
    })

    return
  }

  // construct order data
  let orderData: OrderData

  // construct customer data
  let customerData: User | undefined

  try {
    order.clientProfileData.userProfileId
    orderData = buildOrderData(order)

    if (!order.clientProfileData.userProfileId) {
      logger.error("Orders[orderStatusChange]: Cannot find userProfileID", {order})
    } else {
      customerData = await getUser(ctx, order.clientProfileData.userProfileId)
    }
  } catch (error) {
    logger.error(`Orders[orderStatusChange]: Exception in buildOrderData or getUser: ${error?.message}`, {
      error,
      data: {order},
    })

    return
  }

  // send order data to mapp
  try {
    // send post event to mapp api
    await mappConnectAPI.updateOrder(orderData)

    // create customer
    if (order.status === "on-order-completed" && customerData) {
      const appId = getAppId()

      await mappConnectAPI.updateUser(
        customerData,
        await (ctx.clients.apps.getAppSettings(appId) as Promise<AppSettings>),
      )
    }
  } catch (error) {
    logger.error(`Orders[orderStatusChange]: Exception in updateUser or postEvent: ${error?.message}`, {
      error,
      message: "orderStatusOnChange-createOrderError",
      data: {orderData, customerData},
    })
  }

  await next()
}
