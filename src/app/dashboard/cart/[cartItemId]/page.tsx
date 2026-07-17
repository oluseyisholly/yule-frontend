import { Suspense } from "react";
import ContactGiftCartItemDetailsScreen from "@/screens/gifts/ContactGiftCartItemDetailsScreen";

type CartItemPageProps = {
  params: Promise<{
    cartItemId: string;
  }>;
  searchParams?: Promise<{
    productId?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function CartItemPage({
  params,
  searchParams,
}: CartItemPageProps) {
  const { cartItemId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const productId = firstValue(resolvedSearchParams?.productId);

  return (
    <Suspense fallback={null}>
      <ContactGiftCartItemDetailsScreen
        cartItemId={cartItemId}
        productId={productId}
      />
    </Suspense>
  );
}
