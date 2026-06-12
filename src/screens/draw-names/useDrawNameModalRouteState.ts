"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  isDrawNameModalStep,
  type DrawNameModalStep,
} from "@/screens/draw-names/modal-steps";

const BASE_DRAW_NAMES_PATH = "/dashboard/draw-names";
const FLOW_PATH_PREFIX = `${BASE_DRAW_NAMES_PATH}/flow`;
const LEGACY_MODAL_PARAM = "drawNameModal";
const EVENT_ID_PARAM = "eventId";
const DRAW_NAME_EVENT_ID_PARAM = "drawNameEventId";

type ModalNavigationMethod = "push" | "replace";

export function useDrawNameModalRouteState() {
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

  const modalStep = useMemo<DrawNameModalStep | null>(() => {
    const normalizedPathname = pathname.replace(/\/+$/, "");

    if (normalizedPathname.startsWith(`${FLOW_PATH_PREFIX}/`)) {
      const stepSegment =
        normalizedPathname
          .slice(`${FLOW_PATH_PREFIX}/`.length)
          .split("/")[0]
          ?.trim() ?? null;

      return isDrawNameModalStep(stepSegment) ? stepSegment : null;
    }

    const legacyStep = resolvedSearchParams.get(LEGACY_MODAL_PARAM);
    return isDrawNameModalStep(legacyStep) ? legacyStep : null;
  }, [pathname, resolvedSearchParams]);

  const eventId = useMemo(
    () => resolvedSearchParams.get(EVENT_ID_PARAM),
    [resolvedSearchParams],
  );
  const drawNameEventId = useMemo(
    () => resolvedSearchParams.get(DRAW_NAME_EVENT_ID_PARAM),
    [resolvedSearchParams],
  );

  const navigateModalStep = useCallback(
    (
      step: DrawNameModalStep | null,
      nextEventId?: string | null,
      nextDrawNameEventId?: string | null,
      method: ModalNavigationMethod = "replace",
    ) => {
      const nextParams = new URLSearchParams();

      const resolvedEventId =
        nextEventId === undefined ? eventId : nextEventId?.trim() || null;
      const resolvedDrawNameEventId =
        nextDrawNameEventId === undefined
          ? drawNameEventId
          : nextDrawNameEventId?.trim() || null;

      if (resolvedEventId) {
        nextParams.set(EVENT_ID_PARAM, resolvedEventId);
      } else {
        nextParams.delete(EVENT_ID_PARAM);
      }

      if (resolvedDrawNameEventId) {
        nextParams.set(DRAW_NAME_EVENT_ID_PARAM, resolvedDrawNameEventId);
      }

      const nextQuery = nextParams.toString();
      const nextPath = step ? `${FLOW_PATH_PREFIX}/${step}` : BASE_DRAW_NAMES_PATH;
      const nextHref = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
      router[method](nextHref, { scroll: false });
    },
    [drawNameEventId, eventId, router],
  );

  const openModal = useCallback(
    (
      step?: DrawNameModalStep,
      nextEventId?: string | null,
      nextDrawNameEventId?: string | null,
    ) => {
      const nextStep = isDrawNameModalStep(step ?? null) ? step ?? "event" : "event";

      navigateModalStep(
        nextStep,
        nextEventId ?? null,
        nextDrawNameEventId ?? null,
        "push",
      );
    },
    [navigateModalStep],
  );

  const setCurrentStep = useCallback(
    (
      step: DrawNameModalStep,
      nextEventId?: string | null,
      nextDrawNameEventId?: string | null,
    ) => {
      navigateModalStep(step, nextEventId, nextDrawNameEventId, "push");
    },
    [navigateModalStep],
  );

  const replaceCurrentStep = useCallback(
    (
      step: DrawNameModalStep,
      nextEventId?: string | null,
      nextDrawNameEventId?: string | null,
    ) => {
      navigateModalStep(step, nextEventId, nextDrawNameEventId, "replace");
    },
    [navigateModalStep],
  );

  const closeModal = useCallback(() => {
    router.replace(BASE_DRAW_NAMES_PATH, { scroll: false });
  }, [router]);

  const setEventId = useCallback(
    (nextEventId: string | null) => {
      navigateModalStep(modalStep ?? "event", nextEventId);
    },
    [modalStep, navigateModalStep],
  );

  const setDrawNameEventId = useCallback(
    (nextDrawNameEventId: string | null) => {
      navigateModalStep(modalStep ?? "event", undefined, nextDrawNameEventId);
    },
    [modalStep, navigateModalStep],
  );

  return {
    isOpen: modalStep !== null,
    currentStep: modalStep ?? "event",
    eventId,
    drawNameEventId,
    openModal,
    setCurrentStep,
    replaceCurrentStep,
    setEventId,
    setDrawNameEventId,
    closeModal,
  };
}
