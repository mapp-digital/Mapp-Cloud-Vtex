import type {EventContext, IOClients} from "@vtex/api"

import {orderStatusOnChange} from "./orders"

export async function testEvent(ctx: EventContext<IOClients>) {
  // eslint-disable-next-line no-console
  console.log("RECEIVED EVENT", ctx.body)

  return true
}

export default {
  testEvent,
  orderStatusOnChange,
}
