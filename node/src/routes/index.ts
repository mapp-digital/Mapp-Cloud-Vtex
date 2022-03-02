import {getAppSettings} from "../utils/utils"

export async function hcheck(ctx: Context) {
  const response = await ctx.clients.mappConnectAPI.ping()

  // eslint-disable-next-line no-console
  console.log(response?.data)

  const settings = await getAppSettings(ctx)

  // eslint-disable-next-line no-console
  console.log("SETTINGS =>", settings.engageApiUrl)

  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"
}

export default {
  hcheck,
}
