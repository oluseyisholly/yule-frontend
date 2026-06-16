"use client";

import { useState } from "react";
import Image from "next/image";
import dropIcon from "@/assets/icons/dropIcon.svg";

const faqs = [
  {
    question: "What types of celebrations can I plan through yule?",
    answer:
      "From birthdays, anniversaries, and graduations to weddings and holidays — Yule helps you organize and celebrate any meaningful moment.",
  },
  {
    question: "Can I personalize or customize a gift?",
    answer:
      "Yes. You can add personal messages, choose wrapping options, and tailor your gift to the recipient's taste.",
  },
  {
    question: "Can I schedule gift delivery for a specific date?",
    answer:
      "Absolutely. Pick the delivery date at checkout and we'll make sure it arrives right on time.",
  },
  {
    question: "How do I track my gift?",
    answer:
      "Once your order ships, you'll receive a tracking link via email. You can also view real-time status from your dashboard.",
  },
  {
    question: "Can I include a personalized message with my gift?",
    answer:
      "Yes — every gift can include a custom message that's printed on a card and tucked into the package.",
  },
  {
    question: "Are reservations required for group bookings?",
    answer:
      "For most venues, yes. Use the Find Hangouts feature to reserve spots ahead of time.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white px-4 py-8 pb-13 sm:px-6 md:px-8 md:pt-19">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
          <span className="mb-3.5 inline-block rounded-[12px] border border-[#FF6600] bg-[#FF660014] px-4 py-2 text-[12px] tracking-wide text-[#FF6600]">
            FAQ
          </span>
          <h2 className="mb-3.5 font-title text-[28px] leading-tight text-[#000000] sm:text-[34px] md:text-[40px]">
            Frequently Asked Questions
          </h2>
          <p className="text-muted max-w-[620px] text-[14px] font-medium sm:text-[16px]">
            See frequent questions ask from our users
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[0_0_0_4px_#FFFFFF]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-5 text-left transition-colors hover:bg-gray-50 sm:px-5 sm:py-7"
                >
                  <span className="text-sm text-dark md:text-base">
                    {faq.question}
                  </span>
                  <Image
                    src={dropIcon}
                    alt=""
                    aria-hidden
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm leading-relaxed text-muted sm:px-5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
