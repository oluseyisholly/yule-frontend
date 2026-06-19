"use client";

import Image from "next/image";
import {
  type ChangeEvent,
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
import ModalButton from "@/components/ModalButtons";
import filterIcon from "@/assets/icons/filter.svg";
import verifiedIcon from "@/assets/icons/verified.svg";
import locationIcon from "@/assets/icons/location.svg";
import dropdownIcon from "@/assets/icons/dropdowns.svg";
import { cn } from "@/lib/utils";
import { useMarketplaceCategoriesQuery } from "@/features/marketplace/hooks/useMarketplaceCategoriesQuery";
import { useMarketplaceProductsQuery } from "@/features/marketplace/hooks/useMarketplaceProductsQuery";
import type {
  MarketplaceCategory,
  MarketplaceCondition,
  MarketplaceProduct,
} from "@/features/marketplace/types";

type WishlistGiftSelectionStepProps = {
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onSelectedProductToggle: (
    product: MarketplaceProduct,
    checked: boolean,
  ) => void;
  maximumSpend?: number;
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  isInitialSelectionLoading?: boolean;
  isInitialSelectionError?: boolean;
  onRetryInitialSelection?: () => void;
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
          {loading ? <Skeleton className="h-4 w-20 rounded-full" /> : displayLabel}
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
}: {
  product: MarketplaceProduct;
  checked: boolean;
  onToggle: () => void;
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

        <span className="inline-flex w-fit max-w-full items-center truncate rounded-[10px] border border-[#FF6600] bg-[#FF66001A] px-1.5 py-0.5 text-[8px] font-medium text-[#FF6600] sm:px-2 sm:text-[9px] lg:text-[10px]">
          {formatConditionLabel(product.condition)}
        </span>

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
          <Checkbox
            checked={checked}
            onCheckedChange={onToggle}
            aria-label={`Select ${product.title}`}
            className="size-4.5 shrink-0 rounded-[4px] border-[#3300C9] data-[state=checked]:border-[#3300C9] data-[state=checked]:bg-[#3300C9] data-[state=checked]:text-white sm:size-5 sm:rounded-[5px]"
          />
        </div>
      </div>
    </div>
  );
}

export default function WishlistGiftSelectionStep({
  selectedIds,
  onSelectedIdsChange,
  onSelectedProductToggle,
  maximumSpend,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Next",
  isInitialSelectionLoading = false,
  isInitialSelectionError = false,
  onRetryInitialSelection,
}: WishlistGiftSelectionStepProps) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const onSelectedProductToggleRef = useRef(onSelectedProductToggle);

  useEffect(() => {
    onSelectedProductToggleRef.current = onSelectedProductToggle;
  }, [onSelectedProductToggle]);

  const deferredQuery = useDeferredValue(query);
  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useMarketplaceCategoriesQuery();

  const categories = categoriesResponse?.data ?? [];
  const categoryOptions = useMemo(
    () => getCategoryOptions(categories),
    [categories],
  );
  const subCategoryOptions = useMemo(
    () => getSubCategoryOptions(categories, selectedCategorySlug),
    [categories, selectedCategorySlug],
  );
  const resolvedMinimumPrice = useMemo(
    () => parsePriceFilterValue(minimumPrice),
    [minimumPrice],
  );
  const resolvedMaximumPrice = useMemo(
    () => parsePriceFilterValue(maximumPrice),
    [maximumPrice],
  );

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useMarketplaceProductsQuery({
    limit: PAGE_SIZE,
    page: currentPage,
    search: deferredQuery.trim() || undefined,
    categorySlug: selectedCategorySlug || undefined,
    subCategorySlug: selectedSubCategorySlug || undefined,
    minPrice: resolvedMinimumPrice,
    maxPrice: resolvedMaximumPrice,
    condition: (selectedCondition || undefined) as
      | MarketplaceCondition
      | undefined,
    status: "active",
  });

  const products = productsResponse?.data ?? [];
  const totalPages = Math.max(productsResponse?.totalPages ?? 1, 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pages = buildPages(safeCurrentPage, totalPages);

  useEffect(() => {
    if (!products.length || !selectedIds.length) {
      return;
    }

    products.forEach((product) => {
      if (selectedIds.includes(product._id)) {
        onSelectedProductToggleRef.current(product, true);
      }
    });
  }, [products, selectedIds]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
        : [...selectedIds, giftId],
    );
    onSelectedProductToggle(product, nextChecked);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategorySlug(value);
    setSelectedSubCategorySlug("");
    setCurrentPage(1);
  };

  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategorySlug(value);
    setCurrentPage(1);
  };

  const handleConditionChange = (value: string) => {
    setSelectedCondition(value);
    setCurrentPage(1);
  };

  const handleMinimumPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMinimumPrice(event.target.value.replace(/[^\d.]/g, ""));
    setCurrentPage(1);
  };

  const handleMaximumPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMaximumPrice(event.target.value.replace(/[^\d.]/g, ""));
    setCurrentPage(1);
  };

  const showRetry =
    isCategoriesError || isProductsError || isInitialSelectionError;
  const showLoading =
    isProductsLoading || isProductsFetching || isInitialSelectionLoading;

  return (
    <ModalStepLayout
      header={
        <div className="space-y-4 pb-4 sm:space-y-5 sm:pb-5">
          <div>
            <h2 className="mb-2 max-w-[700px] font-body text-[26px] font-semibold leading-tight text-charcoal sm:text-[32px]">
              Gifts speak louder than words.
            </h2>
            <p className="max-w-[720px] text-[13px] text-charcoal sm:text-[14px]">
              While you&apos;re typing that heartfelt message, let us help you
              find the perfect surprise to brighten their day.
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                disabled
                className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-gray-200 bg-[#F1F3F5] px-3.5 py-2 text-[12px] font-medium text-[#B0B4BA]"
              >
                <Image
                  src={filterIcon}
                  alt=""
                  aria-hidden
                  className="h-4 w-4 opacity-45"
                />
                Filter
              </button>

              <WishlistFilterDropdown
                label="Category"
                value={selectedCategorySlug}
                options={categoryOptions}
                onChange={handleCategoryChange}
                loading={isCategoriesLoading}
                className="w-full sm:w-auto"
              />

              <WishlistFilterDropdown
                label="Subcategory"
                value={selectedSubCategorySlug}
                options={subCategoryOptions}
                onChange={handleSubCategoryChange}
                disabled={!selectedCategorySlug || isCategoriesLoading}
                className="w-full sm:w-auto"
              />

              <WishlistFilterDropdown
                label="Condition"
                value={selectedCondition}
                options={CONDITION_OPTIONS}
                onChange={handleConditionChange}
                className="w-full sm:w-auto"
              />

              <WishlistFilterDropdown
                label="Sex"
                value=""
                options={[{ label: "Sex", value: "" }]}
                disabled
                className="w-full sm:w-auto"
              />

              <WishlistFilterDropdown
                label="Gift"
                value=""
                options={[{ label: "Gift", value: "" }]}
                disabled
                className="w-full sm:w-auto"
              />

              <div className="relative min-w-0 w-full sm:w-[140px]">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#716F6F]">
                  ₦
                </span>
                <Input
                  value={minimumPrice}
                  onChange={handleMinimumPriceChange}
                  inputMode="numeric"
                  placeholder="Min price"
                  className="h-10 rounded-lg border-gray-200 bg-[#FFFFFF] pl-7 text-[12px] font-medium text-[#434343] placeholder:text-[#716F6F]"
                />
              </div>

              <div className="relative min-w-0 w-full sm:w-[140px]">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#716F6F]">
                  ₦
                </span>
                <Input
                  value={maximumPrice}
                  onChange={handleMaximumPriceChange}
                  inputMode="numeric"
                  placeholder="Max price"
                  className="h-10 rounded-lg border-gray-200 bg-[#FFFFFF] pl-7 text-[12px] font-medium text-[#434343] placeholder:text-[#716F6F]"
                />
              </div>
            </div>

            <SearchInput
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search for Gift"
              containerClassName="w-full xl:max-w-[520px]"
              className="h-10 rounded-[5px] border-[#9F9F9F] bg-[#FFFFFF] text-[12px] font-medium placeholder:text-[#716F6F]"
            />
          </div>

          {showRetry ? (
            <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#F2D8D8] bg-[#FFF8F8] px-4 py-3">
              <p className="text-[12px] text-[#8A5A5A]">
                Unable to load wishlist items right now.
              </p>
              <button
                type="button"
                onClick={() => {
                  void refetchCategories();
                  void refetchProducts();
                  onRetryInitialSelection?.();
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
        <div className="space-y-4 border-t border-[#F1EDF9] pt-5">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
            <Button
              type="button"
              variant="outlined"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-lg border-gray-200 px-4 py-2 text-[13px] text-dark hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
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

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onBack ? (
              <ModalButton
                type="button"
                variant="secondary"
                onClick={onBack}
                className="max-w-[126px] !h-[38px] rounded-[16px]"
              >
                Back
              </ModalButton>
            ) : null}

            <ModalButton
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className={cn(
                "!h-[38px] rounded-[16px]",
                onBack ? "max-w-[372px]" : "w-full max-w-[420px]",
              )}
            >
              {nextLabel}
            </ModalButton>
          </div>
        </div>
      }
      contentClassName="pr-0 sm:pr-1"
    >
      {showLoading ? (
        <div className="rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] p-4 sm:p-5">
          <GiftGridLoadingSkeleton count={8} />
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] px-6 text-center text-[14px] text-[#7D7D7D]">
          No gifts matched your current filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {products.map((product) => (
            <GiftCard
              key={product._id}
              product={product}
              checked={selectedIds.includes(product._id)}
              onToggle={() => toggleGiftSelection(product)}
            />
          ))}
        </div>
      )}
    </ModalStepLayout>
  );
}
