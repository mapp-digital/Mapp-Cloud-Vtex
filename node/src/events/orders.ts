import {getLogger, getUser} from "../utils/utils"

const ORDER_STATUS = {
  canceled: "Canceled",
  invoiced: "Shipped",
} as const

const getOrderStatus = (order: Order) => {
  const status = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]

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
  const event = body.currentState

  // Log data
  logger.info({
    message: "orderStatusOnChange-eventReceived ",
    data: ctx.body,
  })

  let order: Order

  // call api to get order data
  try {
    // todo set permission for workspace ( order hook works)
    order = await orders.getOrderData(body.orderId)

    if (!order || !order.status || !order.items) {
      return
    }
  } catch (error) {
    logger.error({
      error,
      message: "orderStatusOnChange-getOrderError",
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
      logger.error({
        message: "orderStatusOnChange - Cannot find user!",
      })
    } else {
      customerData = await getUser(ctx, order.clientProfileData.userProfileId)
    }
  } catch (error) {
    logger.error({
      error,
      message: "orderStatusOnChange-buildListrakOrderError",
      data: {order},
    })

    return
  }

  // send order data to mapp
  try {
    // send post event to mapp api
    await mappConnectAPI.postEvent(event, orderData)

    // create customer ???
    if (order.status === "on-order-completed" && customerData) {
      await mappConnectAPI.updateUser(customerData)

      logger.info({
        message: "orderStatusOnChange-createCustomer",
        data: {customerData},
      })
    }
  } catch (error) {
    logger.error({
      error,
      message: "orderStatusOnChange-createOrderError",
      data: {orderData, customerData},
    })
  }

  await next()
}
