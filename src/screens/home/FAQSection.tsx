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
    <section className="bg-white px-6 py-8 md:pt-19 pb-13">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="inline-block border border-[#FF6600] text-[#FF6600] bg-[#FF660014] text-[12px] px-4 py-2 rounded-[12px] mb-3.5 tracking-wide">
            FAQ
          </span>
          <h2 className="font-title text-[40px]  text-[#000000] leading-tight mb-3.5">
            Frequently Asked Questions
          </h2>
          <p className="text-muted text-[16px] font-medium  ">
            See frequent questions ask from our users
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-6">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-gray-200 rounded-[10px] bg-white overflow-hidden shadow-[0_0_0_4px_#FFFFFF]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-7 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm md:text-base text-dark">
                    {faq.question}
                  </span>
                  <Image
                    src={dropIcon}
                    alt=""
                    aria-hidden
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-muted leading-relaxed">
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
