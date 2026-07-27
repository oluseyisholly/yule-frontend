import type { Metadata } from "next";
import HangoutDetailsScreen from "@/screens/hangouts/HangoutDetailsScreen";

type HangoutDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    productId?: string;
    backHref?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Hangout Details",
  description: "View details for this hangout",
};

export default async function HangoutDetailsPage({
  params,
  searchParams,
}: HangoutDetailsPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <HangoutDetailsScreen
      hangoutId={id}
      marketplaceProductId={resolvedSearchParams?.productId}
      backHref={resolvedSearchParams?.backHref}
    />
  );
}
