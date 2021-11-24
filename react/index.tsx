import { canUseDOM } from 'vtex.render-runtime'
import type { PixelMessage } from './typings/events'

const pageUpdate = () => {
  window.wts = window.wts || [];
  window.wts.push(["send", "pageupdate", true]);
}

const backup = () => {
  const currentDataLayer = JSON.stringify(window._ti);
  window._ti.backup = currentDataLayer;
}

const restore = () => {
  setTimeout(() => {
    window._ti = JSON.parse(window._ti.backup);
  }, 1000);
}

const mergeVtexData = (e: PixelMessage) => {
  const mergedVtexData = { ...window._ti.vtex, ...e.data };
  const newData = { vtex: mergedVtexData };
  window._ti = { ...window._ti, ...newData };
}

const productProps = [
  'productId',
  'productName',
  'productCategory',
  'productQuantity',
  'productCost'
]

const hasItem = (productQuantity: string) => {
  const add = (accumulator: number, a: number) => {
    return accumulator + a;
  };
  const sum = productQuantity.split(";").map(n => Number(n)).reduce(add, 0);
  if (sum > 0) {
    return true
  }
  return false;
}

export function handleEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:pageView': {
      window._ti = { vtex: e.data };
      window._ti.pageName = e.data.pageUrl;
      window._ti.currency = e.data.currency;
      if (e.data.routeId !== 'store.product' && e.data.routeId !== 'store.orderplaced' && e.data.routeId !== 'store.search') {
        pageUpdate();
      }
      break;
    }
    case 'vtex:productView': {
      mergeVtexData(e);
      window._ti.productId = e.data.product.productId;
      window._ti.productName = e.data.product.productName;
      window._ti.productCategory = e.data.product.categories[0];
      window._ti.shoppingCartStatus = "view";
      window._ti.productCost = e.data.product.items[0].sellers[0].commertialOffer.Price.toString();
      window._ti.productQuantity = "1";
      pageUpdate();
      break;
    }
    case 'vtex:internalSiteSearchView': {
      mergeVtexData(e);
      window._ti.numberOfSearchResults = e.data.products.length.toString();
      window._ti.internalSearch = window._ti.vtex.pageTitle.replace(" - undefined", "");
      pageUpdate();
      break;
    }
    case 'vtex:addToCart': {
      backup();
      mergeVtexData(e);
      window._ti.shoppingCartStatus = "add";
      productProps.forEach((productProp) => {
        window._ti[productProp] = "";
      });
      e.data.items.forEach((product) => {
        if (product.quantity > 0) {
          window._ti.productId += product.productId + ';';
          window._ti.productName += product.name + ';';
          window._ti.productCategory += product.category + ';';
          window._ti.productCost += (product.price * product.quantity / 100).toString() + ';';
          window._ti.productQuantity += product.quantity.toString() + ';';
        }
      });
      productProps.forEach((productProp) => {
        window._ti[productProp] = window._ti[productProp].replace(/;$/, '');
      });
      if (window._ti.productQuantity.length > 0 && hasItem(window._ti.productQuantity)) {
        window.wts = window.wts || [];
        window.wts.push(['linkId', 'add-to-cart']);
        pageUpdate();
      }
      restore();
      break;
    }
    case 'vtex:newsletterSubscription': {
      backup();
      window._ti.event = "Newsletter Subscription";
      window._ti.emailOptIn = e.data;
      window._ti.eMailSubscription = e.data;
      pageUpdate();
      restore();
      break;
    }
    case 'vtex:userData': {
      const dl = JSON.stringify(window._ti);
      window._ti = {};
      window._ti.customerId = e.data.email;
      window.wts = window.wts || [];
      window.wts.push(['linkId', 'webtrekk_ignore']);
      window.wts.push(["send", "pageupdate"]);
      setTimeout(() => {
        window.wts.push(['linkId', 'false']);
        window._ti = JSON.parse(dl);
      }, 500)
      break;
    }
    case 'vtex:orderPlaced': {
      mergeVtexData(e);
      window._ti.shoppingCartStatus = "conf";
      window._ti.orderId = e.data.transactionId;
      window._ti.totalOrderValue = e.data.transactionTotal.toString();
      window._ti.coupon = e.data.coupon;
      productProps.forEach((productProp) => {
        window._ti[productProp] = "";
      });
      e.data.transactionProducts.forEach((product) => {
        window._ti.productId += product.id + ';';
        window._ti.productName += product.name + ';';
        window._ti.productCategory += product.category + ';';
        window._ti.productCost += (product.price * product.quantity).toString() + ';';
        window._ti.productQuantity += product.quantity.toString() + ';';
      });
      productProps.forEach((productProp) => {
        window._ti[productProp] = window._ti[productProp].replace(/;$/, '');
      });
      pageUpdate();
      break;
    }
    default: {
      break;
    }
  }
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
