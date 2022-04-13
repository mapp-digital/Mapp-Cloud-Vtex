import type {ProductData} from "../typings/mapp-connect"
import {getUser, getLogger, getAppSettings, updateisSubscriberCLDoc} from "../utils/utils"

export async function checkMappConnectCredentials(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")

  const {mappConnectAPI} = ctx.clients
  const response = await mappConnectAPI.getPing()

  if (response && response.status === 200) {
    ctx.status = 200
    ctx.body = "ok"
  } else {
    ctx.status = 500
    ctx.body = "invalid configuration"
  }

  await next()
}

export async function userCreate(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"

  const logger = getLogger(ctx.vtex.logger)

  // eslint-disable-next-line no-console
  const {userId} = ctx.query
  const {mappConnectAPI} = ctx.clients

  if (!userId) {
    logger.warn("Routes[userCreate]: usedId was not provided!", {
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
    })
    await next()

    return
  }

  const user = await getUser(ctx, userId as string)

  if (!user) {
    logger.warn("Routes[userCreate]: Failed to find user with provided userID!", {
      userId,
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
    })
    await next()

    return
  }

  try {
    await updateisSubscriberCLDoc(ctx, user.id, user.isNewsletterOptIn)
  } catch (err) {
    logger.error(`Routes[userCreate]: Failed to update CL doc! ${err?.message}`, {
      userId,
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
      err,
    })
    await next()

    return
  }

  // If its not subscriber, than update will not be triggered, so we have to manually update user
  if (!user.isNewsletterOptIn) {
    user.isSubscriber = user.isNewsletterOptIn
    await mappConnectAPI.updateUser(user, await getAppSettings(ctx))
  }

  await next()
}

export async function userUpdate(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"

  const logger = getLogger(ctx.vtex.logger)

  // eslint-disable-next-line no-console
  const {userId, remove, email} = ctx.query
  const {mappConnectAPI} = ctx.clients

  if (!userId) {
    logger.warn("Routes[updateUser]: usedId was not provided!", {
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
    })
    await next()

    return
  }

  if (remove === "true") {
    if (email && email.length > 0) {
      await mappConnectAPI.deleteUser(email as string)
    } else {
      logger.warn("Route[updateUser]: Failed to remove user, email not passed!", {
        url: ctx.URL,
        query: ctx.query,
        queryString: ctx.querystring,
      })
    }

    await next()

    return
  }

  const user = await getUser(ctx, userId as string)

  if (!user) {
    logger.warn("Routes[updateUser]: Failed to find user with provided userID!", {
      userId,
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
    })
    await next()

    return
  }

  await mappConnectAPI.updateUser(user, await getAppSettings(ctx))

  await next()
}

export async function mappMessages(ctx: Context, next: () => Promise<any>) {
  const logger = getLogger(ctx.vtex.logger)

  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200

  try {
    const response = await ctx.clients.mappConnectAPI.getMessages()

    if (response?.status !== 200) {
      throw new Error("Status code not 200")
    }

    ctx.body = response?.data
  } catch (err) {
    logger.error("Routes[groups]: Error was trown while fetching data!", {
      err,
    })
    ctx.status = 500
    ctx.body = "Internal error"
  }

  await next()
}

export async function groups(ctx: Context, next: () => Promise<any>) {
  const logger = getLogger(ctx.vtex.logger)

  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200

  try {
    const response = await ctx.clients.mappConnectAPI.getGroups()

    if (response?.status !== 200) {
      throw new Error("Status code not 200")
    }

    ctx.body = response?.data
  } catch (err) {
    logger.error("Routes[groups]: Error was trown while fetching data!", {
      err,
    })
    ctx.status = 500
    ctx.body = "Internal error"
  }

  await next()
}

export async function hcheck(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"

  const logger = getLogger(ctx.vtex.logger)

  logger.info("Events[SKUChange] -> Request received", {
    body: ctx.body,
  })

  const {skuID} = ctx.query

  if (!skuID) {
    logger.error(`Events[SKUChange] -> Missing IdSKU from request body`, {
      body: ctx.body,
    })

    await next()

    return
  }

  const product = await ctx.clients.catalog.getProduct(Number(skuID as string), ctx)

  if (!product) {
    logger.error(`Events[SKUChange] -> Cannot find product`, {
      skuID,
      host: ctx.vtex.host,
    })

    await next()

    return
  }

  await ctx.clients.mappConnectAPI.updateProduct(product as ProductData)
  await next()
}

export default {
  hcheck,
  userCreate,
  userUpdate,
  groups,
  checkMappConnectCredentials,
  mappMessages,
}
