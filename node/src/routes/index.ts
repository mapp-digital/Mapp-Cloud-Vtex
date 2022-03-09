import {getUser, getLogger} from "../utils/utils"

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
  const {userId, remove} = ctx.query
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

  if (remove === "true") {
    await mappConnectAPI.deleteUser(user)
  } else {
    await mappConnectAPI.updateUser(user)
  }

  await next()
}

export async function hcheck(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"
  await next()
}

export default {
  hcheck,
  userUpdate,
  checkMappConnectCredentials,
}
