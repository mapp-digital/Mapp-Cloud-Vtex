import {getLogger} from "../utils/utils"

export const hcheck = (ctx: Context) => {
  const logger = getLogger(ctx)

  logger.debug("Route hcheck issued")

  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"
}

export default {
  hcheck,
}
