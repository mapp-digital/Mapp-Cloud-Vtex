// eslint-disable-next-line import/no-nodejs-modules
import * as crypto from "crypto"

import type {InstanceOptions, IOContext, IOResponse, Logger} from "@vtex/api"
import {ExternalClient} from "@vtex/api"

import {getAppSettings} from "../utils/utils"

export interface MappConnectAPIConfig {
  url: string
  integrationID: string
  secret: string
}

export default class MappConnectAPI extends ExternalClient {
  private appSettings?: AppSettings
  private logger: Logger

  constructor(context: IOContext, options?: InstanceOptions) {
    super(``, context, {
      ...options,
      timeout: 10000,
    })
    this.logger = context.logger
  }

  public ping(): Promise<IOResponse<any> | undefined> {
    return this.get("ping")
  }

  public async postEvent(event: string, data?: any): Promise<IOResponse<any> | undefined> {
    const settings = await this.getConfig(this.context)

    if (!settings) {
      return undefined
    }

    const endpoint = `/api/v1/integration/${settings.integrationID}/event`
    const token = this.generateJwt(undefined, endpoint, undefined, settings.secret)
    const url = `${settings.url}${endpoint}`

    try {
      const toRet = await this.http.postRaw(url, data, {
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        metric: `post(${event})`,
      })

      if (toRet.status !== 200) {
        this.logger.warn({
          msg: `MappConnectAPI: POST request. Status is not 200!`,
          event,
          url,
          data,
          response: toRet,
        })
      } else {
        this.logger.debug({
          msg: `MappConnectAPI: POST request`,
          event,
          url,
          data,
          response: toRet,
        })
      }

      return toRet
    } catch (err) {
      this.logger.error({
        msg: `MappConnectAPI: Error in POST Request!`,
        event,
        url,
        err,
        data,
      })
    }

    return undefined
  }

  public async get(path: string): Promise<IOResponse<any> | undefined> {
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
        metric: `get_${path}`,
      })

      if (toRet.status !== 200) {
        this.logger.warn({
          msg: `MappConnectAPI: GET reques. Status is not 200!`,
          url,
          path,
          response: toRet,
        })
      } else {
        this.logger.debug({
          msg: `MappConnectAPI: GET request`,
          url,
          path,
          response: toRet,
        })
      }

      return toRet
    } catch (err) {
      this.logger.error({
        msg: `MappConnectAPI: Error in POST Request!`,
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
      url: this.appSettings.engageApiUrl.replace("http://", "https://"),
      integrationID: this.appSettings.engageIntegrationId,
      secret: this.appSettings.engageSecret,
    } as MappConnectAPIConfig

    if (!settings.url || !settings.integrationID || !settings.secret) {
      this.logger.error({
        msg: `MappConnectAPI: Missing configuration!`,
        url: settings.url,
        integrationID: settings.integrationID,
        secretExist: settings.secret.length > 0,
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
