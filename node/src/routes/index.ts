import type {ProductData} from "../typings/mapp-connect"
import userSubscriberSchema from "../utils/user-subscriber.schema"
import {
  getUser,
  getLogger,
  getAppSettings,
  updateMappUserSubscriberDoc,
  getUserSubscriberDocForUserId,
} from "../utils/utils"

export async function checkMappConnectCredentials(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"

  const logger = getLogger(ctx.vtex.logger)

  const {mappConnectAPI, masterdata} = ctx.clients
  const response = await mappConnectAPI.getPing()

  if (!response || response.status !== 200) {
    ctx.status = 500
    ctx.body = "invalid configuration"
    await next()

    return
  }

  try {
    await masterdata.createOrUpdateSchema(userSubscriberSchema)
    logger.info("Schema updated", {})
  } catch (err) {
    if (err.response.status !== 304) {
      logger.error(`Failed to generate or update schema! ${err?.message}`, {
        err,
      })
      ctx.status = 500
      ctx.body = "invalid configuration"
    }
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
    await updateMappUserSubscriberDoc(ctx, user.mappUserSubDocId, user.isNewsletterOptIn)
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

  // Add him to regular group in both cases
  await mappConnectAPI.updateUser(user, await getAppSettings(ctx), false)

  // If its subscriber, add him to subscription group as well
  if (user.isNewsletterOptIn) {
    await mappConnectAPI.updateUser(user, await getAppSettings(ctx), true)
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
  const {mappConnectAPI, masterdata} = ctx.clients

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

    try {
      const userSubDoc = await getUserSubscriberDocForUserId(ctx, userId as string)

      if (userSubDoc) {
        await masterdata.deleteDocument({
          dataEntity: "MappUserSubscriber",
          id: userSubDoc.id,
        })
      }
    } catch (err) {
      logger.info(`Error removing MappUserSubscriber doc. ${err?.message}`, {
        err,
      })
    }

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

  // If we need to subscribe him it will trigger update event once again
  if (!user.isSubscriber && user.isNewsletterOptIn) {
    await updateMappUserSubscriberDoc(ctx, user.mappUserSubDocId, true)
    user.isSubscriber = true
  }

  await mappConnectAPI.updateUser(user, await getAppSettings(ctx), user.isSubscriber)

  // If we need to unsubscribe him it will trigger update event once again
  if (user.isSubscriber && !user.isNewsletterOptIn) {
    await updateMappUserSubscriberDoc(ctx, user.mappUserSubDocId, false)
  }

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
