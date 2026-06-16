"use client";

import Image from "next/image";
import { Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import Button from "@/components/Button";
import DetailHeader from "@/components/DetailHeader";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import locationIcon from "@/assets/icons/location.svg";
import verifiedIcon from "@/assets/icons/verified.svg";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { cn } from "@/lib/utils";

type EventGiftDetailStatus = "Completed" | "Draft" | "Ongoing" | "In Progress";

type EventGiftDetailSummaryItem = {
  label: string;
  value: string;
};

type EventGiftDetailViewProps = {
  backHref: string;
  backLabel: string;
  eventTitle: string;
  createdBy: string;
  createdAt: string;
  status: EventGiftDetailStatus;
  avatarInitials: string;
  summaryItems: EventGiftDetailSummaryItem[];
  product: MarketplaceProduct;
  onDelete: () => void;
  onMessageVendor: () => void;
  onReportItem: () => void;
  onShareProduct: () => void;
};

function SummaryStat({ label, value }: EventGiftDetailSummaryItem) {
  return (
    <div className="rounded-[12px] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:px-5">
      <p className="text-[14px] font-medium text-[#434343]">{label}</p>
      <p className="mt-4 text-[16px] font-semibold text-[#1E1E1E] sm:mt-5">
        {value}
      </p>
    </div>
  );
}

function formatConditionLabel(condition?: string | null) {
  if (!condition?.trim()) {
    return "Available";
  }

  return condition
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatMarketplaceProductLocation(product?: MarketplaceProduct | null) {
  const city = product?.location?.city?.trim();
  const state = product?.location?.state?.trim();

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || "Location unavailable";
}

function formatCompactPrice(amount?: string | number | null) {
  const numericValue =
    typeof amount === "number" ? amount : Number(amount?.toString() ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function ShareSquareIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15.75 15.75H20.25V3.75H8.25V8.25"
        stroke="#5F6C72"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 8.25H3.75V20.25H15.75V8.25Z"
        stroke="#5F6C72"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareFacebookIcon() {
  return (
    <svg
      width="6"
      height="13"
      viewBox="0 0 6 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.91912 12.4915V6.31096H5.66259L5.8937 4.13569H3.91912L3.92205 3.04686C3.92205 2.4795 3.97598 2.17564 4.79141 2.17564H5.88147V0H4.13761C2.04292 0 1.30576 1.05519 1.30576 2.82995V4.13586H0V6.31133H1.30576V12.4039C1.81445 12.5052 2.34036 12.5587 2.87882 12.5587C3.22668 12.5587 3.57416 12.5363 3.91912 12.4915Z"
        fill="white"
      />
    </svg>
  );
}

function ShareTwitterIcon() {
  return (
    <svg
      width="16"
      height="14"
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.03184 13.0112C11.0699 13.0112 14.3718 8.00592 14.3718 3.66552C14.3718 3.52337 14.3689 3.38187 14.3625 3.24096C15.005 2.77578 15.5595 2.19982 16 1.54007C15.4118 1.80173 14.7789 1.97783 14.1149 2.05723C14.7926 1.6506 15.3129 1.00729 15.5584 0.24048C14.914 0.622975 14.2091 0.892613 13.4739 1.03777C12.8749 0.399314 12.0221 0 11.0778 0C9.26494 0 7.79489 1.47098 7.79489 3.28419C7.79489 3.54197 7.82374 3.79264 7.88006 4.03315C5.15177 3.89578 2.73252 2.58874 1.11343 0.601313C0.821818 1.10258 0.668434 1.67228 0.668943 2.25224C0.668943 3.39183 1.24846 4.39782 2.12976 4.98638C1.60846 4.97045 1.0986 4.82956 0.643057 4.57555C0.642569 4.58934 0.642569 4.60278 0.642569 4.61751C0.642569 6.20823 1.77408 7.53638 3.27613 7.83733C2.99402 7.9142 2.70292 7.95307 2.41054 7.9529C2.19938 7.9529 1.99359 7.93212 1.79359 7.8937C2.21151 9.19879 3.42335 10.1485 4.86013 10.1751C3.73659 11.0562 2.32127 11.581 0.783024 11.581C0.521349 11.5813 0.259888 11.5661 0 11.5355C1.45281 12.4673 3.17789 13.011 5.032 13.011"
        fill="#5F6C72"
      />
    </svg>
  );
}

function SharePinterestIcon() {
  return (
    <svg
      width="13"
      height="16"
      viewBox="0 0 13 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.42347 0.0535087C2.76461 0.350326 0.115129 2.50147 0.00577548 5.57431C-0.0629612 7.4505 0.469747 8.85804 2.25534 9.25327C3.03019 7.88635 2.00539 7.58485 1.84604 6.59598C1.19148 2.54365 6.52013 -0.219876 9.30865 2.60926C11.238 4.56825 9.9679 10.5952 6.85601 9.96876C3.87533 9.37044 8.3151 4.57294 5.93587 3.63093C4.00187 2.86546 2.97395 5.97266 3.89096 7.51611C3.35356 10.1703 2.19597 12.6714 2.66463 16.0004C4.18465 14.8975 4.69705 12.7854 5.11728 10.5827C5.8812 11.0467 6.28893 11.5294 7.26374 11.6044C10.8584 11.8824 12.8658 8.01602 12.3752 4.44952C11.9394 1.28764 8.78376 -0.321418 5.42347 0.0535087Z"
        fill="#5F6C72"
      />
    </svg>
  );
}

export default function EventGiftDetailView({
  backHref,
  backLabel,
  eventTitle,
  createdBy,
  createdAt,
  status,
  avatarInitials,
  summaryItems,
  product,
  onDelete,
  onMessageVendor,
  onReportItem,
  onShareProduct,
}: EventGiftDetailViewProps) {
  const [selectedGiftImageIndex, setSelectedGiftImageIndex] = useState(0);

  const selectedGiftImages = useMemo(
    () => product.images?.filter((image) => Boolean(image?.trim())) ?? [],
    [product.images],
  );

  const activeSelectedGiftImage =
    selectedGiftImages[selectedGiftImageIndex] || selectedGiftImages[0] || "";

  useEffect(() => {
    setSelectedGiftImageIndex(0);
  }, [product._id]);

  return (
    <div className="space-y-5">
      <BackLink href={backHref} label={backLabel} />

      <section className="rounded-[20px] bg-[#F6F7FB] sm:rounded-[24px]">
        <div className="flex flex-col gap-5">
          <DetailHeader
            title={eventTitle}
            subtitle={`Created by ${createdBy}`}
            meta={
              <>
                <span className="inline-flex items-center gap-2 text-xs text-[#7D7D7D]">
                  <CustomCalendarIcon className="size-4" />
                  {createdAt}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                    status === "Completed" && "bg-[#E6F7EC] text-[#1FAB54]",
                    status === "Draft" && "bg-[#FFF1DD] text-[#C28A00]",
                    status === "Ongoing" && "bg-[#EFE6FD] text-[#3300C9]",
                    status === "In Progress" && "bg-[#EFE6FD] text-[#3300C9]",
                  )}
                >
                  {status}
                </span>
              </>
            }
            avatar={{
              initials: avatarInitials,
              color: "#3300C9",
              bg: "#EFE6FD",
            }}
            actions={
              <Button
                type="button"
                variant="outlined"
                className="border-[#F6C8C8] bg-white px-5 text-[#E04F4F] hover:bg-[#FFF5F5] hover:text-[#E04F4F]"
                onClick={onDelete}
              >
                <Trash2Icon className="size-4" />
                Delete
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) => (
              <SummaryStat key={item.label} label={item.label} value={item.value} />
            ))}
          </div>

          <div className="p-4 sm:p-5">
            <div className="mt-5 grid gap-6 lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.95fr)]">
              <div className="rounded-[16px] bg-white p-4 sm:p-6 lg:p-10">
                <div className="relative flex h-[240px] items-center justify-center overflow-hidden rounded-[16px] bg-[#F6F7FB] sm:h-[320px]">
                  {activeSelectedGiftImage ? (
                    <img
                      src={activeSelectedGiftImage}
                      alt={product.title || "Selected gift"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-[#8A8892]">
                      No image available
                    </div>
                  )}
                </div>

                {selectedGiftImages.length > 0 ? (
                  <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {selectedGiftImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedGiftImageIndex(index)}
                        className={cn(
                          "relative h-[72px] overflow-hidden rounded-[10px] bg-[#F6F7FB] transition-colors",
                          index === selectedGiftImageIndex
                            ? "border-[#3300C9]"
                            : "border-[#EEEAF7]",
                        )}
                      >
                        <img
                          src={image}
                          alt={`${product.title || "Selected gift"} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[15px] font-semibold text-[#4E4C4D]">
                        {product.title?.trim() || "Selected gift"}
                      </h2>
                      <Image
                        src={verifiedIcon}
                        alt="Product badge"
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[#97989A]">
                      <Image
                        src={locationIcon}
                        alt="Location"
                        className="h-[10px] w-[8px]"
                      />
                      <span>{formatMarketplaceProductLocation(product)}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-[10px] border border-[#FF6600] bg-[#FF66001A] px-2.5 py-1 text-[10px] font-medium text-[#FF6600]">
                    {formatConditionLabel(product.condition)}
                  </span>
                </div>

                <p className="text-[24px] font-semibold leading-none tracking-[0.03em] text-[#434343] sm:text-[28px]">
                  ₦{formatCompactPrice(product.amount)}
                </p>

                <div>
                  <h3 className="text-sm font-semibold text-[#434343]">
                    Description
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#6F6C75]">
                    {product.description?.trim() ||
                      "No description available for this product yet."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    type="button"
                    className="w-full rounded-[15px] px-6 py-3 text-xs font-medium sm:w-auto"
                    onClick={onMessageVendor}
                  >
                    Message Vendor
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    className="w-full rounded-[15px] border-[#F6C8C8] bg-white px-6 py-3 text-xs font-medium text-[#E04F4F] hover:bg-[#FFF5F5] hover:text-[#E04F4F] sm:w-auto"
                    onClick={onReportItem}
                  >
                    Report Item
                  </Button>
                </div>

                <div className="pt-1">
                  <p className="text-sm font-medium text-[#6F6C75]">
                    Share product:
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onShareProduct}
                      className="inline-flex size-8 items-center justify-center rounded-full bg-[#F6F7FB] transition-colors hover:bg-[#EEEAF7]"
                      aria-label="Share product via square icon"
                    >
                      <ShareSquareIcon />
                    </button>
                    <button
                      type="button"
                      onClick={onShareProduct}
                      className="inline-flex size-8 items-center justify-center rounded-full bg-[#1877F2] transition-colors hover:bg-[#166FE5]"
                      aria-label="Share product on Facebook"
                    >
                      <ShareFacebookIcon />
                    </button>
                    <button
                      type="button"
                      onClick={onShareProduct}
                      className="inline-flex size-8 items-center justify-center rounded-full bg-[#F6F7FB] transition-colors hover:bg-[#EEEAF7]"
                      aria-label="Share product on X"
                    >
                      <ShareTwitterIcon />
                    </button>
                    <button
                      type="button"
                      onClick={onShareProduct}
                      className="inline-flex size-8 items-center justify-center rounded-full bg-[#F6F7FB] transition-colors hover:bg-[#EEEAF7]"
                      aria-label="Share product on Pinterest"
                    >
                      <SharePinterestIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
