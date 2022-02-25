import type {Logger} from "@vtex/api"

export const getLogger = (ctx: Context): Logger => ctx.vtex.logger
