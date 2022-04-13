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
- Adds the Mapp Acquire code to the Header of your website
- Creates the standard data layer to start analyzing insights immediately
- Initializes tracking

## Configuration

### Using VTEX App Store

1. Access the **Apps** section in your account's admin page and look for the Mapp Cloud Integration box;
2. Then, click on the **Install** button;
3. Under `Apps` you'll find the entry `Mapp Cloud Integration` - there you can enter your credentials (Tag Integration ID, Custom Responder Domain if available, Mapp Acquire Script);
4. Click on **Save**.

### Using VTEX IO Toolbelt

1. [Install](https://vtex.io/docs/recipes/development/installing-an-app/) the `mapppartneruk.mapp-cloud@1.x` app. You can confirm that the app has now been installed by running `vtex ls` again.
2. Access the **Apps** section in your account's admin page and look for the NAME OF THE APP box. Once you find it, click on the box.
3. Fill in the `tiId` field with your **Tag Integration ID**.
4. Click on **Save**.

### Mapp Engage configuration

1. Access the **My Apps** section in your account's admin page and look for the Mapp Cloud Integration box;
2. Find **Mapp Cloud Integration** app under installed apps and click on **Settings** page
3. Navigate to **Engage** tab and fill form for your Mapp integration
4. After pressing **Save** button you should get confirmation that everything is configured correctly
5. In order to provide realtime client/user changes to MappEngage its necessary to configure triggers in Master Data (Check next section).

### Mapp Engage configuration - Master Data Client triggers

First we have to add additional field on CL DataEntity

1. Go to **{vtex-account}.ds.vtexcrm.com.br**
2. Navigate to **Data Entities** page
3. Press to **edit icon** next to CL (Cliente) row
4. Press on **new field** button and set this values (you have to press gear icon next to new field to see all settings)

   - Name: isSubscriber
   - Display Name: User is subscriber or not
   - is nullable?: true/checked
   - is searchable?: true/checked
   - is filterable?: true/checked

5. Press **Save** button at the bottom of the page
6. Navigate back to **Data Entities** page
7. Press **Publish** (save/disc icon) on CL (Cliente) row
8. Popup should appear. Press Ok (Make sure you're editing Cliente-CL entity)

Now we have to setup some triggers

1. Go to **{vtex-account}.ds.vtexcrm.com.br**
2. Navigate to **Triggers** page
3. Click on **Add new** button in top left corner and create new triggers

Client insert trigger

- Name: **client_insert_trigger**
- Data Entity: **Cliente**
- Trigger Rule: **Um registro for inserido** (When record is entered)
- Navigate to **If positive** tab and set Action to **Send a HTTP request**
- Set URL to: **{vtex-account}.myvtex.com/\_v/app/vtex-mapp-cloud/userCreate?userId={!userId}**

Client update trigger

- Name: **client_update_trigger**
- Data Entity: **Cliente**
- Trigger Rule: **Um registro for alterado** (When record is changed)
- Navigate to **If positive** tab and set Action to **Send a HTTP request**
- Set URL to: **{vtex-account}.myvtex.com/\_v/app/vtex-mapp-cloud/userUpdate?userId={!userId}**

Client remove trigger

- Name: **client_remove_trigger**
- Data Entity: **Cliente**
- Trigger Rule: **Um registro for removido** (When record is changed)
- Navigate to **If positive** tab and set Action to **Send a HTTP request**
- Set URL to: **{vtex-account}.myvtex.com/\_v/app/vtex-mapp-cloud/userUpdate?userId={!userId}&remove=true&email={!email}**

### Mapping data in Mapp Cloud

Once Mapp Cloud Integration is active on your Vtex store, you can map data from the global \_ti datalayer variable as parameters to your Mapp Intelligence plugin in Tag Integration.
The following data is available:

| Datalayer Variable         | Suggested mapping                                |
| -------------------------- | ------------------------------------------------ |
| \_ti.pageName              | Page &#8594; Page Name                           |
| \_ti.emailOptIn            | Visitor &#8594; E-mail-Opt-in                    |
| \_ti.customerId            | Visitor &#8594; Customer ID                      |
| \_ti.productId             | Product &#8594; Product name or ID               |
| \_ti.shoppingCartStatus    | Product &#8594; Shopping cart status             |
| \_ti.productCost           | Product &#8594; Product costs                    |
| \_ti.currency              | Product &#8594; Currency                         |
| \_ti.productName           | Product &#8594; Currency                         |
| \_ti.productCategory       | Product &#8594; Categories                       |
| \_ti.productQuantity       | Product &#8594; Product quantity                 |
| \_ti.totalOrderValue       | Product &#8594; Total order value                |
| \_ti.orderId               | Product &#8594; Order ID                         |
| \_ti.couponValue           | Product &#8594; Predefined &#8594; Voucher value |
| \_ti.numberOfSearchResults | Page &#8594; Number of search results            |
| \_ti.internalSearch        | Page &#8594; Internal search phrase              |
| \_ti.eMailSubscription     | Visitor &#8594; E-mail receiver ID               |
| \_ti.vtex                  | Original Vtex event data &#8594; Custom Plugin   |

### Subscribing to MappPageUpdate Event

Right before pageUpdate runs, a custom event called `MappPageUpdate` is dispatched, which includes the current \_ti object as detail data.  
To set it up in Tag Integration, create a new `Rule` with the following settings:

- Event type: CUSTOM_EVENT
- Eventname: MappPageUpdate
- Element: window

Now you can use the tracking data in your custom plugins.
To try it out, create a new plugin with the following code:

```javascript
console.log(
  'TI Plugin - Event log',
  ti_event,
  ti_element,
  ti_eventType,
  ti_eventCounter
)
```

Add `head` as position and assign the `MappPageUpdateRule`.
You can find the event data in `ti_event.detail`, and under `ti_event.detail.vtex` you can find all the data Vtex provides. Use this in conjunction with your TI custom plugin(s) to set up your individual tracking requirements.

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
