"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";

type DrawNameSpinStepProps = {
  names: string[];
  onBack: () => void;
  onNext: (selectedName: string) => void;
};

function normalizeName(name: string) {
  return name.trim().toUpperCase();
}

export default function DrawNameSpinStep({
  names,
  onBack,
  onNext,
}: DrawNameSpinStepProps) {
  const ITEM_HEIGHT = 50;
  const STEP_DURATION_MS = 75;
  const normalizedNames = useMemo(() => {
    const nextNames = names
      .map(normalizeName)
      .filter(Boolean);

    return nextNames.length > 0 ? nextNames : ["NO PARTICIPANTS"];
  }, [names]);

  const spinNames = normalizedNames;
  const renderNames = useMemo(
    () =>
      spinNames.length > 1
        ? [...spinNames, ...spinNames, ...spinNames]
        : spinNames,
    [spinNames],
  );
  const cycleStartIndex = spinNames.length > 1 ? spinNames.length : 0;
  const spinStartTimeRef = useRef(0);

  useEffect(() => {
    spinStartTimeRef.current = performance.now();
  }, [spinNames]);

  const animationDurationMs = Math.max(spinNames.length, 1) * STEP_DURATION_MS;

  const getActiveName = () => {
    if (normalizedNames.length <= 1) {
      return normalizedNames[0] ?? "NO PARTICIPANTS";
    }

    const elapsedMs = Math.max(0, performance.now() - spinStartTimeRef.current);
    const activeIndex = Math.floor(elapsedMs / STEP_DURATION_MS) % normalizedNames.length;

    return normalizedNames[activeIndex] ?? normalizedNames[0];
  };

  return (
    <div className="space-y-10 pt-1">
      <div className="space-y-5">
        <p className="text-[20px] font-normal leading-[1.3] text-[#434343] sm:text-[24px]">
          Now go ahead and draw name.
        </p>

        <div className="rounded-[16px] border border-[#ECE8F7] bg-white px-5 py-1">
          <div className="h-[50px] overflow-hidden">
            <div
              className="draw-name-spin-reel flex flex-col"
              style={
                {
                  "--draw-name-spin-start": `-${cycleStartIndex * ITEM_HEIGHT}px`,
                  "--draw-name-spin-end": `-${(cycleStartIndex + spinNames.length) * ITEM_HEIGHT}px`,
                  "--draw-name-spin-duration": `${animationDurationMs}ms`,
                } as CSSProperties
              }
            >
              {renderNames.map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  className="flex h-[50px] items-center justify-center"
                >
                  <p className="truncate text-center text-[22px] font-semibold uppercase tracking-[0.02em] text-[#111111] sm:text-[24px]">
                    {name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <BackButton
          onClick={onBack}
          className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[24px]"
        />

        <ModalButton
          type="button"
          onClick={() => onNext(getActiveName())}
          className="max-w-[152px] !h-[38px]"
        >
          Next
        </ModalButton>
      </div>

      <style jsx>{`
        .draw-name-spin-reel {
          transform: translateY(var(--draw-name-spin-start));
          animation: draw-name-spin-loop var(--draw-name-spin-duration) linear infinite;
          will-change: transform;
        }

        @keyframes draw-name-spin-loop {
          from {
            transform: translateY(var(--draw-name-spin-start));
          }

          to {
            transform: translateY(var(--draw-name-spin-end));
          }
        }
      `}</style>
    </div>
  );
}
