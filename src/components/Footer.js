import { Link } from "react-router-dom";
import {
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaWhatsapp,
  FaPhone,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const productLinks = [
  { name: "How it works", path: "/home#how-it-works" },
  { name: "Educators", path: "/tutors" },
  { name: "Lessons", path: "/home#lessons" },
  { name: "FAQs", path: "/faq" },
  { name: "Start learning", path: "/signup" },
];

const companyLinks = [
  { name: "About us", path: "/about-us" },
  { name: "Our team", path: "/team" },
  { name: "Terms", path: "/terms-and-conditions" },
  { name: "Privacy", path: "/privacy-policy" },
  { name: "Cookies", path: "/cookies-policy" },
];

export default function Footer() {
  return (
    <footer className="bg-[#015575] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/home" className="inline-block">
              <img
                src="/images/logo.png"
                alt="StudyBuddy Africa"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-xs font-josefin text-sm leading-relaxed text-white/80">
              Verified teachers. Curriculum-aligned learning. Built in Africa,
              for Africa.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                {
                  Icon: FaTwitter,
                  href: "https://twitter.com",
                  label: "Twitter",
                },
                {
                  Icon: FaLinkedin,
                  href: "https://linkedin.com",
                  label: "LinkedIn",
                },
                {
                  Icon: FaInstagram,
                  href: "https://instagram.com",
                  label: "Instagram",
                },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#01B0F1]"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-lilita text-lg text-white">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-josefin text-sm text-white/75 transition hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-lilita text-lg text-white">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-josefin text-sm text-white/75 transition hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-lilita text-lg text-white">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="tel:+254790624153"
                  className="flex items-center gap-2.5 font-josefin text-sm text-white/75 transition hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <FaPhone className="text-xs" />
                  </span>
                  +254 790 624153
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/254790624153"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-josefin text-sm text-white/75 transition hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <FaWhatsapp className="text-sm" />
                  </span>
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@studybuddy.africa"
                  className="flex items-center gap-2.5 font-josefin text-sm text-white/75 transition hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <MdEmail className="text-sm" />
                  </span>
                  info@studybuddy.africa
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-8 sm:flex-row">
          <p className="font-josefin text-xs text-white/60">
            © {new Date().getFullYear()} StudyBuddy Africa. All rights reserved.
          </p>
          <p className="font-josefin text-xs text-white/50">
            Built for learners, parents & educators
          </p>
        </div>
      </div>
    </footer>
  );
}
