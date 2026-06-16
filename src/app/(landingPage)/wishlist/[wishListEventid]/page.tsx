import type { Metadata } from "next";
import {
  getPublicWishlistClaimedGiftIds,
  getPublicWishlistEvent,
  getPublicWishlistEventGifts,
} from "@/features/wishlist-events/public-service";
import WishListPublicScreen from "@/screens/WishListPublicScreen";

type WishListPublicPageProps = {
  params: Promise<{
    wishListEventid: string;
  }>;
};

export async function generateMetadata({
  params,
}: WishListPublicPageProps): Promise<Metadata> {
  const { wishListEventid } = await params;
  const publicWishlistEvent = await getPublicWishlistEvent(wishListEventid).catch(
    () => null,
  );
  const title = publicWishlistEvent?.data?.title?.trim();
  const description = publicWishlistEvent?.data?.description?.trim();

  return {
    title: title || `Wishlist ${wishListEventid}`,
    description: description || "View a shared wishlist invitation",
  };
}

export default async function WishListPublicPage({
  params,
}: WishListPublicPageProps) {
  const { wishListEventid } = await params;
  const [publicWishlistEvent, publicWishlistGifts, publicWishlistClaimedGiftIds] =
    await Promise.all([
    getPublicWishlistEvent(wishListEventid).catch(() => null),
    getPublicWishlistEventGifts(wishListEventid, {
      page: 1,
      per_page: 24,
    }).catch(() => null),
    getPublicWishlistClaimedGiftIds(wishListEventid).catch(() => null),
  ]);

  return (
    <WishListPublicScreen
      wishListEventId={wishListEventid}
      wishlistEvent={publicWishlistEvent?.data ?? null}
      wishlistGifts={publicWishlistGifts?.data.data ?? []}
      wishlistGiftTotal={publicWishlistGifts?.data.total ?? 0}
      claimedGiftIds={publicWishlistClaimedGiftIds?.data ?? []}
    />
  );
}
