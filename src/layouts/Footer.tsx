import Link from "next/link";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Logo from "@/assets/images/logo.svg";
import fackbook from "@/assets/icons/facebook.svg";
import linkedin from "@/assets/icons/linkedin.svg";
import instagram from "@/assets/icons/instagram.svg";
import twitter from "@/assets/icons/twitter.svg";

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
  { label: "Facebook", icon: fackbook, href: "#" },
  { label: "LinkedIn", icon: linkedin, href: "#" },
  { label: "Instagram", icon: instagram, href: "#" },
  { label: "X", icon: twitter, href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white px-6 md:px-29 py-5 md:py-15">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Left: Brand + Newsletter + Social */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="w-fit">
              <Image src={Logo} alt="Yule" width={65} height={35} />
            </Link>

            {/* Newsletter */}
            <div>
              <p className="text-[24px]  mb-0.5 text-white">
                Subscribe to our Newsletter!
              </p>
              <p className="text-sm text-white mb-2.5">
                Stay informed with our latest updates
              </p>
              <form className="relative w-full max-w-md">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="w-full h-12 pr-32 bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-gray-500 focus-visible:border-primary focus-visible:ring-primary/20"
                />
                <Button
                  label="Subscribe"
                  variant="filled"
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg h-12"
                />
              </form>
            </div>

            {/* Social */}
            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <Image
                    src={social.icon}
                    alt={social.label}
                    className="w-full h-full"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {linkColumns.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h4 className="font-bold text-white text-[16px]">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white hover:text-white transition-colors"
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
        <div className="text-center text-white text-[12px] mt-12 md:mt-16">
          Copyright © Tenda All Right Reserved
        </div>
      </div>
    </footer>
  );
}
