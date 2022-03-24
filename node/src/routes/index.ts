import type {MappConnectCatalogItem} from "../typings/mapp-connect-catalog"
import {getUser, getLogger, getAppSettings} from "../utils/utils"

export async function checkMappConnectCredentials(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")

  const {mappConnectAPI} = ctx.clients
  const response = await mappConnectAPI.ping()

  if (response && response.status === 200) {
    ctx.status = 200
    ctx.body = "ok"
  } else {
    ctx.status = 500
    ctx.body = "invalid configuration"
  }

  await next()
}

export async function userUpdate(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"

  const logger = getLogger(ctx.vtex.logger)

  // eslint-disable-next-line no-console
  const {userId, remove, email} = ctx.query
  const {mappConnectAPI} = ctx.clients

  ctx.status = 200
  if (!userId) {
    logger.warn("Routes[updateUser]: usedId was not provided!", {
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
    })
    await next()

    return
  }

  if (remove === "true") {
    if (email && email.length > 0) {
      await mappConnectAPI.deleteUser(email as string)
    } else {
      logger.warn("Route[updateUser]: Failed to remove user, email not passed!", {
        url: ctx.URL,
        query: ctx.query,
        queryString: ctx.querystring,
      })
    }

    await next()

    return
  }

  const user = await getUser(ctx, userId as string)

  if (!user) {
    logger.warn("Routes[updateUser]: Failed to find user with provided userID!", {
      userId,
      url: ctx.URL,
      query: ctx.query,
      queryString: ctx.querystring,
    })
    await next()

    return
  }

  await mappConnectAPI.updateUser(user, await getAppSettings(ctx))

  await next()
}

export async function mappMessages(ctx: Context, next: () => Promise<any>) {
  const logger = getLogger(ctx.vtex.logger)

  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200

  try {
    const response = await ctx.clients.mappConnectAPI.messages()

    if (response?.status !== 200) {
      throw new Error("Status code not 200")
    }

    ctx.body = response?.data
  } catch (err) {
    logger.error("Routes[groups]: Error was trown while fetching data!", {
      err,
    })
    ctx.status = 500
    ctx.body = "Internal error"
  }

  await next()
}

export async function groups(ctx: Context, next: () => Promise<any>) {
  const logger = getLogger(ctx.vtex.logger)

  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200

  try {
    const response = await ctx.clients.mappConnectAPI.group()

    if (response?.status !== 200) {
      throw new Error("Status code not 200")
    }

    ctx.body = response?.data
  } catch (err) {
    logger.error("Routes[groups]: Error was trown while fetching data!", {
      err,
    })
    ctx.status = 500
    ctx.body = "Internal error"
  }

  await next()
}

// const sftpConnection = async (): Promise<void> => {
//   try {
//     const client = new Client()

//     await client.connect({
//       host: "ftp.scenarios.ec-demo.net",
//       username: "pambuk",
//       password: "5SWVec-Bu-zT",
//       debug: (info: string) => {
//         // eslint-disable-next-line no-console
//         console.log(info)
//       },
//     })

//     const files = await client.cwd()

//     // eslint-disable-next-line no-console
//     console.log(files)
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.log("err", err)
//   }
// }

export async function getProducts(ctx: Context, next: () => Promise<any>) {
  const logger = getLogger(ctx.vtex.logger)

  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200

  const response = await ctx.clients.catalog.getAllSKU()

  const productsRequests = response.map(skuID => {
    return ctx.clients.catalog.getAllProductDetails(skuID.toString(), ctx)
  })

  const products = await Promise.all(productsRequests)

  const data = products
    .map(elm => {
      if (!elm) {
        return undefined
      }

      let stockTotal = 0

      elm.inventory.balance.forEach(warehouse => {
        stockTotal += warehouse.totalQuantity - warehouse.reservedQuantity
      })

      return {
        productSKU: elm.sku.Id.toString(),
        productName: elm.product.Name,
        productPrice: elm.price?.basePrice || 0,
        stockTotal,
        productURL: `https://${ctx.URL.hostname}${elm.sku.DetailUrl}`,
        imageURL: elm.sku.ImageUrl,
        zoomImageURL: elm.sku.ImageUrl,
        brand: elm.sku.BrandName,
        category: Object.values(elm.sku.ProductCategories).join(", "),
        description: elm.product.Description || elm.product.DescriptionShort,
      } as MappConnectCatalogItem
    })
    .filter(elm => elm !== undefined) as MappConnectCatalogItem[]

  const csvKeys =
    data.length > 0
      ? Object.keys(data[0])
      : [
          "productSKU",
          "productName",
          "productPrice",
          "stockTotal",
          "productURL",
          "imageURL",
          "zoomImageURL",
          "brand",
          "category",
          "description",
        ]

  logger.info("produts", data)
  ctx.attachment("vtex_products.csv")
  ctx.body = `${csvKeys.join(",")}\r\n${data.map(elm => Object.values(elm).join(",")).join("\r\n")}`

  // await sftpConnection()

  // const res = await ctx.clients.mappConnectAPI.messages()
  // ctx.body = res?.data

  await next()
}

export async function hcheck(ctx: Context, next: () => Promise<any>) {
  ctx.set("Cache-Control", "no-cache")
  ctx.status = 200
  ctx.body = "ok"

  await next()
}

export default {
  hcheck,
  userUpdate,
  groups,
  checkMappConnectCredentials,
  mappMessages,
  getProducts,
}
