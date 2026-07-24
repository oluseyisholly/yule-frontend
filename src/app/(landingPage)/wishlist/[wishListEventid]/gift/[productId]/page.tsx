import { Suspense } from "react";
import MarketplaceProductDetailsScreen from "@/screens/gifts/MarketplaceProductDetailsScreen";

type PublicWishlistGiftPageProps = {
  params: Promise<{
    wishListEventid: string;
    productId: string;
  }>;
};

export default async function PublicWishlistGiftPage({
  params,
}: PublicWishlistGiftPageProps) {
  const { wishListEventid, productId } = await params;

  return (
    <Suspense fallback={null}>
      <MarketplaceProductDetailsScreen
        productId={productId}
        backHref={`/wishlist/${wishListEventid}`}
      />
    </Suspense>
  );
}
