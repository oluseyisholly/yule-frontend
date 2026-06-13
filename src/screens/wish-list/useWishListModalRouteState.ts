"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  isWishListModalStep,
  type WishListModalStep,
} from "@/screens/wish-list/modal-steps";
import {
  isWishListFlowMode,
  type WishListFlowMode,
} from "@/stores/wishlist-flow-store";

const BASE_WISHLIST_PATH = "/dashboard/wish-list";
const FLOW_PATH_PREFIX = `${BASE_WISHLIST_PATH}/flow`;
const EVENT_ID_PARAM = "eventId";
const WISHLIST_EVENT_ID_PARAM = "wishlistEventId";
const MODE_PARAM = "mode";

type ModalNavigationMethod = "push" | "replace";

export function useWishListModalRouteState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedSearchString = useMemo(() => {
    const nextSearch = searchParams.toString();

    if (nextSearch) {
      return nextSearch;
    }

    if (typeof window !== "undefined") {
      return window.location.search.replace(/^\?/, "");
    }

    return "";
  }, [searchParams]);
  const resolvedSearchParams = useMemo(
    () => new URLSearchParams(resolvedSearchString),
    [resolvedSearchString],
  );

  const modalStep = useMemo<WishListModalStep | null>(() => {
    const normalizedPathname = pathname.replace(/\/+$/, "");

    if (!normalizedPathname.startsWith(`${FLOW_PATH_PREFIX}/`)) {
      return null;
    }

    const stepSegment =
      normalizedPathname
        .slice(`${FLOW_PATH_PREFIX}/`.length)
        .split("/")[0]
        ?.trim() ?? null;

    return isWishListModalStep(stepSegment) ? stepSegment : null;
  }, [pathname]);

  const eventId = useMemo(
    () => resolvedSearchParams.get(EVENT_ID_PARAM),
    [resolvedSearchParams],
  );
  const wishlistEventId = useMemo(
    () => resolvedSearchParams.get(WISHLIST_EVENT_ID_PARAM),
    [resolvedSearchParams],
  );
  const mode = useMemo<WishListFlowMode>(() => {
    const nextMode = resolvedSearchParams.get(MODE_PARAM);
    return isWishListFlowMode(nextMode) ? nextMode : "create";
  }, [resolvedSearchParams]);

  const navigateModalStep = useCallback(
    (
      step: WishListModalStep | null,
      nextMode?: WishListFlowMode,
      nextEventId?: string | null,
      nextWishlistEventId?: string | null,
      method: ModalNavigationMethod = "replace",
    ) => {
      const nextParams = new URLSearchParams();
      const resolvedMode = nextMode ?? mode;
      const resolvedEventId =
        nextEventId === undefined ? eventId : nextEventId?.trim() || null;
      const resolvedWishlistEventId =
        nextWishlistEventId === undefined
          ? wishlistEventId
          : nextWishlistEventId?.trim() || null;

      if (step) {
        nextParams.set(MODE_PARAM, resolvedMode);
      }

      if (resolvedEventId) {
        nextParams.set(EVENT_ID_PARAM, resolvedEventId);
      }

      if (resolvedWishlistEventId) {
        nextParams.set(WISHLIST_EVENT_ID_PARAM, resolvedWishlistEventId);
      }

      const nextQuery = nextParams.toString();
      const nextPath = step ? `${FLOW_PATH_PREFIX}/${step}` : BASE_WISHLIST_PATH;
      const nextHref = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
      router[method](nextHref, { scroll: false });
    },
    [eventId, mode, router, wishlistEventId],
  );

  const openModal = useCallback(
    (
      step?: WishListModalStep,
      nextMode: WishListFlowMode = "create",
      nextEventId?: string | null,
      nextWishlistEventId?: string | null,
    ) => {
      const nextStep = isWishListModalStep(step ?? null) ? step ?? "event" : "event";

      navigateModalStep(
        nextStep,
        nextMode,
        nextEventId ?? null,
        nextWishlistEventId ?? null,
        "push",
      );
    },
    [navigateModalStep],
  );

  const setCurrentStep = useCallback(
    (
      step: WishListModalStep,
      nextMode?: WishListFlowMode,
      nextEventId?: string | null,
      nextWishlistEventId?: string | null,
    ) => {
      navigateModalStep(
        step,
        nextMode,
        nextEventId,
        nextWishlistEventId,
        "push",
      );
    },
    [navigateModalStep],
  );

  const replaceCurrentStep = useCallback(
    (
      step: WishListModalStep,
      nextMode?: WishListFlowMode,
      nextEventId?: string | null,
      nextWishlistEventId?: string | null,
    ) => {
      navigateModalStep(
        step,
        nextMode,
        nextEventId,
        nextWishlistEventId,
        "replace",
      );
    },
    [navigateModalStep],
  );

  const closeModal = useCallback(() => {
    router.replace(BASE_WISHLIST_PATH, { scroll: false });
  }, [router]);

  return {
    isOpen: modalStep !== null,
    currentStep: modalStep ?? "event",
    mode,
    eventId,
    wishlistEventId,
    openModal,
    setCurrentStep,
    replaceCurrentStep,
    closeModal,
  };
}
