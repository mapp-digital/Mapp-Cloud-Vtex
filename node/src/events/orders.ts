/* eslint-disable no-console */
import {getAppId, getLogger, getUser} from "../utils/utils"

const ORDER_STATUS = {
  order_created: "Created",
  payment_approved: "Payment Accepted",
  canceled: "Canceled",
  invoiced: "Shipped",
} as const

const getOrderStatus = (order: Order) => {
  const orderStatus = order.status.replace("-", "_")

  const status = ORDER_STATUS[orderStatus as keyof typeof ORDER_STATUS]

  return status || "Processing"
}

const getOrderTotal = (id: string, order: Order) => {
  const itemsTotal: any = order.totals.find(total => total.id === id)

  return itemsTotal ? itemsTotal.value / 100 : 0
}

const buildOrderData = (order: Order): OrderData => {
  const shippingAddress: ShippingAddress = {
    zipCode: order.shippingData.address.postalCode,
    address1: order.shippingData.address.street,
    city: order.shippingData.address.city,
    country: order.shippingData.address.country,
    state: order.shippingData.address.state,
  }

  return {
    couponCode: order.marketingData?.coupon ?? "",
    customerNumber: order.clientProfileData.userProfileId ?? "",
    dateEntered: order.creationDate,
    email: order.clientProfileData.email,
    orderNumber: order.sequence,
    orderTotal: order.value / 100,
    shipDate: order.invoicedDate ?? "",
    shippingAddress,
    shippingTotal: getOrderTotal("Shipping", order),
    status: getOrderStatus(order),
  }
}

export async function orderStatusOnChange(ctx: EventChangeContext, next: () => Promise<any>) {
  // add "mappConnectAPI" into clients
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

  // construct customer data ???
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
