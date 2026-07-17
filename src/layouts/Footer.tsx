import Link from "next/link";
import { MotionReveal } from "@/components/LandingMotion";
import Image from "next/image";
import Logo from "@/assets/images/logo.svg";
import fackbook from "@/assets/icons/facebook.svg";
import linkedin from "@/assets/icons/linkedin.svg";
import instagram from "@/assets/icons/instagram.svg";
import twitter from "@/assets/icons/twitter.svg";

const linkColumns = [
  // {
  //   title: "Quick Links",
  //   links: [
  //     { label: "Features", href: "/features" },
  //     { label: "Pricing", href: "/pricing" },
  //     { label: "Help Center", href: "/help" },
  //   ],
  // },
  // {
  //   title: "Resources",
  //   links: [{ label: "Blog", href: "/blog" }],
  // },

  {
    title: "Contact",
    links: [
      { label: "festa@viktri.tech", href: "" },
      { label: "+234 908 612 5352", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
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
    <footer className="bg-[#1A1A1A] px-5 py-8 text-white sm:px-6 md:px-10 lg:px-20 xl:px-28">
      <MotionReveal amount={0.12} className="mx-auto">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          {/* Left: Brand + Newsletter + Social */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="w-fit">
              <Image src={Logo} alt="Festa" width={150} height={150} />
            </Link>

            {/* Newsletter */}
            {/* <div>
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
            </div> */}
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between lg:gap-10">
            <div className="flex max-w-[300px] flex-col gap-2">
              <h1 className="text-[20px] font-semibold text-white">
                Gift Shops & Hospitality Business
              </h1>
              <p className="text-[16px] font-[400] leading-7 text-white sm:text-[18px]">
                <Link href="/discover" className="text-[#3300C9] underline">
                  {" "}
                  Get Discovered
                </Link>{" "}
                When People Celebrate
              </p>
            </div>
            {/* Right: Link columns */}
            <div className="grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 sm:gap-8">
              {linkColumns.map((column) => (
                <div key={column.title} className="flex flex-col gap-4">
                  <h4 className="text-[16px] font-bold text-white">
                    {column.title}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="whitespace-nowrap text-sm text-white transition-colors hover:text-white"
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
        </div>

        {/* Copyright */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#D9D9D9] pt-4 sm:flex-row">
          {/* Social */}
          <div className="flex gap-4">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex h-8 w-8 items-center justify-center"
              >
                <Image
                  src={social.icon}
                  alt={social.label}
                  className="h-full w-full"
                />
              </a>
            ))}
          </div>
          <div className="text-center text-[12px] text-white sm:text-right">
            Copyright © Vktri All Right Reserved
          </div>
        </div>
      </MotionReveal>
    </footer>
  );
}
