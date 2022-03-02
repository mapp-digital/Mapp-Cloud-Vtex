import type {EventContext, IOClients} from "@vtex/api"

export async function testEvent(ctx: EventContext<IOClients>) {
  // eslint-disable-next-line no-console
  console.log("RECEIVED EVENT", ctx.body)

  return true
}

export default {
  testEvent,
}
