import type {IOContext, Logger} from "@vtex/api"
import {Apps} from "@vtex/api"

import type {User} from "../typings/vtex"
import {MappLogger} from "./logger"

export const getLogger = (vtexLogger: Logger): MappLogger => {
  return MappLogger.getInstance(vtexLogger)
}

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

export const updateisSubscriberCLDoc = async (ctx: Context, id: string, isSubscriber: boolean): Promise<void> => {
  const {
    clients: {masterdata},
  } = ctx

  await masterdata.updatePartialDocument({
    dataEntity: "CL",
    id,
    fields: {
      isSubscriber,
    },
  })
}

export const getUser = async (ctx: Context | EventChangeContext, userId: string): Promise<User | undefined> => {
  if (!userId) {
    return undefined
  }

  const {
    clients: {masterdata},
  } = ctx

  const doc = await masterdata.searchDocuments({
    dataEntity: "CL",
    where: `userId=${userId}`,
    fields: [
      "id",
      "userId",
      "email",
      "isNewsletterOptIn",
      "profilePicture",
      "isCorporate",
      "homePhone",
      "phone",
      "stateRegistration",
      "firstName",
      "lastName",
      "document",
      "localeDefault",
      "approved",
      "birthDate",
      "businessPhone",
      "corporateDocument",
      "corporateName",
      "documentType",
      "gender",
      "birthDateMonth",
      "isSubscriber",
    ],
    pagination: {
      page: 1,
      pageSize: 1,
    },
  })

  return doc.length > 0 ? (doc[0] as User) : undefined
}
