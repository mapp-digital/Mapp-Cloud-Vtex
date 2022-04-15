interface MappUserSubscriberDoc {
  id: string
  userId: string
  isSubscriber: boolean
}

interface User {
  id: string
  userId: string
  email: string
  isNewsletterOptIn: boolean
  profilePicture?: string
  isCorporate: boolean
  homePhone?: string
  phone?: string
  businessPhone?: string
  stateRegistration?: string
  firstName?: string
  lastName?: string
  localeDefault?: string
  birthDate?: string
  corporateName?: string
  gender?: string
  birthDateMonth?: string
  isSubscriber: boolean
  mappUserSubDocId: string
}

export interface VtexProductData {
  Id: number
  Name: string | null
  DepartmentId: number | null
  CategoryId: number | null
  BrandId: number | null
  LinkId: string | null
  RefId: string | null
  IsVisible: boolean
  Description: string | null
  DescriptionShort: string | null
  ReleaseDate: Date
  KeyWords: string | null
  Title: string | null
  IsActive: boolean
  TaxCode: string | null
  MetaTagDescription: string | null
  ShowWithoutStock: boolean
}

export interface VtexInventoryDataBalanceData {
  warehouseId: string | null
  warehouseName: string | null
  totalQuantity: number
  reservedQuantity: number
  hasUnlimitedQuantity: boolean
}

export interface VtexInventoryData {
  balance: VtexInventoryDataBalanceData[]
}

export interface VtexSKUData {
  Id: number
  ProductId: number
  NameComplete: string | null
  ComplementName: string | null
  ProductName: string | null
  ProductDescription: string | null
  ProductRefId: string | null
  TaxCode: string | null
  SkuName: string | null
  IsActive: boolean
  IsTransported: boolean
  IsInventoried: boolean
  IsGiftCardRecharge: boolean
  ImageUrl: string | null
  DetailUrl: string | null
  CSCIdentification: string | null
  BrandId: string | null
  BrandName: string | null
  IsBrandActive: boolean
  ManufacturerCode: string | null
  ProductCategoryIds: string | null
  ProductCategories: {[key: string]: string}
  ReleaseDate: Date
  ProductIsVisible: boolean
  ShowIfNotAvailable: boolean
  IsProductActive: boolean
}

export interface VtexPriceData {
  basePrice: number
}

interface Order {
  orderId: string
  clientProfileData: ClientProfileData
  creationDate: string
  value: number
  totals: Total[]
  items: VtexOrderItem[]
  status: string
  statusDescription: string
  sequence: string
  salesChannel: string
  affiliateId: string | null
  origin: string | null
  authorizedDate: string | null
  invoicedDate: string | null
  marketingData?: MarketingData | null
  shippingData: ShippingData
  checkedInPickupPointId: number
  storePreferencesData: StorePreferencesData
  paymentData: any
}
interface StorePreferencesData {
  currencyCode: string
}
interface ClientProfileData {
  email: string
  firstName: string
  lastName: string
  documentType: string
  document: string | null
  phone: string
  corporateName: string | null
  tradeName: string | null
  corporateDocument: string | null
  stateInscription: string | null
  corporatePhone: string | null
  isCorporate: boolean
  userProfileId: string | null
}
interface MarketingData {
  coupon: string
}
interface Total {
  id: string
  name: string
  value: string
}

interface VtexCategory {
  name: string | null
}
interface VtexAdditionalInfo {
  brandName: string | null
  categories: VtexCategory[]
}

interface VtexOrderItem {
  quantity: number
  id: string
  productId: string | null
  price: number
  name: string
  sellerSku: string
  imageUrl: string | null
  detailUrl: string
  additionalInfo: VtexAdditionalInfo | null
}
