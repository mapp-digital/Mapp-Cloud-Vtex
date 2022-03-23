import {getUser, getLogger, getAppSettings} from "../utils/utils"

export async function checkMappConnectCredentials(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")

  const {mappConnectAPI} = ctx.clients
  const response = await mappConnectAPI.ping()

  if (response && response.status === 200) {
    ctx.status = 200
    ctx.body = "ok"
  } else {
    ctx.status = 500
    ctx.body = "invalid configuration"
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

  ctx.status = 200
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
    const response = await ctx.clients.mappConnectAPI.messages()

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
    const response = await ctx.clients.mappConnectAPI.group()

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

  // const res = await ctx.clients.mappConnectAPI.messages()
  // ctx.body = res?.data

  await next()
}

export default {
  hcheck,
  userUpdate,
  groups,
  checkMappConnectCredentials,
  mappMessages,
}
