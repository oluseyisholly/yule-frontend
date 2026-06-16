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
    <footer className="bg-[#1A1A1A] px-4 py-8 text-white sm:px-6 md:px-10 lg:px-20 xl:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left: Brand + Newsletter + Social */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="w-fit">
              <Image src={Logo} alt="Yule" width={65} height={35} />
            </Link>

            {/* Newsletter */}
            <div>
              <p className="mb-0.5 text-[22px] text-white sm:text-[24px]">
                Subscribe to our Newsletter!
              </p>
              <p className="mb-2.5 text-sm text-white">
                Stay informed with our latest updates
              </p>
              <form className="flex w-full max-w-md flex-col gap-3 sm:relative sm:block">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="h-12 w-full border-[#3A3A3A] bg-[#2A2A2A] text-white placeholder:text-gray-500 focus-visible:border-primary focus-visible:ring-primary/20 sm:pr-32"
                />
                <Button
                  label="Subscribe"
                  variant="filled"
                  className="h-12 w-full justify-center rounded-lg sm:absolute sm:right-0 sm:top-1/2 sm:w-auto sm:-translate-y-1/2"
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
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
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
        <div className="mt-10 text-center text-[12px] text-white md:mt-16">
          Copyright © Tenda All Right Reserved
        </div>
      </div>
    </footer>
  );
}
