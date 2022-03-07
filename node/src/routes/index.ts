import {getUser, getLogger} from "../utils/utils"

export async function userUpdate(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"

  const logger = getLogger(ctx.vtex.logger)
  // eslint-disable-next-line no-console
  const {userId} = ctx.query
  const {mappConnectAPI} = ctx.clients

  ctx.status = 200
  if (!userId) {
    logger.warn({
      msg: "Routes[updateUser]: usedId was not provided!",
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
    })
    await next()

    return
  }

  const user = await getUser(ctx, userId as string)

  if (!user) {
    logger.warn({
      msg: "Routes[updateUser]: Failed to find user with provided userID!",
      userId,
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
    })
    await next()

    return
  }

  const response = await mappConnectAPI.updateUser(user)

  logger.info(response)

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
}
