"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  ChevronDownIcon,
  PencilIcon,
  GiftIcon,
  PackageCheckIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import UserAvatar from "@/components/UserAvatar";
import type { MarketplaceProduct } from "@/features/marketplace/types";

export type GiftSetupReviewRecipient = {
  key: string;
  name: string;
  email: string;
  profileUrl?: string | null;
};

type RecipientGiftSetupReviewProps = {
  recipients: GiftSetupReviewRecipient[];
  products: MarketplaceProduct[];
  quantitiesByProductId: Record<string, Record<string, number>>;
  onCancel: () => void;
  onConfirm: () => void;
  onBack?: () => void;
  onEditProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  cancelLabel?: string;
  confirmLabel?: string;
  useBackButtonForCancel?: boolean;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RecipientGiftSetupReview({
  recipients,
  products,
  quantitiesByProductId,
  onCancel,
  onConfirm,
  onBack,
  onEditProduct,
  onDeleteProduct,
  cancelLabel = "Cancel Order",
  confirmLabel = "Place Order",
  useBackButtonForCancel = false,
}: RecipientGiftSetupReviewProps) {
  const giftReviews = products.map((product) => {
    const assignedParticipants = recipients.flatMap((participant) => {
      const quantity =
        quantitiesByProductId[product._id]?.[participant.key] ?? 1;

      return quantity > 0 ? [{ participant, quantity }] : [];
    });
    const totalUnits = assignedParticipants.reduce(
      (sum, assignment) => sum + assignment.quantity,
      0,
    );

    return {
      product,
      assignedParticipants,
      totalUnits,
      totalValue: product.amount * totalUnits,
    };
  });
  const totalUnits = giftReviews.reduce(
    (sum, review) => sum + review.totalUnits,
    0,
  );
  const grandTotal = giftReviews.reduce(
    (sum, review) => sum + review.totalValue,
    0,
  );

  return (
    <div className="flex min-h-0 flex-col">
      <div className="space-y-2 pb-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3300C9]">
          Final review
        </span>
        <h2 className="text-[26px] font-semibold leading-tight text-[#1E1E1E] sm:text-[32px]">
          Review gifts and assignments
        </h2>
        <p className="max-w-[680px] text-[13px] leading-5 text-[#5F5A6B] sm:text-[14px]">
          Open each gift to review the participants receiving it before placing
          the order.
        </p>
      </div>

      <div className="mr-auto mb-5 grid w-full max-w-[960px] grid-cols-3 gap-2 rounded-[18px] border border-[#EEEAF7] bg-[#FAF8FE] p-2 sm:gap-3 sm:p-3">
        <SummaryItem
          icon={<UsersIcon className="size-4" />}
          value={recipients.length}
          label={recipients.length === 1 ? "Participant" : "Participants"}
        />
        <SummaryItem
          icon={<GiftIcon className="size-4" />}
          value={products.length}
          label={products.length === 1 ? "Gift" : "Gifts"}
        />
        <SummaryItem
          icon={<PackageCheckIcon className="size-4" />}
          value={totalUnits}
          label={totalUnits === 1 ? "Unit" : "Units"}
        />
      </div>

      <div className="mr-auto flex min-h-0 w-full max-w-[960px] flex-1 flex-col gap-3">
        {giftReviews.map(
          (
            {
              product,
              assignedParticipants,
              totalUnits: giftUnits,
              totalValue,
            },
            index,
          ) => (
            <details
              key={product._id}
              open={index === 0 ? true : undefined}
              className="group overflow-hidden rounded-[18px] border border-[#EEEAF7] bg-white shadow-[0_6px_22px_rgba(39,25,83,0.045)] open:border-[#DDD3F5]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-[#FCFBFF] px-4 py-3.5 outline-none transition-colors hover:bg-[#F9F7FD] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3300C9]/30 sm:px-5 [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-[12px] bg-[#F6F2FB]">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[#1E1E1E]">
                        <GiftIcon className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#29252F] sm:text-[15px]">
                      {product.title}
                    </p>
                    <p className="truncate text-[11px] text-[#827B91] sm:text-[12px]">
                      {formatCurrency(product.amount)} each ·{" "}
                      {assignedParticipants.length} participant
                      {assignedParticipants.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {(onEditProduct || (onDeleteProduct && products.length > 1)) ? (
                    <div
                      className="flex items-center gap-1.5"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {onEditProduct ? (
                        <button
                          type="button"
                          aria-label={`Edit ${product.title}`}
                          onClick={() => onEditProduct(product._id)}
                          className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[#3300C9] shadow-[0_4px_12px_rgba(51,0,201,0.12)] transition-colors hover:bg-[#F6F2FF]"
                        >
                          <PencilIcon className="size-3" />
                        </button>
                      ) : null}
                      {onDeleteProduct && products.length > 1 ? (
                        <button
                          type="button"
                          aria-label={`Delete ${product.title}`}
                          onClick={() => onDeleteProduct(product._id)}
                          className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[#D94C4C] shadow-[0_4px_12px_rgba(217,76,76,0.14)] transition-colors hover:bg-[#FFF3F3]"
                        >
                          <Trash2Icon className="size-3" />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <p className="text-[12px] font-semibold text-[#3300C9]">
                        {giftUnits} {giftUnits === 1 ? "unit" : "units"}
                      </p>
                      <p className="text-[10px] text-[#8A8398]">
                        {formatCurrency(totalValue)} total
                      </p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full border border-[#E6E0F1] bg-white text-[#1E1E1E] transition-transform duration-200 group-open:rotate-180">
                      <ChevronDownIcon className="size-4" />
                    </span>
                  </div>
                </div>
              </summary>

              <div className="grid grid-cols-1 gap-2.5 border-t border-[#F1EDF8] p-3 sm:p-4 md:grid-cols-2">
                {assignedParticipants.length ? (
                  assignedParticipants.map(({ participant, quantity }) => (
                    <div
                      key={`${product._id}-${participant.key}`}
                      className="flex items-center gap-3 rounded-[15px] border border-[#F1EDF8] bg-white p-2.5"
                    >
                      <UserAvatar
                        name={participant.name}
                        imageUrl={participant.profileUrl}
                        className="size-11 shrink-0 text-[12px]"
                        textClassName="text-[12px]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[13px] font-semibold text-[#3D3944] sm:text-[14px]">
                          {participant.name}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-[#7B7488]">
                          {participant.email || "Participant"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="inline-flex rounded-full bg-[#F1ECFF] px-2.5 py-1 text-[10px] font-semibold text-[#3300C9]">
                          Qty {quantity}
                        </span>
                        <p className="mt-1 text-[11px] font-semibold text-[#4B4653]">
                          {formatCurrency(product.amount * quantity)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[92px] items-center justify-center rounded-[15px] border border-dashed border-[#DED7EC] bg-[#FBFAFD] px-4 text-center text-[12px] text-[#81798F] md:col-span-2">
                    No participants are assigned to this gift.
                  </div>
                )}
              </div>
            </details>
          ),
        )}
      </div>

      <div className="mt-5 border-t border-[#F1EDF9] pt-5">
        <div className="mr-auto w-full max-w-[960px] rounded-[18px] border border-[#EAE4F4] bg-[#FAF8FE] p-4 sm:p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 text-[12px] text-[#746D80] sm:text-[13px]">
              <span>Total gift units</span>
              <span className="font-semibold text-[#29252F]">{totalUnits}</span>
            </div>
            <div className="border-t border-[#E7E0F1] pt-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#7B7488]">
                    Grand total
                  </p>
                  <p className="mt-1 text-[10px] text-[#918A9D]">
                    Across {recipients.length} participant
                    {recipients.length === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="text-[20px] font-semibold leading-none text-[#1E1E1E] sm:text-[22px]">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mr-auto mt-4 flex w-full max-w-[960px] items-center justify-end gap-3">
          {onBack ? (
            <BackButton
              onClick={onBack}
              className="flex h-[40px] min-w-[82px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
              iconClassName="size-[24px]"
            />
          ) : null}
          {useBackButtonForCancel ? (
            <BackButton
              onClick={onCancel}
              className="flex h-[40px] min-w-[82px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
              iconClassName="size-[24px]"
            />
          ) : (
            <ModalButton
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="h-[40px] !w-fit min-w-[108px] rounded-[14px] border border-[#3300C9] bg-white px-5 text-[13px] font-semibold text-[#3300C9] hover:bg-[#F6F2FF]"
            >
              {cancelLabel}
            </ModalButton>
          )}
          <ModalButton
            type="button"
            onClick={onConfirm}
            className="h-[40px] !w-fit min-w-[132px] rounded-[14px] px-5 text-[13px]"
          >
            {confirmLabel}
          </ModalButton>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[13px] bg-white px-2.5 py-2 sm:px-3">
      <span className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-[#F0EBFF] text-[#1E1E1E] min-[420px]:flex">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold leading-none text-[#29252F] sm:text-[16px]">
          {value}
        </p>
        <p className="mt-1 truncate text-[9px] text-[#81798F] sm:text-[10px]">
          {label}
        </p>
      </div>
    </div>
  );
}
