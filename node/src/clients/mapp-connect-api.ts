// eslint-disable-next-line import/no-nodejs-modules
import * as crypto from "crypto"

import type {InstanceOptions, IOContext, IOResponse} from "@vtex/api"
import {ExternalClient} from "@vtex/api"

import {getAppSettings, getLogger} from "../utils/utils"
import type {MappLogger} from "../utils/logger"
import type {OrderData, ProductData} from "../typings/mapp-connect"
import type {User} from "../typings/vtex"

export interface MappConnectAPIConfig {
  url: string
  integrationID: string
  secret: string
}

export default class MappConnectAPI extends ExternalClient {
  private appSettings?: AppSettings
  private logger: MappLogger

  constructor(context: IOContext, options?: InstanceOptions) {
    super(``, context, {
      ...options,
      timeout: 10000,
    })
    this.logger = getLogger(context.logger)
  }

  public updateProduct(product: ProductData): Promise<IOResponse<any> | undefined> {
    return this.postEvent("product", product)
  }

  public updateOrder(order: OrderData): Promise<IOResponse<any> | undefined> {
    return this.postEvent("transaction", order)
  }

  private prepareUserData(user: User, appSettings: AppSettings, isSubscriber: boolean): {[key: string]: any} {
    const fieldsToIgnore = ["userId", "isSubscriber", "isNewsletterOptIn", "id", "userId", "birthDate"]

    const dataToSend: {[key: string]: any} = {}

    Object.keys(user).forEach(elm => {
      if (!fieldsToIgnore.includes(elm)) {
        dataToSend[elm] = (user as any)[elm]
      }
    })

    dataToSend.dateOfBirth = user.birthDate
    dataToSend.id = user.userId

    if (dataToSend.gender) {
      dataToSend.gender = dataToSend.gender.toLowerCase() === "male" ? "1" : "2"
    } else {
      dataToSend.gender = "0"
    }

    const data: {[key: string]: any} = {
      ...dataToSend,
      group: isSubscriber ? appSettings.subscribersGroupID : appSettings.customerGroupID,
    }

    if (isSubscriber) {
      if (appSettings.newsletterDoubleOptIn.toLowerCase() === "on") {
        data.doubleOptIn = "true"
      }
    }

    if (isSubscriber && !user.isNewsletterOptIn) {
      data.unsubscribe = "true"
    }

    return data
  }

  public updateUser(user: User, appSettings: AppSettings, isSubscriber: boolean): Promise<IOResponse<any> | undefined> {
    const data = this.prepareUserData(user, appSettings, isSubscriber)

    if (data.group === "0" || !data.group || data.group.length === 0) {
      throw new Error("No groups configured!")
    }

    return this.postEvent("user", data)
  }

  public deleteUser(email: string): Promise<IOResponse<any> | undefined> {
    return this.postEvent("user", {
      email,
      delete: true,
    })
  }

  public getMessages(): Promise<IOResponse<any> | undefined> {
    return this.get("message")
  }

  public getGroups(): Promise<IOResponse<any> | undefined> {
    return this.get("group")
  }

  public getPing(): Promise<IOResponse<any> | undefined> {
    return this.get("ping")
  }

  private async postEvent(event: string, data?: any): Promise<IOResponse<any> | undefined> {
    const settings = await this.getConfig(this.context)

    if (!settings) {
      return undefined
    }

    const endpoint = `/api/v1/integration/${settings.integrationID}/event`
    const token = this.generateJwt(JSON.stringify(data), endpoint, `subtype=${event}`, settings.secret)
    const url = `${settings.url}${endpoint}?subtype=${event}`

    try {
      const toRet = await this.http.postRaw(url, data, {
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      })

      if (toRet.status !== 200) {
        this.logger.warn(`MappConnectAPI[postEvent]: POST request. Status is not 200! Status: ${toRet.status}`, {
          event,
          url,
          data: JSON.stringify(data),
          status: toRet.status,
          body: toRet.data,
        })
      } else {
        this.logger.debug(`MappConnectAPI[postEvent]: POST request. Event: ${event}. Status: ${toRet.status}`, {
          event,
          url,
          data: JSON.stringify(data),
          status: toRet.status,
          body: toRet.data,
        })
      }

      return toRet
    } catch (err) {
      this.logger.error(`MappConnectAPI[postEvent]: Error in POST Request! Event: ${event}`, {
        event,
        url,
        err,
        data: JSON.stringify(data),
      })
    }

    return undefined
  }

  private async get(path: string): Promise<IOResponse<any> | undefined> {
    const settings = await this.getConfig(this.context)

    if (!settings) {
      return undefined
    }

    const endpoint = `/api/v1/integration/${settings.integrationID}/${path}`
    const token = this.generateJwt(undefined, endpoint, undefined, settings.secret)
    const url = `${settings.url}${endpoint}`

    try {
      // eslint-disable-next-line no-console
      const toRet = await this.http.getRaw(url, {
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      })

      if (toRet.status !== 200) {
        this.logger.warn(`MappConnectAPI[get]: GET reques. Status is not 200! Status: ${toRet.status}`, {
          url,
          path,
          status: toRet.status,
          body: toRet.data,
        })
      } else {
        this.logger.debug(`MappConnectAPI[get]: GET request. Status: ${toRet.status}, Path: ${path}`, {
          url,
          path,
          status: toRet.status,
          body: toRet.data,
        })
      }

      return toRet
    } catch (err) {
      this.logger.error(`MappConnectAPI[get]: Error in GET Request! Path: ${path}`, {
        url,
        err,
        path,
      })
    }

    return undefined
  }

  private async getConfig(context: IOContext): Promise<MappConnectAPIConfig | undefined> {
    if (!this.appSettings) {
      this.appSettings = await getAppSettings(context)
    }

    const settings = {
      url: this.appSettings.engageApiUrl ? this.appSettings.engageApiUrl.replace("http://", "https://") : undefined,
      integrationID: this.appSettings.engageIntegrationId,
      secret: this.appSettings.engageSecret,
    } as MappConnectAPIConfig

    if (!settings.url || !settings.integrationID || !settings.secret) {
      this.logger.error(`MappConnectAPI[getConfig]: Missing configuration!`, {
        url: settings.url,
        integrationID: settings.integrationID,
        secret: settings.secret,
      })

      return undefined
    }

    return settings
  }

  // eslint-disable-next-line max-params
  private generateJwt(
    requestBody: string | undefined,
    url: string,
    queryString: string | undefined,
    key: string,
  ): string {
    let requestData = url.toString()

    if (requestBody) {
      requestData = `${requestData}|${requestBody}`
    }

    if (queryString) {
      requestData = `${requestData}|${queryString.toString()}`
    }

    const hash = crypto.createHash("sha1")
    const requestHash = hash.update(requestData).digest("hex")
    const jwtHeader = {
      alg: "HS256",
    }

    const jwtBody = {
      "request-hash": requestHash,
      "exp": Date.now() + 600000,
    }

    const encodedBody = this.encodeParams(jwtBody)
    const encodedHeader = this.encodeParams(jwtHeader)
    const signature = this.normalizeBase64string(
      crypto.createHmac("sha256", key).update(`${encodedHeader}.${encodedBody}`).digest("base64"),
    )

    return `${encodedHeader}.${encodedBody}.${signature}`
  }

  private encodeParams(object: any): string {
    const buff = Buffer.from(JSON.stringify(object))

    return this.normalizeBase64string(buff.toString("base64"))
  }

  private normalizeBase64string(base64String: string): string {
    return base64String.replace("+", "-").replace("/", "_").replace(/=+$/, "")
  }
}
