import Link from "next/link";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";

const linkColumns = [
  {
    title: "Quick Links",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Resources",
    links: [{ label: "Blog", href: "/blog" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Support", href: "/support" },
      { label: "Sales", href: "/sales" },
    ],
  },
];

const socials = [
  { label: "Facebook", short: "f", href: "#" },
  { label: "LinkedIn", short: "in", href: "#" },
  { label: "Instagram", short: "ig", href: "#" },
  { label: "X", short: "X", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white px-6 md:px-12 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Left: Brand + Newsletter + Social */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none w-fit">
              <span className="font-title text-3xl font-bold text-white">
                yule
              </span>
              <span className="text-[10px] font-medium text-[#F5A623] tracking-wide">
                gift &amp; celebrate
              </span>
            </Link>

            {/* Newsletter */}
            <div>
              <h3 className="font-title text-xl font-bold mb-2 text-white">
                Subscribe to our Newsletter!
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Stay informed with our latest updates
              </p>
              <form className="flex items-stretch gap-2 w-full max-w-md">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-gray-500 focus-visible:border-primary focus-visible:ring-primary/20"
                />
                <Button
                  label="Subscribe"
                  variant="filled"
                  className="rounded-lg px-5"
                />
              </form>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 flex items-center justify-center bg-white text-black text-xs font-bold rounded"
                >
                  {social.short}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {linkColumns.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h4 className="font-title font-semibold text-white text-sm">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-xs mt-12 md:mt-16">
          Copyright © Tenda All Right Reserved
        </div>
      </div>
    </footer>
  );
}
