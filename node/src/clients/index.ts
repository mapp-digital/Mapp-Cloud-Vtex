import {IOClients} from "@vtex/api"

import OrdersClient from "./orders"

// Extend the default IOClients implementation with our own custom clients.
export default class Clients extends IOClients {
  public get orders() {
    return this.getOrSet("orders", OrdersClient)
  }
}
