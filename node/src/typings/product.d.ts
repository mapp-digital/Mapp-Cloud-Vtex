export interface ProductData {
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

export interface InventoryDataBalanceData {
  warehouseId: string | null
  warehouseName: string | null
  totalQuantity: number
  reservedQuantity: number
  hasUnlimitedQuantity: boolean
}

export interface InventoryData {
  balance: InventoryDataBalanceData[]
}

export interface SKUData {
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

export interface PriceData {
  basePrice: number
}
