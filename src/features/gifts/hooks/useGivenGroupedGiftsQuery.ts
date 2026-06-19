"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getGivenGroupedGifts } from "@/features/gifts/service";
import type {
  GivenGroupedGift,
  GivenGroupedGiftPerson,
  GivenGroupedGiftsParams,
  GivenGroupedGiftsResponse,
} from "@/features/gifts/types";

type UseGivenGroupedGiftsQueryOptions = {
  enabled?: boolean;
};

export function useGivenGroupedGiftsQuery(
  params: GivenGroupedGiftsParams = {},
  options: UseGivenGroupedGiftsQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 25,
    searchQuery: params.searchQuery ?? "",
  };

  // Sample response provided by the user.
  const sampleGroupedResponse = {
    code: 200,
    message: "Grouped given gifts fetched successfully",
    data: {
      data: [
        {
          participantGiftId: "product-123",
          title: "Wireless Headphones",
          description: "Noise cancelling",
          amount: 45000,
          currency: "NGN",
          imageUrl: null,
          categorySlug: "electronics",
          subCategorySlug: "audio",
          condition: "new",
          locationState: "Lagos",
          locationCity: "Ikeja",
          sellerId: "seller-123",
          productSlug: "wireless-headphones",
          recipientCount: 2,
          people: [
            {
              firstName: "Rita",
              lastName: "Bello",
              email: "rita@example.com",
            },
          ],
          event: {
            id: "event-id",
            title: "Christmas Gifting",
            description: "Office gifting",
            eventTypeId: "event-type-id",
            eventDate: "2026-12-20T10:00:00.000Z",
            status: "ongoing",
          },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 5,
      totalPages: 1,
    },
  };

  const placeholderData: GivenGroupedGiftsResponse = {
    code: 200,
    message: sampleGroupedResponse.message,
    data: {
      data: sampleGroupedResponse.data.data,
      total: sampleGroupedResponse.data.total,
      page: sampleGroupedResponse.data.page,
      pageSize: sampleGroupedResponse.data.pageSize,
      totalPages: sampleGroupedResponse.data.totalPages,
    },
  };

  return useQuery({
    queryKey: giftQueryKeys.givenGrouped(normalizedParams),
    queryFn: () => getGivenGroupedGifts(normalizedParams),
    select: (response) => {
      const items = response?.data?.data ?? [];

      if (!Array.isArray(items) || !items.length) {
        return response as GivenGroupedGiftsResponse;
      }

      const first = items[0];

      if (
        first &&
        typeof first === "object" &&
        "gifts" in (first as Record<string, unknown>)
      ) {
        const flattened: GivenGroupedGift[] = [];

        (items as Array<Record<string, unknown>>).forEach((group) => {
          const event = (group.event as Record<string, unknown>) ?? null;
          const groupGifts =
            (group.gifts as Array<Record<string, unknown>> | undefined) ?? [];

          groupGifts.forEach((gift) => {
            flattened.push({
              participantGiftId: (gift.participantGiftId as string) ?? null,
              title: (gift.title as string) ?? null,
              description: (gift.description as string) ?? null,
              amount: (gift.amount as number | string | null) ?? null,
              currency: (gift.currency as string) ?? null,
              imageUrl: (gift.imageUrl as string) ?? null,
              categorySlug: (gift.categorySlug as string) ?? null,
              subCategorySlug: (gift.subCategorySlug as string) ?? null,
              condition: (gift.condition as string) ?? null,
              locationState: (gift.locationState as string) ?? null,
              locationCity: (gift.locationCity as string) ?? null,
              sellerId: (gift.sellerId as string) ?? null,
              productSlug: (gift.productSlug as string) ?? null,
              recipientCount: (gift.recipientCount as number) ?? null,
              people: (gift.people as GivenGroupedGiftPerson[]) ?? null,
              event: event
                ? {
                    id: (event.id as string) ?? null,
                    title: (event.title as string) ?? null,
                    description: (event.description as string) ?? null,
                    eventTypeId: (event.eventTypeId as string) ?? null,
                    eventDate: (event.eventDate as string) ?? null,
                    status: (event.status as string) ?? null,
                  }
                : null,
            });
          });
        });

        return {
          ...response,
          data: {
            ...(response.data ?? {}),
            data: flattened,
          },
        } as GivenGroupedGiftsResponse;
      }

      return response as GivenGroupedGiftsResponse;
    },
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: placeholderData,
  });
}
