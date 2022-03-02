import {IOClients} from "@vtex/api"

import MappConnectAPI from "./mapp-connect-api"

// Extend the default IOClients implementation with our own custom clients.
export default class Clients extends IOClients {
  public get mappConnectAPI() {
    return this.getOrSet("mappConnectAPI", MappConnectAPI)
  }
}
