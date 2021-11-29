📢 Use this project, [contribute](https://github.com/vtex-apps/mapp-cloud) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

# Mapp Cloud Integration

<!-- DOCS-IGNORE:start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- DOCS-IGNORE:end -->

Enable Mapp Intelligence tracking without touching a single line of code.  
The Mapp Cloud app for Vtex creates the data layer used to feed the Mapp Cloud tracking products. It helps you to easily fuel the Mapp Intelligence customer insights dashboards with data, without requiring you to touch any code. Just get the extension, configure your Tag Integration ID, and enable the plugin.  
Mapp Intelligence gives you access to more than 20 pre-configured dashboards to start analyzing user behavior right away and adjust your marketing accordingly.  
Features:  
- Adds the Mapp Cloud Tag Integration code to the Header of your website
- Creates the standard data layer to start analyzing customer insights immediately
- Enables customers to add the information needed to initialize tracking"
- Initializes tracking


## Configuration

### Using VTEX App Store

1. Access the **Apps** section in your account's admin page and look for the Mapp Cloud Integration box;
2. Then, click on the **Install** button;
3. You'll see a warning message about needing to enter the necessary configurations. Scroll down and type in your **Tag Integration ID** in the `tiId` field.
4. Click on **Save**.

### Using VTEX IO Toolbelt

1. [Install](https://vtex.io/docs/recipes/development/installing-an-app/) the `vtex.icommkt@0.x` app. You can confirm that the app has now been installed by running `vtex ls` again. 
2. Access the **Apps** section in your account's admin page and look for the NAME OF THE APP box. Once you find it, click on the box.
3. Fill in the `tiId` field with your **Tag Integration ID**.
4. Click on **Save**.

### Mapping data in Mapp Cloud
Once Mapp Cloud Integration is active on your Vtex store, you can map data from the global _ti datalayer variable as parameters to your Mapp Intelligence plugin in Tag Integration.
The following data is available:  

|Datalayer Variable     |Suggested mapping      |
|---|---|
|_ti['pageName']        |   Page &#8594; Page Name            |
|_ti['emailOptIn']      |   Visitor &#8594; E-mail-Opt-in   |
|_ti['customerId']      |   Visitor &#8594; Customer ID         |
|_ti['productId']       |   Product &#8594; Product name or ID          |
|_ti['shoppingCartStatus']   | Product &#8594; Shopping cart status   |
|_ti['productCost']   | Product &#8594; Product costs  |
|_ti['currency']   |  Product &#8594; Currency |
| _ti['productName']  | Product &#8594; Currency  |
| _ti['productCategory']  | Product &#8594; Categories   |
| _ti['productQuantity']  | Product &#8594; Product quantity  |
| _ti['totalOrderValue']  | Product &#8594; Total order value  |
| _ti['orderId']  | Product &#8594; Order ID  |
| _ti['couponValue']  |Product &#8594; Predefined &#8594; Voucher value    |
| _ti['numberOfSearchResults']  | Page &#8594; Number of search results  |
| _ti['internalSearch']  | Page &#8594; Internal search phrase |
| _ti['eMailSubscription'] | Visitor &#8594; E-mail receiver ID |


<!-- DOCS-IGNORE:start -->
## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!
<!-- DOCS-IGNORE:end -->
