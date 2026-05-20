"use client";

import { useState } from "react";

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

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 border-r-2 border-b-2 border-gray-400 transition-transform duration-200 ${
        open ? "rotate-[225deg]" : "rotate-45 -translate-y-0.5"
      }`}
    />
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white px-6 py-14 md:py-20">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="inline-block border border-[#F5A623] text-[#F5A623] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide">
            FAQ
          </span>
          <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-bold text-dark leading-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted text-sm">
            See frequent questions ask from our users
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-gray-200 rounded-xl bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm md:text-base text-dark">
                    {faq.question}
                  </span>
                  <Chevron open={isOpen} />
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
