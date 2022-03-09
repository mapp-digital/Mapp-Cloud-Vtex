import type {Logger} from "@vtex/api"

export class MappLogger {
  private static instance: MappLogger

  public static getInstance(vtexLogger: Logger): MappLogger {
    if (!MappLogger.instance) {
      MappLogger.instance = new MappLogger(vtexLogger)
    }

    return MappLogger.instance
  }

  constructor(private vtexLogger: Logger) {}

  public debug(message: string, format: any): void {
    // eslint-disable-next-line no-console
    console.log({
      message,
      ...format,
    })
    this.vtexLogger.debug(message)
  }

  public error(message: string, format: any): void {
    // eslint-disable-next-line no-console
    console.log({
      message,
      ...format,
    })
    this.vtexLogger.error(format)
  }

  public info(message: string, format: any): void {
    // eslint-disable-next-line no-console
    console.log({
      message,
      ...format,
    })
    this.vtexLogger.info(format)
  }

  public warn(message: string, format: any): void {
    // eslint-disable-next-line no-console
    console.log({
      message,
      ...format,
    })
    this.vtexLogger.warn(format)
  }
}
