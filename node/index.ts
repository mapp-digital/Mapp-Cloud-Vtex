import type {ClientsConfig, ServiceContext, RecorderState, EventContext} from "@vtex/api"
import {LRUCache, Service} from "@vtex/api"

import events from "./src/events"
import Clients from "./src/clients"
import routes from "./src/routes"

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({max: 5000})

metrics.trackCache("status", memoryCache)
declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients, State>
  // global event context
  type EventChangeContext = EventContext<Clients, State>
  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {
    code: number
  }
}

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: 800,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    status: {
      memoryCache,
    },
    events: {
      exponentialTimeoutCoefficient: 2,
      exponentialBackoffCoefficient: 2,
      initialBackoffDelay: 50,
      retries: 1,
      timeout: 3000,
      concurrency: 10,
    },
  },
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  events,
  routes,
})
