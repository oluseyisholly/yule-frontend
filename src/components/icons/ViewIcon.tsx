"use client";

import * as React from "react";

type Props = { className?: string };

export default function ViewIcon({ className }: Props) {
  return (
    <svg
      width="12"
      height="9"
      viewBox="0 0 12 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.7937 6.25C7.00182 6.25 7.9812 5.27062 7.9812 4.0625C7.9812 2.85438 7.00182 1.875 5.7937 1.875C4.58558 1.875 3.6062 2.85438 3.6062 4.0625C3.6062 5.27062 4.58558 6.25 5.7937 6.25Z"
        stroke="currentColor"
        strokeWidth="0.625"
      />
      <path
        d="M10.9113 3.39625C11.1538 3.69125 11.275 3.83813 11.275 4.0625C11.275 4.28687 11.1538 4.43375 10.9113 4.72875C10.0238 5.80625 8.06625 7.8125 5.79375 7.8125C3.52125 7.8125 1.56375 5.80625 0.67625 4.72875C0.43375 4.43375 0.3125 4.28687 0.3125 4.0625C0.3125 3.83813 0.43375 3.69125 0.67625 3.39625C1.56375 2.31875 3.52125 0.3125 5.79375 0.3125C8.06625 0.3125 10.0238 2.31875 10.9113 3.39625Z"
        stroke="currentColor"
        strokeWidth="0.625"
      />
    </svg>
  );
}
