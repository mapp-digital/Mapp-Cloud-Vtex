import type {Logger} from "@vtex/api"

export class MappLogger {
  private static instance: MappLogger

  public static getInstance(vtexLogger: Logger): MappLogger {
    if (!MappLogger.instance) {
      MappLogger.instance = new MappLogger(vtexLogger)
    }

    return MappLogger.instance
  }

  constructor(private vtexLogger: Logger) {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (this.vtexLogger && this.vtexLogger.debug !== undefined) {
      this.vtexLogger.debug("Logger created")
    }
  }

  public debug(format: any): void {
    // eslint-disable-next-line no-console
    console.log(format)
  }

  public error(format: any): void {
    // eslint-disable-next-line no-console
    console.log(format)
    this.vtexLogger.error(format)
  }

  public info(format: any): void {
    // eslint-disable-next-line no-console
    console.log(format)
  }

  public log(format: any): void {
    // eslint-disable-next-line no-console
    console.log(format)
  }

  public warn(format: any): void {
    // eslint-disable-next-line no-console
    console.log(format)
    this.vtexLogger.error(format)
  }
}
