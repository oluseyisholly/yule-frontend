import type { Metadata } from "next";
import WishListDetailsScreen from "@/screens/wish-list/WishListDetailsScreen";

type WishListDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Wish List Details",
    description: "View details for this wish list event",
  };
}

export default async function WishListDetailsPage({
  params,
}: WishListDetailsPageProps) {
  const { id } = await params;

  return <WishListDetailsScreen wishlistEventId={id} />;
}
