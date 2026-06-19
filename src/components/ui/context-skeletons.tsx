"use client";

import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type TableLoadingStateProps = {
  rows?: number;
  className?: string;
};

type EventDetailScreenSkeletonProps = {
  backHref: string;
  backLabel: string;
  showSidebar?: boolean;
  sidebarRows?: number;
  className?: string;
};

type EventGiftDetailSkeletonProps = {
  backHref: string;
  backLabel: string;
  className?: string;
};

type GiftGridLoadingSkeletonProps = {
  count?: number;
  className?: string;
};

type RecordPickerLoadingSkeletonProps = {
  rows?: number;
  className?: string;
};

type InviteLinksLoadingSkeletonProps = {
  rows?: number;
  className?: string;
};

type ModalPanelSkeletonProps = {
  className?: string;
};

function StatCardSkeleton() {
  return (
    <div className="rounded-[12px] bg-white px-4 py-4 sm:px-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-5 w-20 sm:mt-5" />
    </div>
  );
}

function ParticipantListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="mt-4 space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`participant-skeleton-${index}`}
          className="flex items-center justify-between gap-3 border-b border-[#F1EDF8] py-3 last:border-b-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="size-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function TableLoadingState({
  rows = 5,
  className,
}: TableLoadingStateProps) {
  return (
    <div className={cn("space-y-3 py-2", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`table-loading-row-${index}`}
          className="rounded-[12px] border border-[#F0EEFF] bg-white px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-4 rounded-[4px]" />
            <Skeleton className="h-4 w-[18%] min-w-[90px]" />
            <Skeleton className="hidden h-4 w-[14%] min-w-[70px] sm:block" />
            <Skeleton className="hidden h-4 w-[16%] min-w-[80px] md:block" />
            <Skeleton className="ml-auto h-6 w-20 rounded-full" />
            <Skeleton className="size-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InlinePanelSkeleton({
  rows = 3,
  className,
}: TableLoadingStateProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5",
        className,
      )}
    >
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={`inline-panel-${index}`}
            className="h-4 w-full rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

export function EventDetailScreenSkeleton({
  backHref,
  backLabel,
  showSidebar = true,
  sidebarRows = 6,
  className,
}: EventDetailScreenSkeletonProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <BackLink href={backHref} label={backLabel} />

      <section>
        <div className="flex flex-col gap-5 pb-5 sm:pb-6">
          <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <Skeleton className="size-[72px] rounded-full sm:size-[88px]" />
                <div className="space-y-3 pt-1">
                  <Skeleton className="h-8 w-48 sm:w-56" />
                  <Skeleton className="h-4 w-36 sm:w-44" />
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={`detail-stat-${index}`} />
            ))}
          </div>

          <div
            className={cn(
              "grid gap-5",
              showSidebar &&
                "xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]",
            )}
          >
            <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-5 w-36" />
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <Skeleton className="h-[44px] w-full rounded-[16px] sm:w-[220px]" />
                  <Skeleton className="size-[44px] rounded-[12px]" />
                </div>
              </div>

              <div className="mt-5">
                <TableLoadingState rows={5} />
              </div>
            </div>

            {showSidebar ? (
              <aside className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
                <Skeleton className="h-5 w-32" />
                <ParticipantListSkeleton rows={sidebarRows} />
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export function EventGiftDetailSkeleton({
  backHref,
  backLabel,
  className,
}: EventGiftDetailSkeletonProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <BackLink href={backHref} label={backLabel} />

      <section className="rounded-[20px] bg-[#F6F7FB] sm:rounded-[24px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-[20px] bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <Skeleton className="size-[72px] rounded-full sm:size-[88px]" />
                <div className="space-y-3 pt-1">
                  <Skeleton className="h-8 w-48 sm:w-56" />
                  <Skeleton className="h-4 w-36 sm:w-44" />
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={`gift-detail-stat-${index}`} />
            ))}
          </div>

          <div className="p-4 sm:p-5">
            <div className="mt-5 grid gap-6 lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.95fr)]">
              <div className="rounded-[16px] bg-white p-4 sm:p-6 lg:p-10">
                <Skeleton className="h-[240px] w-full rounded-[16px] sm:h-[320px]" />
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={`gift-thumbnail-${index}`}
                      className="aspect-square w-full rounded-[12px]"
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[16px] bg-white p-4 sm:p-6 lg:p-8">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-28" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[92%]" />
                    <Skeleton className="h-4 w-[84%]" />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-28 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="size-6 rounded-full" />
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

export function GiftGridLoadingSkeleton({
  count = 8,
  className,
}: GiftGridLoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`gift-grid-skeleton-${index}`}
          className="rounded-[18px] border border-[#EEEAF7] bg-white p-3 shadow-[0_2px_6px_rgba(33,16,93,0.04)]"
        >
          <Skeleton className="h-[170px] w-full rounded-[14px]" />
          <div className="mt-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="size-[18px] rounded-full" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[88%]" />
            </div>
            <Skeleton className="h-3 w-24" />
            <div className="flex items-center justify-between gap-3 pt-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-5 rounded-[5px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecordPickerLoadingSkeleton({
  rows = 6,
  className,
}: RecordPickerLoadingSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`record-picker-skeleton-${index}`}
          className="flex items-center gap-4 rounded-[14px] px-2 py-2"
        >
          <Skeleton className="size-5 rounded-[6px]" />
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="size-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function InviteLinksLoadingSkeleton({
  rows = 4,
  className,
}: InviteLinksLoadingSkeletonProps) {
  return (
    <div className={cn("max-h-[200px] space-y-1 overflow-y-auto pr-1", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`invite-link-skeleton-${index}`}
          className="flex items-center justify-between gap-3 border-b border-[#F1EDF8] py-3 last:border-b-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-[28px] w-[28px] rounded-[10px]" />
        </div>
      ))}
    </div>
  );
}

export function ModalPanelSkeleton({ className }: ModalPanelSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] px-6 py-6",
        className,
      )}
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[72%]" />
        <Skeleton className="h-[44px] w-full rounded-[16px]" />
        <Skeleton className="h-[44px] w-32 rounded-full" />
      </div>
    </div>
  );
}

export function InvitationFormSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex w-full max-w-[500px] flex-col", className)}>
      <div className="mb-6 text-center md:mb-8">
        <Skeleton className="mx-auto h-10 w-64" />
        <Skeleton className="mx-auto mt-3 h-4 w-40" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
