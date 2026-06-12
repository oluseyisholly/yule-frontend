"use client";

import DrawNameInviteStep, {
  type DrawNameInviteParticipant,
} from "@/components/DrawNameInviteStep";
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
  onInviteBack: () => void;
  inviteParticipants: DrawNameInviteParticipant[];
  isCopyListOpen: boolean;
  onToggleCopyList: () => void;
  onSendEmail: () => void;
  onCopyLink: (participantId: string) => void;
  isSendingEmail: boolean;
  isLoadingLinks: boolean;
  isLinksError: boolean;
  onRetryLinks: () => void;
  inviteSearchValue: string;
  onInviteSearchValueChange: (value: string) => void;
};

export default function DrawNameExecutionFlowSteps({
  currentStep,
  selectedWishlistGiftIds,
  onSelectedWishlistGiftIdsChange,
  onSelectedProductToggle,
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
  inviteParticipants,
  isCopyListOpen,
  onToggleCopyList,
  onSendEmail,
  onCopyLink,
  isSendingEmail,
  isLoadingLinks,
  isLinksError,
  onRetryLinks,
  inviteSearchValue,
  onInviteSearchValueChange,
}: DrawNameExecutionFlowStepsProps) {
  if (currentStep === "wishlist-gifts") {
    return (
      <WishlistGiftSelectionStep
        selectedIds={selectedWishlistGiftIds}
        onSelectedIdsChange={onSelectedWishlistGiftIdsChange}
        onSelectedProductToggle={onSelectedProductToggle}
        maximumSpend={maximumSpend}
        onBack={onWishlistBack}
        onNext={onWishlistNext}
        isInitialSelectionLoading={isInitialSelectionLoading}
        isInitialSelectionError={isInitialSelectionError}
        onRetryInitialSelection={onRetryInitialSelection}
        nextDisabled={
          isWishlistNextPending || !selectedWishlistGiftIds.length
        }
        nextLabel={isWishlistNextPending ? "Saving..." : "Next"}
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
        participants={inviteParticipants}
        isCopyListOpen={isCopyListOpen}
        onToggleCopyList={onToggleCopyList}
        onSendEmail={onSendEmail}
        onCopyLink={onCopyLink}
        isSendingEmail={isSendingEmail}
        isLoadingLinks={isLoadingLinks}
        isLinksError={isLinksError}
        onRetryLinks={onRetryLinks}
        searchValue={inviteSearchValue}
        onSearchValueChange={onInviteSearchValueChange}
      />
    );
  }

  return null;
}
