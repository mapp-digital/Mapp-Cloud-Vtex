import type {EventContext, IOClients, IOContext, Logger} from "@vtex/api"
import {Apps} from "@vtex/api"

export const getLogger = (ctx: Context | EventContext<IOClients>): Logger => ctx.vtex.logger

export const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ""
}

export const getAppSettings = (ctx: Context | IOContext): Promise<AppSettings> => {
  const app: string = getAppId()

  const ctxAsContex = ctx as Context

  if (ctxAsContex.type) {
    return ctxAsContex.clients.apps.getAppSettings(app) as Promise<AppSettings>
  }

  const ctxAsIOContex = ctx as IOContext
  const apps = new Apps(ctxAsIOContex)

  return apps.getAppSettings(app) as Promise<AppSettings>
}
