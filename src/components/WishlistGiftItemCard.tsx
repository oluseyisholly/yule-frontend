"use client";

import Image, { type StaticImageData } from "next/image";
import Button from "@/components/Button";
import { Checkbox } from "@/components/ui/checkbox";
import verifiedIcon from "@/assets/icons/verified.svg";
import locationIcon from "@/assets/icons/location.svg";
import { cn } from "@/lib/utils";

export type WishlistGiftCardItem = {
  id: string;
  productId: string;
  title: string;
  imageUrl?: string;
  fallbackImage: StaticImageData;
  condition: string;
  price: string;
  location: string;
  availability: "Available" | "Claimed";
  note: string;
  isDisabled: boolean;
};

function getAvailabilityStyles(
  availability: WishlistGiftCardItem["availability"],
) {
  if (availability === "Claimed") {
    return "bg-[#FDE9E7] text-[#D94C3F]";
  }

  return "bg-[#E8F8EF] text-[#1E9E5A]";
}

type WishlistGiftItemCardProps = {
  item: WishlistGiftCardItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onView?: () => void;
  viewHref?: string;
};

export default function WishlistGiftItemCard({
  item,
  checked,
  onCheckedChange,
  onView,
  viewHref,
}: WishlistGiftItemCardProps) {
  const isDisabled = item.isDisabled;

  return (
    <article
      className={cn(
        "relative mx-auto flex h-full w-full max-w-[290px] min-w-0 flex-col gap-1.5 overflow-hidden rounded-[16px] border p-2.5 shadow-[0_2px_6px_rgba(33,16,93,0.04)] transition-colors min-[520px]:max-w-none",
        isDisabled
          ? "border-2 border-[#D94C3F] bg-[#FFF5F4] shadow-[0_8px_24px_rgba(217,76,63,0.12)]"
          : "border-[#EEEAF7] bg-white",
      )}
    >
      {isDisabled ? (
        <div className="absolute top-[18px] right-[-38px] z-20 w-[150px] rotate-45 bg-[#D94C3F] py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_rgba(217,76,63,0.25)]">
          Claimed
        </div>
      ) : null}

      <div className="relative h-[136px] shrink-0 overflow-hidden rounded-[12px] bg-[#F7F6FB] sm:h-[148px] lg:h-[160px]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className={cn(
              "h-full w-full object-cover transition-[filter,transform]",
              isDisabled && "scale-[1.01] grayscale-[0.2] brightness-[0.8]",
            )}
          />
        ) : (
          <Image
            src={item.fallbackImage}
            alt={item.title}
            className={cn(
              "h-full w-full object-cover transition-[filter,transform]",
              isDisabled && "scale-[1.01] grayscale-[0.2] brightness-[0.8]",
            )}
          />
        )}

        <span
          className={cn(
            "absolute left-2.5 top-2.5 inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold",
            getAvailabilityStyles(item.availability),
          )}
        >
          {item.availability}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-1">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h3
            className={cn(
              "line-clamp-2 text-[15px] font-semibold leading-tight sm:text-[16px]",
              isDisabled ? "text-[#76707B]" : "text-[#4E4C4D]",
            )}
          >
            {item.title}
          </h3>
          <Image
            src={verifiedIcon}
            alt="Verified"
            className={cn("mt-1 w-[18px] shrink-0", isDisabled && "opacity-70")}
          />
        </div>

        <span
          className={cn(
            "inline-flex w-fit rounded-full px-2 py-0.5 text-[9px] font-medium",
            isDisabled
              ? "border border-[#E4DDE8] bg-[#F4EFF7] text-[#8E8499]"
              : "border border-[#FF6600] bg-[#FF660014] text-[#FF6600]",
          )}
        >
          {item.condition}
        </span>

        <p
          className={cn(
            "line-clamp-2 min-h-[30px] text-[10px] leading-4 sm:min-h-[34px] sm:text-[11px]",
            isDisabled ? "text-[#98919E]" : "text-[#716F6F]",
          )}
        >
          {item.note}
        </p>

        <div
          className={cn(
            "flex items-center gap-1 text-[10px] sm:text-[11px]",
            isDisabled ? "text-[#A79FAE]" : "text-[#97989A]",
          )}
        >
          <Image
            src={locationIcon}
            alt="Location"
            className="h-[9px] w-[7px]"
          />
          <span className="truncate">{item.location}</span>
        </div>

        <div className="pt-0.5">
          <span
            className={cn(
              "block truncate text-[13px] font-semibold leading-tight tracking-[0.03em] sm:text-[14px]",
              isDisabled ? "text-[#76707B]" : "text-[#17191C]",
            )}
          >
            {item.price}
          </span>
        </div>

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pt-0.5">
          <Button
            href={viewHref}
            onClick={onView}
            label="View"
            variant="filled"
            className="h-auto w-full min-w-0 justify-center rounded-[12px] px-3 py-1 text-[9px] font-medium sm:h-8 sm:px-3.5 sm:text-[10px]"
          />

          {isDisabled ? (
            <span className="inline-flex h-8 items-center justify-center rounded-full bg-[#D94C3F] px-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
              Claimed
            </span>
          ) : (
            <Checkbox
              checked={checked}
              onCheckedChange={(nextChecked) =>
                onCheckedChange(Boolean(nextChecked))
              }
              aria-label={`Select ${item.title}`}
              className="size-5 rounded-[5px] border-[#3300C9] data-[state=checked]:border-[#3300C9] data-[state=checked]:bg-[#3300C9] data-[state=checked]:text-white"
            />
          )}
        </div>
      </div>
    </article>
  );
}
