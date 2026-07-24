"use client";

import DrawNameInviteStep from "@/components/DrawNameInviteStep";
import DrawNameReadyStep from "@/components/DrawNameReadyStep";
import DrawNameResultStep from "@/components/DrawNameResultStep";
import DrawNameSpinStep from "@/components/DrawNameSpinStep";
import WishlistChoiceStep from "@/components/WishlistChoiceStep";
import WishlistGiftSelectionStep from "@/components/WishlistGiftSelectionStep";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import type { DrawNameModalStep } from "@/screens/draw-names/modal-steps";

type DrawNameExecutionFlowStepsProps = {
  currentStep: DrawNameModalStep;
  selectedWishlistGiftIds: string[];
  onSelectedWishlistGiftIdsChange: (ids: string[]) => void;
  onSelectedProductToggle: (
    product: MarketplaceProduct,
    checked: boolean,
  ) => void;
  onViewWishlistGiftProduct?: (product: MarketplaceProduct) => void;
  maximumSpend?: number;
  onWishlistBack?: () => void;
  onWishlistNext: () => void;
  isInitialSelectionLoading: boolean;
  isInitialSelectionError: boolean;
  onRetryInitialSelection: () => void;
  isWishlistNextPending: boolean;
  wishlistNotificationChoice: "yes" | "no";
  onWishlistNotificationChoiceChange: (value: "yes" | "no") => void;
  onWishlistNotificationYes: () => void;
  onWishlistNotificationNo: () => void;
  onWishlistNotificationBack: () => void;
  isWishlistNotificationPending: boolean;
  caughtMyEyeProductIds?: string[];
  prioritizedWishlistGiftIds?: string[];
  readyEventName: string;
  onReadyBack: () => void;
  onDrawName: () => void;
  isDrawing: boolean;
  participantNames: string[];
  onSpinBack: () => void;
  onSpinNext: (selectedName: string) => void;
  selectedName: string;
  onResultBack: () => void;
  onResultPrimaryAction: () => void;
  resultPrimaryActionLabel: string;
  isResultPrimaryActionPending: boolean;
  onInviteBack?: () => void;
  onSendEmail: () => void;
  onShareFacebook: () => void;
  onShareWhatsApp: () => void;
  onCopyLink: () => void;
  isSendingEmail: boolean;
};

export default function DrawNameExecutionFlowSteps({
  currentStep,
  selectedWishlistGiftIds,
  onSelectedWishlistGiftIdsChange,
  onSelectedProductToggle,
  onViewWishlistGiftProduct,
  maximumSpend,
  onWishlistBack,
  onWishlistNext,
  isInitialSelectionLoading,
  isInitialSelectionError,
  onRetryInitialSelection,
  isWishlistNextPending,
  wishlistNotificationChoice,
  onWishlistNotificationChoiceChange,
  onWishlistNotificationYes,
  onWishlistNotificationNo,
  onWishlistNotificationBack,
  isWishlistNotificationPending,
  caughtMyEyeProductIds = [],
  prioritizedWishlistGiftIds = [],
  readyEventName,
  onReadyBack,
  onDrawName,
  isDrawing,
  participantNames,
  onSpinBack,
  onSpinNext,
  selectedName,
  onResultBack,
  onResultPrimaryAction,
  resultPrimaryActionLabel,
  isResultPrimaryActionPending,
  onInviteBack,
  onSendEmail,
  onShareFacebook,
  onShareWhatsApp,
  onCopyLink,
  isSendingEmail,
}: DrawNameExecutionFlowStepsProps) {
  if (currentStep === "wishlist-gifts") {
    return (
      <WishlistGiftSelectionStep
        selectedIds={selectedWishlistGiftIds}
        onSelectedIdsChange={onSelectedWishlistGiftIdsChange}
        onSelectedProductToggle={onSelectedProductToggle}
        onViewProduct={onViewWishlistGiftProduct}
        maximumSpend={maximumSpend}
        onBack={onWishlistBack}
        onNext={onWishlistNext}
        // disableContentScroll={true}
        isInitialSelectionLoading={isInitialSelectionLoading}
        isInitialSelectionError={isInitialSelectionError}
        onRetryInitialSelection={onRetryInitialSelection}
        nextDisabled={
          isWishlistNextPending || !selectedWishlistGiftIds.length
        }
        nextLabel={isWishlistNextPending ? "Saving..." : "Next"}
        caughtMyEyeProductIds={caughtMyEyeProductIds}
        prioritizedProductIds={prioritizedWishlistGiftIds}
        hidePriceFilters
        deferProductsUntilInitialSelectionResolved
      />
    );
  }

  if (currentStep === "wishlist-notification") {
    return (
      <WishlistChoiceStep
        title="Would you like to receive notification about the wish list of the person whose name you've drawn?"
        value={wishlistNotificationChoice}
        onChange={onWishlistNotificationChoiceChange}
        onYes={onWishlistNotificationYes}
        onNo={onWishlistNotificationNo}
        onBack={onWishlistNotificationBack}
        isPending={isWishlistNotificationPending}
      />
    );
  }

  if (currentStep === "draw-ready") {
    return (
      <DrawNameReadyStep
        eventName={readyEventName}
        onBack={onReadyBack}
        onDrawName={onDrawName}
        isDrawing={isDrawing}
      />
    );
  }

  if (currentStep === "draw-spin") {
    return (
      <DrawNameSpinStep
        names={participantNames}
        onBack={onSpinBack}
        onNext={onSpinNext}
      />
    );
  }

  if (currentStep === "draw-result") {
    return (
      <DrawNameResultStep
        selectedName={selectedName}
        onBack={onResultBack}
        onPrimaryAction={onResultPrimaryAction}
        primaryActionLabel={resultPrimaryActionLabel}
        isPrimaryActionPending={isResultPrimaryActionPending}
      />
    );
  }

  if (currentStep === "draw-invite") {
    return (
      <DrawNameInviteStep
        onBack={onInviteBack}
        onSendEmail={onSendEmail}
        onShareFacebook={onShareFacebook}
        onShareWhatsApp={onShareWhatsApp}
        onCopyLink={onCopyLink}
        isSendingEmail={isSendingEmail}
      />
    );
  }

  return null;
}
