import {IOClients} from "@vtex/api"

import {CatalogClient} from "./catolog"
import MappConnectAPI from "./mapp-connect-api"
import OrdersClient from "./orders"
import PricingClient from "./pricing"

// Extend the default IOClients implementation with our own custom clients.
export default class Clients extends IOClients {
  public get mappConnectAPI() {
    return this.getOrSet("mappConnectAPI", MappConnectAPI)
  }

  public get orders() {
    return this.getOrSet("orders", OrdersClient)
  }

  public get catalog() {
    return this.getOrSet("catalog", CatalogClient)
  }

  public get pricing() {
    return this.getOrSet("pricing", PricingClient)
  }
}
