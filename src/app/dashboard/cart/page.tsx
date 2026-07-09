import { Suspense } from "react";
import ContactGiftCartScreen from "@/screens/gifts/ContactGiftCartScreen";

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <ContactGiftCartScreen />
    </Suspense>
  );
}
