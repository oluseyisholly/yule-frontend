"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import ModalStepLayout from "@/components/ModalStepLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { GiftGridLoadingSkeleton } from "@/components/ui/context-skeletons";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/Button";
import FilterDrawer from "@/components/FilterDrawer";
import FlowActionButtons from "@/components/FlowActionButtons";
import filterIcon from "@/assets/icons/filter.svg";
import verifiedIcon from "@/assets/icons/verified.svg";
import locationIcon from "@/assets/icons/location.svg";
import dropdownIcon from "@/assets/icons/dropdowns.svg";
import { cn } from "@/lib/utils";
import { useMarketplaceCategoriesQuery } from "@/features/marketplace/hooks/useMarketplaceCategoriesQuery";
import {
  useMarketplaceProductsInfiniteQuery,
  useMarketplaceProductsQuery,
} from "@/features/marketplace/hooks/useMarketplaceProductsQuery";
import type {
  MarketplaceCategory,
  MarketplaceCondition,
  MarketplaceProduct,
} from "@/features/marketplace/types";
import { BackIcon } from "./BackLink";

type WishlistGiftSelectionStepProps = {
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onSelectedProductToggle: (
    product: MarketplaceProduct,
    checked: boolean,
  ) => void;
  onViewProduct?: (product: MarketplaceProduct) => void;
  maximumSpend?: number;
  onBack?: () => void;
  onNext: () => void;
  onSaveAndContinue?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  saveAndContinueLabel?: string;
  isSaveAndContinuePending?: boolean;
  isInitialSelectionLoading?: boolean;
  isInitialSelectionError?: boolean;
  onRetryInitialSelection?: () => void;
  selectionMode?: "single" | "multiple";
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  emptyStateText?: string;
  hideFooterActions?: boolean;
  disableContentScroll?: boolean;
  enableInfiniteScroll?: boolean;
  externalProducts?: MarketplaceProduct[];
  externalSourceLabel?: string;
  externalSourceDescription?: string;
  externalSourceAction?: ReactNode;
  externalProductsLoading?: boolean;
  externalProductsError?: boolean;
  onRetryExternalProducts?: () => void;
  hideSelectionControls?: boolean;
  caughtMyEyeProductIds?: string[];
  prioritizedProductIds?: string[];
  deferProductsUntilInitialSelectionResolved?: boolean;
  nextClassName?: string;
  backClassName?: string;
};

type FilterOption = {
  label: string;
  value: string;
};

type WishlistFilterDropdownProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange?: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const PAGE_SIZE = 8;

const CONDITION_OPTIONS: FilterOption[] = [
  { label: "Any Condition", value: "" },
  { label: "New", value: "new" },
  { label: "Used", value: "used" },
  { label: "Foreign Used", value: "foreign_used" },
  { label: "Refurbished", value: "refurbished" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
];

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 3 || current >= total - 2) {
    return [1, 2, 3, "...", total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

function formatConditionLabel(condition?: MarketplaceCondition) {
  if (!condition) {
    return "Available";
  }

  return condition
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatLocation(product: MarketplaceProduct) {
  const city = product.location?.city?.trim();
  const state = product.location?.state?.trim();

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || "Location unavailable";
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-NG").format(amount);
}

function CaughtMyEyeLoveIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 5.57355L11.452 6.08555C11.5222 6.16065 11.607 6.22052 11.7013 6.26145C11.7956 6.30238 11.8972 6.3235 12 6.3235C12.1028 6.3235 12.2044 6.30238 12.2987 6.26145C12.393 6.22052 12.4778 6.16065 12.548 6.08555L12 5.57355ZM2.652 13.6816C2.70148 13.7687 2.76793 13.8451 2.84743 13.9062C2.92693 13.9672 3.01787 14.0117 3.11486 14.0371C3.21186 14.0624 3.31294 14.068 3.41215 14.0536C3.51135 14.0392 3.60665 14.005 3.69243 13.9531C3.7782 13.9012 3.85271 13.8327 3.91154 13.7515C3.97037 13.6704 4.01233 13.5782 4.03495 13.4806C4.05756 13.3829 4.06037 13.2817 4.0432 13.1829C4.02603 13.0842 3.98924 12.9899 3.935 12.9056L2.652 13.6816ZM6.537 16.1706C6.46924 16.0963 6.38722 16.0364 6.29584 15.9944C6.20445 15.9524 6.10557 15.9293 6.00505 15.9263C5.90454 15.9233 5.80446 15.9406 5.71075 15.9771C5.61705 16.0136 5.53164 16.0685 5.4596 16.1387C5.38756 16.2088 5.33037 16.2928 5.29142 16.3855C5.25248 16.4782 5.23257 16.5778 5.23288 16.6783C5.2332 16.7789 5.25374 16.8784 5.29327 16.9708C5.3328 17.0633 5.39052 17.1468 5.463 17.2166L6.537 16.1706ZM2.75 9.31755C2.75 6.41255 4.018 4.61755 5.586 4.00255C7.151 3.38955 9.34 3.82755 11.452 6.08555L12.548 5.06155C10.16 2.50755 7.349 1.70155 5.039 2.60555C2.732 3.50955 1.25 5.99155 1.25 9.31755H2.75ZM15.51 19.9596C17.003 18.7486 18.791 17.1256 20.213 15.3126C21.62 13.5186 22.75 11.4336 22.75 9.31555H21.25C21.25 10.9276 20.37 12.6796 19.032 14.3866C17.708 16.0756 16.016 17.6186 14.566 18.7946L15.51 19.9596ZM22.75 9.31555C22.75 5.99055 21.268 3.50855 18.96 2.60555C16.65 1.70055 13.84 2.50555 11.452 5.06055L12.548 6.08555C14.66 3.82755 16.849 3.38855 18.414 4.00155C19.982 4.61555 21.25 6.41155 21.25 9.31555H22.75ZM8.49 19.9606C9.76 20.9926 10.642 21.7496 12 21.7496V20.2496C11.277 20.2496 10.827 19.9256 9.434 18.7956L8.49 19.9606ZM14.566 18.7946C13.173 19.9246 12.723 20.2496 12 20.2496V21.7496C13.358 21.7496 14.241 20.9926 15.511 19.9606L14.566 18.7946ZM3.936 12.9056C3.187 11.6696 2.75 10.4546 2.75 9.31755H1.25C1.25 10.8296 1.826 12.3176 2.652 13.6816L3.936 12.9056ZM9.434 18.7956C8.41879 17.9768 7.45152 17.1004 6.537 16.1706L5.463 17.2166C6.41739 18.1894 7.42877 19.1056 8.49 19.9606L9.434 18.7956Z"
        fill="#E04F4F"
      />
    </svg>
  );
}

function parsePriceFilterValue(value: string) {
  const normalizedValue = value.replace(/[^\d.]/g, "");

  if (!normalizedValue) {
    return undefined;
  }

  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : undefined;
}

function getCategoryOptions(categories: MarketplaceCategory[]) {
  return [
    { label: "All Categories", value: "" },
    ...categories.map((category) => ({
      label: category.categoryName,
      value: category.slug,
    })),
  ];
}

function getSubCategoryOptions(
  categories: MarketplaceCategory[],
  selectedCategorySlug: string,
) {
  const activeCategory = categories.find(
    (category) => category.slug === selectedCategorySlug,
  );

  if (!activeCategory) {
    return [{ label: "All Subcategories", value: "" }];
  }

  return [
    { label: "All Subcategories", value: "" },
    ...activeCategory.subCategories.map((subCategory) => ({
      label: subCategory.categoryName,
      value: subCategory.slug,
    })),
  ];
}

function getSelectedOptionLabel(
  label: string,
  value: string,
  options: FilterOption[],
) {
  if (!value) {
    return label;
  }

  return options.find((option) => option.value === value)?.label ?? label;
}

function WishlistFilterDropdown({
  label,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  className,
}: WishlistFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const displayLabel = getSelectedOptionLabel(label, value, options);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-[12px] font-medium transition-colors sm:w-auto sm:justify-start",
          disabled
            ? "cursor-not-allowed border-gray-200 bg-[#F1F3F5] text-[#B0B4BA]"
            : "border-gray-200 bg-[#E4E9ED] text-[#716F6F] hover:bg-[#DCE2E7]",
        )}
      >
        <span>
          {loading ? (
            <Skeleton className="h-4 w-20 rounded-full" />
          ) : (
            displayLabel
          )}
        </span>
        <Image
          src={dropdownIcon}
          alt=""
          aria-hidden
          className={cn(
            "h-3 w-3 transition-transform",
            open && !disabled && "rotate-180",
            disabled && "opacity-45",
          )}
        />
      </button>

      {open && !disabled ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 z-20 mt-1.5 max-h-64 w-full min-w-[200px] overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg sm:w-auto"
        >
          {options.map((option) => (
            <li key={`${label}-${option.value || "all"}`}>
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3.5 py-2 text-left text-[13px] transition-colors hover:bg-gray-100",
                  value === option.value
                    ? "font-semibold text-[#3300C9]"
                    : "text-dark",
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GiftCard({
  product,
  checked,
  onToggle,
  onView,
  hideSelectionControls = false,
  isCaughtMyEye = false,
}: {
  product: MarketplaceProduct;
  checked: boolean;
  onToggle: () => void;
  onView?: () => void;
  hideSelectionControls?: boolean;
  isCaughtMyEye?: boolean;
}) {
  const primaryImage = product.images[0] || "";

  return (
    <div className="flex h-full min-w-0 flex-col gap-2 rounded-[10px] border border-gray-100 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:gap-2.5 sm:rounded-[12px] sm:px-3 sm:py-2">
      <div className="relative h-[96px] w-full overflow-hidden rounded-[6px] bg-gray-100 sm:h-[110px] lg:h-[120px]">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-[#8A8892]">
            No image
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-0.5 sm:px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-nunito text-[12px] font-semibold text-[#4E4C4D] sm:text-[14px] lg:text-[16px]">
            {product.title}
          </h3>
          <Image
            src={verifiedIcon}
            alt="Product badge"
            className="h-[14px] w-[14px] shrink-0 sm:h-[16px] sm:w-[16px] lg:h-[18px] lg:w-[18px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex w-fit max-w-full items-center truncate rounded-[10px] border border-[#FF6600] bg-[#FF66001A] px-1.5 py-0.5 text-[8px] font-medium text-[#FF6600] sm:px-2 sm:text-[9px] lg:text-[10px]">
            {formatConditionLabel(product.condition)}
          </span>
          {isCaughtMyEye ? <CaughtMyEyeLoveIcon /> : null}
        </div>

        <p className="line-clamp-1 text-[8px] leading-snug text-neutral sm:line-clamp-2 sm:text-[9px]">
          {product.description?.trim() ||
            "No description available for this product yet."}
        </p>

        <div className="flex items-center gap-1 text-[8px] text-[#97989A] sm:text-[9px]">
          <Image
            src={locationIcon}
            alt="Location"
            className="h-[7px] w-[5px] shrink-0 sm:h-[7.5px] sm:w-[5.5px]"
          />
          <span className="truncate">{formatLocation(product)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="min-w-0 truncate text-[10px] font-semibold leading-[117%] tracking-[0.03em] text-darker sm:text-[11px] lg:text-[12px]">
            ₦{formatPrice(product.amount)}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {onView ? (
              <button
                type="button"
                onClick={onView}
                className="inline-flex h-7 items-center justify-center rounded-full border border-[#3300C9] bg-white px-3 text-[10px] font-semibold text-[#3300C9] transition-colors hover:bg-[#F6F2FF]"
              >
                View
              </button>
            ) : null}
            {hideSelectionControls ? null : (
              <Checkbox
                checked={checked}
                onCheckedChange={onToggle}
                aria-label={`Select ${product.title}`}
                className="size-4.5 shrink-0 rounded-[4px] border-[#3300C9] data-[state=checked]:border-[#3300C9] data-[state=checked]:bg-[#3300C9] data-[state=checked]:text-white sm:size-5 sm:rounded-[5px]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WishlistGiftSelectionStep({
  selectedIds,
  onSelectedIdsChange,
  onSelectedProductToggle,
  onViewProduct,
  maximumSpend,
  onBack,
  onNext,
  onSaveAndContinue,
  nextDisabled = false,
  nextLabel = "Next",
  saveAndContinueLabel = "Save & Continue",
  isSaveAndContinuePending = false,
  isInitialSelectionLoading = false,
  isInitialSelectionError = false,
  onRetryInitialSelection,
  selectionMode = "multiple",
  title = "Gifts speak louder than words.",
  description = "While you're typing that heartfelt message, let us help you find the perfect surprise to brighten their day.",
  searchPlaceholder = "Search for Gift",
  emptyStateText = "No gifts matched your current filters.",
  hideFooterActions = false,
  disableContentScroll = false,
  enableInfiniteScroll = false,
  externalProducts,
  externalSourceLabel,
  externalSourceDescription,
  externalSourceAction,
  externalProductsLoading = false,
  externalProductsError = false,
  onRetryExternalProducts,
  hideSelectionControls = false,
  caughtMyEyeProductIds = [],
  prioritizedProductIds = [],
  deferProductsUntilInitialSelectionResolved = false,
}: WishlistGiftSelectionStepProps) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [draftCategorySlug, setDraftCategorySlug] = useState("");
  const [draftSubCategorySlug, setDraftSubCategorySlug] = useState("");
  const [draftCondition, setDraftCondition] = useState("");
  const [draftMinimumPrice, setDraftMinimumPrice] = useState("");
  const [draftMaximumPrice, setDraftMaximumPrice] = useState("");
  const onSelectedProductToggleRef = useRef(onSelectedProductToggle);
  const isExternalProductSource = Array.isArray(externalProducts);

  useEffect(() => {
    onSelectedProductToggleRef.current = onSelectedProductToggle;
  }, [onSelectedProductToggle]);

  const deferredQuery = useDeferredValue(query);
  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useMarketplaceCategoriesQuery({
    enabled: !isExternalProductSource,
  });

  const categories = categoriesResponse?.data ?? [];
  const categoryOptions = useMemo(
    () => getCategoryOptions(categories),
    [categories],
  );
  const subCategoryOptions = useMemo(
    () => getSubCategoryOptions(categories, draftCategorySlug),
    [categories, draftCategorySlug],
  );
  const resolvedMinimumPrice = useMemo(
    () => parsePriceFilterValue(minimumPrice),
    [minimumPrice],
  );
  const resolvedMaximumPrice = useMemo(
    () => parsePriceFilterValue(maximumPrice),
    [maximumPrice],
  );
  const prioritizedProductIdsForQuery = useMemo(
    () => Array.from(new Set(prioritizedProductIds.filter(Boolean))),
    [prioritizedProductIds],
  );
  const prioritizedProductIdSet = useMemo(
    () => new Set(prioritizedProductIdsForQuery),
    [prioritizedProductIdsForQuery],
  );

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useMarketplaceProductsQuery(
    {
      limit: PAGE_SIZE,
      page: currentPage,
      search: deferredQuery.trim() || undefined,
      productIds: prioritizedProductIdsForQuery,
      categorySlug: selectedCategorySlug || undefined,
      subCategorySlug: selectedSubCategorySlug || undefined,
      minPrice: resolvedMinimumPrice,
      maxPrice: resolvedMaximumPrice,
      condition: (selectedCondition || undefined) as
        | MarketplaceCondition
        | undefined,
      status: "active",
    },
    {
      enabled:
        !enableInfiniteScroll &&
        !isExternalProductSource &&
        (!deferProductsUntilInitialSelectionResolved ||
          !isInitialSelectionLoading),
    },
  );

  const {
    data: infiniteProductsResponse,
    isLoading: isInfiniteProductsLoading,
    isFetchingNextPage,
    isError: isInfiniteProductsError,
    hasNextPage,
    fetchNextPage,
    refetch: refetchInfiniteProducts,
  } = useMarketplaceProductsInfiniteQuery(
    {
      limit: PAGE_SIZE,
      search: deferredQuery.trim() || undefined,
      productIds: prioritizedProductIdsForQuery,
      categorySlug: selectedCategorySlug || undefined,
      subCategorySlug: selectedSubCategorySlug || undefined,
      minPrice: resolvedMinimumPrice,
      maxPrice: resolvedMaximumPrice,
      condition: (selectedCondition || undefined) as
        | MarketplaceCondition
        | undefined,
      status: "active",
    },
    {
      enabled:
        enableInfiniteScroll &&
        !isExternalProductSource &&
        (!deferProductsUntilInitialSelectionResolved ||
          !isInitialSelectionLoading),
    },
  );

  const infiniteProducts = useMemo(
    () =>
      infiniteProductsResponse?.pages.flatMap((page) => page.data ?? []) ?? [],
    [infiniteProductsResponse?.pages],
  );
  const filteredExternalProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!isExternalProductSource) {
      return [];
    }

    if (!normalizedQuery) {
      return externalProducts ?? [];
    }

    return (externalProducts ?? []).filter((product) => {
      const haystack = [
        product.title,
        product.description,
        product.categorySlug,
        product.subCategorySlug,
        product.condition,
        product.location?.city,
        product.location?.state,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, externalProducts, isExternalProductSource]);
  const rawProducts = isExternalProductSource
    ? filteredExternalProducts
    : enableInfiniteScroll
      ? infiniteProducts
      : (productsResponse?.data ?? []);
  const products = useMemo(() => {
    if (!prioritizedProductIdsForQuery.length) {
      return rawProducts;
    }

    const prioritizedProducts: MarketplaceProduct[] = [];
    const remainingProducts: MarketplaceProduct[] = [];

    rawProducts.forEach((product) => {
      if (prioritizedProductIdSet.has(product._id)) {
        prioritizedProducts.push(product);
        return;
      }

      remainingProducts.push(product);
    });

    prioritizedProducts.sort(
      (left, right) =>
        prioritizedProductIdsForQuery.indexOf(left._id) -
        prioritizedProductIdsForQuery.indexOf(right._id),
    );

    return [...prioritizedProducts, ...remainingProducts];
  }, [prioritizedProductIdSet, prioritizedProductIdsForQuery, rawProducts]);
  const totalPages = Math.max(productsResponse?.totalPages ?? 1, 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pages = buildPages(safeCurrentPage, totalPages);
  const infiniteScrollSentinelRef = useRef<HTMLDivElement | null>(null);
  const hydratedSelectedProductIdsRef = useRef<Set<string>>(new Set());
  const caughtMyEyeProductIdSet = useMemo(
    () => new Set(caughtMyEyeProductIds.filter(Boolean)),
    [caughtMyEyeProductIds],
  );

  useEffect(() => {
    if (!products.length || !selectedIds.length) {
      return;
    }

    const selectedIdSet = new Set(selectedIds);

    products.forEach((product) => {
      if (
        selectedIdSet.has(product._id) &&
        !hydratedSelectedProductIdsRef.current.has(product._id)
      ) {
        hydratedSelectedProductIdsRef.current.add(product._id);
        onSelectedProductToggleRef.current(product, true);
      }
    });
  }, [products, selectedIds]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!enableInfiniteScroll) {
      return;
    }

    const sentinel = infiniteScrollSentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [enableInfiniteScroll, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!isFilterDrawerOpen) {
      return;
    }

    setDraftCategorySlug(selectedCategorySlug);
    setDraftSubCategorySlug(selectedSubCategorySlug);
    setDraftCondition(selectedCondition);
    setDraftMinimumPrice(minimumPrice);
    setDraftMaximumPrice(maximumPrice);
  }, [
    isFilterDrawerOpen,
    maximumPrice,
    minimumPrice,
    selectedCategorySlug,
    selectedCondition,
    selectedSubCategorySlug,
  ]);

  const toggleGiftSelection = (product: MarketplaceProduct) => {
    const giftId = product._id;
    const isCurrentlySelected = selectedIds.includes(giftId);
    const nextChecked = !isCurrentlySelected;

    if (
      nextChecked &&
      typeof maximumSpend === "number" &&
      maximumSpend > 0 &&
      product.amount > maximumSpend
    ) {
      toast.error("Budget has been exceeded for this draw name.", {
        id: "draw-name-budget-exceeded",
        position: "top-center",
      });
      return;
    }

    onSelectedIdsChange(
      isCurrentlySelected
        ? selectedIds.filter((id) => id !== giftId)
        : selectionMode === "single"
          ? [giftId]
          : [...selectedIds, giftId],
    );
    onSelectedProductToggle(product, nextChecked);
  };

  const handleCategoryChange = (value: string) => {
    setDraftCategorySlug(value);
    setDraftSubCategorySlug("");
  };

  const handleSubCategoryChange = (value: string) => {
    setDraftSubCategorySlug(value);
  };

  const handleConditionChange = (value: string) => {
    setDraftCondition(value);
  };

  const handleMinimumPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftMinimumPrice(event.target.value.replace(/[^\d.]/g, ""));
  };

  const handleMaximumPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftMaximumPrice(event.target.value.replace(/[^\d.]/g, ""));
  };

  const handleApplyFilters = () => {
    setSelectedCategorySlug(draftCategorySlug);
    setSelectedSubCategorySlug(draftSubCategorySlug);
    setSelectedCondition(draftCondition);
    setMinimumPrice(draftMinimumPrice);
    setMaximumPrice(draftMaximumPrice);
    setCurrentPage(1);
    setIsFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setDraftCategorySlug("");
    setDraftSubCategorySlug("");
    setDraftCondition("");
    setDraftMinimumPrice("");
    setDraftMaximumPrice("");
  };

  const activeFilterCount = [
    selectedCategorySlug,
    selectedSubCategorySlug,
    selectedCondition,
    minimumPrice,
    maximumPrice,
  ].filter(Boolean).length;

  const drawerFilterControls = (
    <>
      <WishlistFilterDropdown
        label="Category"
        value={draftCategorySlug}
        options={categoryOptions}
        onChange={handleCategoryChange}
        loading={isCategoriesLoading}
        className="w-full"
      />

      <WishlistFilterDropdown
        label="Subcategory"
        value={draftSubCategorySlug}
        options={subCategoryOptions}
        onChange={handleSubCategoryChange}
        disabled={!draftCategorySlug || isCategoriesLoading}
        className="w-full"
      />

      <WishlistFilterDropdown
        label="Condition"
        value={draftCondition}
        options={CONDITION_OPTIONS}
        onChange={handleConditionChange}
        className="w-full"
      />

      <div className="rounded-[16px] border border-[#F0ECF7] bg-[#FAF8FF] p-4">
        <p className="mb-3 text-[13px] font-semibold text-[#434343]">
          Price range
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="relative min-w-0 w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#716F6F]">
              ₦
            </span>
            <Input
              value={draftMinimumPrice}
              onChange={handleMinimumPriceChange}
              inputMode="numeric"
              placeholder="Minimum price"
              className="h-11 rounded-[14px] border-[#E5DFF4] bg-white pl-7 text-[13px] font-medium text-[#434343] placeholder:text-[#716F6F]"
            />
          </div>

          <div className="relative min-w-0 w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#716F6F]">
              ₦
            </span>
            <Input
              value={draftMaximumPrice}
              onChange={handleMaximumPriceChange}
              inputMode="numeric"
              placeholder="Maximum price"
              className="h-11 rounded-[14px] border-[#E5DFF4] bg-white pl-7 text-[13px] font-medium text-[#434343] placeholder:text-[#716F6F]"
            />
          </div>
        </div>
      </div>

      {/* <div className="rounded-[16px] border border-dashed border-[#E5DFF4] bg-white p-4">
        <p className="text-[13px] font-semibold text-[#434343]">Coming soon</p>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <WishlistFilterDropdown
            label="Sex"
            value=""
            options={[{ label: "Sex", value: "" }]}
            disabled
            className="w-full"
          />
          <WishlistFilterDropdown
            label="Gift"
            value=""
            options={[{ label: "Gift", value: "" }]}
            disabled
            className="w-full"
          />
        </div>
      </div> */}
    </>
  );

  const showRetry =
    (!isExternalProductSource && isCategoriesError) ||
    (enableInfiniteScroll ? isInfiniteProductsError : isProductsError) ||
    isInitialSelectionError ||
    externalProductsError;
  const showLoading =
    (isExternalProductSource
      ? externalProductsLoading
      : enableInfiniteScroll
        ? isInfiniteProductsLoading
        : isProductsLoading || isProductsFetching) || isInitialSelectionLoading;

  return (
    <ModalStepLayout
      header={
        <div className="space-y-4 pb-4 sm:space-y-5 sm:pb-5">
          <div>
            <h2 className="mb-2 max-w-[700px] font-body text-[26px] font-semibold leading-tight text-charcoal sm:text-[32px]">
              {title}
            </h2>
            <p className="max-w-[720px] text-[13px] text-charcoal sm:text-[14px]">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
            <SearchInput
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              containerClassName="w-full xl:max-w-[520px]"
              className="h-10 rounded-[5px] border-[#9F9F9F] bg-[#FFFFFF] text-[12px] font-medium placeholder:text-[#716F6F]"
            />
            <div className="flex flex-wrap gap-2.5">
              {isExternalProductSource ? null : (
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-[#E4E9ED] px-3.5 py-2 text-[12px] font-medium text-[#716F6F] transition-colors hover:bg-[#DCE2E7]"
                >
                  <Image
                    src={filterIcon}
                    alt=""
                    aria-hidden
                    className="h-4 w-4"
                  />
                  {activeFilterCount
                    ? `Filter (${activeFilterCount})`
                    : "Filter"}
                </button>
              )}
              {externalSourceAction}
            </div>
          </div>

          {isExternalProductSource ? (
            <div className="flex flex-col gap-1 rounded-[16px] border border-[#E6E0F7] bg-[#FAF8FF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#3300C9]">
                  {externalSourceLabel || "From Caught My Eye"}
                </p>
                <p className="text-[12px] text-[#7D7D7D]">
                  {externalSourceDescription ||
                    "These gifts are pulled from items you saved to Caught My Eye."}
                </p>
              </div>
              <span className="text-[12px] font-medium text-[#716F6F]">
                {products.length} item{products.length === 1 ? "" : "s"}
              </span>
            </div>
          ) : null}

          {showRetry ? (
            <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#F2D8D8] bg-[#FFF8F8] px-4 py-3">
              <p className="text-[12px] text-[#8A5A5A]">
                Unable to load gifts right now.
              </p>
              <button
                type="button"
                onClick={() => {
                  void refetchCategories();
                  if (enableInfiniteScroll) {
                    void refetchInfiniteProducts();
                  } else {
                    void refetchProducts();
                  }
                  onRetryInitialSelection?.();
                  onRetryExternalProducts?.();
                }}
                className="text-[12px] font-semibold text-[#3300C9] transition-colors hover:text-[#2400A1]"
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      }
      footer={
        enableInfiniteScroll && hideFooterActions ? null : (
          <div className="space-y-4 border-t border-[#F1EDF9] pt-5">
            {enableInfiniteScroll || isExternalProductSource ? null : (
              <div className="flex flex-row items-center justify-between gap-4  sm:gap-6">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="rounded-lg border-gray-200 px-4 py-2 text-[13px] text-dark hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="inline-flex items-center gap-2">
                    <BackIcon className="size-4" />
                    <span>Previous</span>
                  </span>
                </Button>

                <div className="flex items-center gap-1.5">
                  {pages.map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`gap-${index}`}
                        className="px-2 text-[13px] text-muted"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-medium transition-colors",
                          safeCurrentPage === page
                            ? "bg-gray-100 text-dark"
                            : "text-muted hover:bg-gray-50",
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-lg border-gray-200 px-4 py-2 text-[13px] text-dark hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </Button>
              </div>
            )}

            {hideFooterActions ? null : (
              <FlowActionButtons
                showBack={Boolean(onBack)}
                onBack={onBack}
                onNext={onNext}
                onSaveAndContinue={onSaveAndContinue}
                nextDisabled={nextDisabled}
                nextLabel={nextLabel}
                saveAndContinueLabel={saveAndContinueLabel}
                isSaveAndContinuePending={isSaveAndContinuePending}
                className="pt-0"
                backClassName="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                nextClassName="!w-fit min-w-[96px] px-6"
              />
            )}
          </div>
        )
      }
      contentClassName={cn(
        "pr-0 sm:pr-1 h-full",
        disableContentScroll && "overflow-y-visible",
      )}
    >
      {isExternalProductSource ? null : (
        <FilterDrawer
          open={isFilterDrawerOpen}
          onOpenChange={setIsFilterDrawerOpen}
          title="Filter gifts"
          description="Choose the options you want, then apply them to refresh the gift list."
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        >
          {drawerFilterControls}
        </FilterDrawer>
      )}

      {showLoading ? (
        <div className="flex min-h-[480px] flex-col rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] p-4 sm:min-h-[540px] sm:p-5">
          <div className="flex-1">
            <GiftGridLoadingSkeleton count={8} />
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] px-6 text-center text-[14px] text-[#7D7D7D]">
          {emptyStateText}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {products.map((product) => (
              <GiftCard
                key={product._id}
                product={product}
                checked={selectedIds.includes(product._id)}
                onToggle={() => toggleGiftSelection(product)}
                onView={
                  onViewProduct ? () => onViewProduct(product) : undefined
                }
                hideSelectionControls={hideSelectionControls}
                isCaughtMyEye={caughtMyEyeProductIdSet.has(product._id)}
              />
            ))}
          </div>

          {enableInfiniteScroll ? (
            <div ref={infiniteScrollSentinelRef} className="min-h-8">
              {isFetchingNextPage ? (
                <GiftGridLoadingSkeleton count={4} />
              ) : hasNextPage ? (
                <div className="py-4 text-center text-[13px] font-medium text-[#7D7D7D]">
                  Scroll to load more gifts
                </div>
              ) : (
                <div className="py-4 text-center text-[13px] font-medium text-[#7D7D7D]">
                  You have reached the end of the gift list.
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </ModalStepLayout>
  );
}
