import { Suspense } from "react";
import MarketplaceProductDetailsScreen from "@/screens/gifts/MarketplaceProductDetailsScreen";

type MarketplaceProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams?: Promise<{
    backHref?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function MarketplaceProductPage({
  params,
  searchParams,
}: MarketplaceProductPageProps) {
  const { productId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <Suspense fallback={null}>
      <MarketplaceProductDetailsScreen
        productId={productId}
        backHref={
          firstValue(resolvedSearchParams?.backHref) ??
          "/dashboard/gifts?tab=events"
        }
      />
    </Suspense>
  );
}
