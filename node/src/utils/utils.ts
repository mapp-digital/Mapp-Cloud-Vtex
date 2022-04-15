import type {IOContext, Logger} from "@vtex/api"
import {Apps} from "@vtex/api"

import type {MappUserSubscriberDoc, User} from "../typings/vtex"
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

export const updateMappUserSubscriberDoc = async (
  ctx: Context,
  mappUserSubDocId: string,
  isSubscriber: boolean,
): Promise<void> => {
  const {
    clients: {masterdata},
  } = ctx

  await masterdata.updatePartialDocument({
    dataEntity: "MappUserSubscriber",
    id: mappUserSubDocId,
    fields: {
      isSubscriber,
    },
  })
}

export const getUserSubscriberDocForUserId = async (
  ctx: Context | EventChangeContext,
  userId: string,
): Promise<MappUserSubscriberDoc | undefined> => {
  const {
    clients: {masterdata},
  } = ctx

  const mappUserSubDoc = await masterdata.searchDocuments({
    dataEntity: "MappUserSubscriber",
    schema: "mapp-user-subscriber-v1",
    where: `userId=${userId}`,
    fields: ["id", "userId", "isSubscriber"],
    pagination: {
      page: 1,
      pageSize: 1,
    },
  })

  return mappUserSubDoc.length > 0 ? (mappUserSubDoc[0] as MappUserSubscriberDoc) : undefined
}

export const getUser = async (ctx: Context | EventChangeContext, userId: string): Promise<User | undefined> => {
  if (!userId) {
    return undefined
  }

  const {
    clients: {masterdata},
  } = ctx

  const userDoc = await masterdata.searchDocuments({
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
    ],
    pagination: {
      page: 1,
      pageSize: 1,
    },
  })

  const user = userDoc.length > 0 ? (userDoc[0] as User) : undefined

  if (!user) {
    return undefined
  }

  const mappUserSubDoc = await getUserSubscriberDocForUserId(ctx, user.userId)

  if (!mappUserSubDoc) {
    const doc = await masterdata.createDocument({
      dataEntity: "MappUserSubscriber",
      schema: "mapp-user-subscriber-v1",
      fields: {
        userId: user.userId,
        isSubscriber: false,
      },
    })

    user.mappUserSubDocId = doc.DocumentId
    user.isSubscriber = false

    return user
  }

  user.isSubscriber = mappUserSubDoc.isSubscriber
  user.mappUserSubDocId = mappUserSubDoc.id

  return user
}
