export type MarketplaceCondition =
  | "new"
  | "used"
  | "foreign_used"
  | "refurbished"
  | "like_new"
  | "good"
  | "fair"
  | "poor";

export type MarketplaceSort =
  | "popular"
  | "newest"
  | "price_asc"
  | "price_desc";

export type MarketplaceCategory = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  categoryName: string;
  categoryIcon: string;
  order: number;
  productCount: number;
  subCategories: MarketplaceSubCategory[];
};

export type MarketplaceSubCategory = {
  _id: string;
  parentId: string;
  categoryName: string;
  categoryIcon: string;
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  productCount: number;
};

export type MarketplaceCategoriesResponse = {
  total: number;
  data: MarketplaceCategory[];
};

export type MarketplaceProductAttribute = {
  _id: string;
  attributeIcon?: string;
  attributeName: string;
  attributeValue: string;
};

export type MarketplaceProduct = {
  _id: string;
  sellerId?: string;
  categoryId?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  title: string;
  description?: string;
  amount: number;
  images: string[];
  location?: {
    state?: string;
    city?: string;
    lga?: string;
  };
  condition?: MarketplaceCondition;
  status?: string;
  negotiable?: boolean;
  phoneNumber?: string;
  tags?: string[];
  slug?: string;
  postedAt?: string;
  rePostedAt?: string;
  isBoosted?: boolean;
  isFeaturedAddon?: boolean;
  isSellerVerified?: boolean;
  attributes?: MarketplaceProductAttribute[];
};

export type MarketplaceProductsResponse = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: MarketplaceProduct[];
};

export type MarketplaceProductResponse = MarketplaceProduct;

export type GetMarketplaceProductsParams = {
  limit?: number;
  page?: number;
  search?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: MarketplaceCondition;
  sort?: MarketplaceSort;
  status?: "active";
};
