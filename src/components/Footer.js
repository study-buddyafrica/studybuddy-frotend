import {
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaArrowRight,
  FaWhatsapp,
  FaPhone,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#015575] to-[#01B0F1] text-white pt-16 pb-8 px-4 sm:px-8 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-white/20 to-transparent animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6">
            <img
              src="/images/logo.png"
              alt="StudyBuddy Logo"
              className="w-40 h-auto" // Removed filter classes for clarity
            />
            <p className="font-josefin text-white/90 text-lg leading-relaxed">
              StudyBuddy Africa is an education technology platform empowering
              learners with accessible, verified, and affordable learning tools
              — built in Africa, for Africa.
            </p>
            <motion.a
              href="/faq"
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors w-fit">
              <span className="font-josefin font-semibold">Explore More</span>
              <FaArrowRight className="mt-1" />
            </motion.a>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6">
            <h3 className="font-lilita text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-[#aadfff]">
              Connect With Us
            </h3>
            <div className="space-y-4">
              <a
                href="tel:+254790624153"
                className="flex items-center gap-3 group hover:text-white transition-colors">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition">
                  <FaPhone className="text-xl" />
                </div>
                <span className="font-josefin">+254 790 624153</span>
              </a>
              <a
                href="https://wa.me/254790624153"
                className="flex items-center gap-3 group hover:text-white transition-colors">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition">
                  <FaWhatsapp className="text-xl" />
                </div>
                <span className="font-josefin">Chat on WhatsApp</span>
              </a>
              <a
                href="mailto:info@studybuddy.africa"
                className="flex items-center gap-3 group hover:text-white transition-colors">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition">
                  <MdEmail className="text-xl" />
                </div>
                <span className="font-josefin">info@studybuddy.africa</span>
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6">
            <h3 className="font-lilita text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-[#aadfff]">
              Quick Access
            </h3>
            <nav className="space-y-4">
              {[
                { name: "About Us", path: "/about-us" },
                { name: "Our Team", path: "/team" },
                { name: "Terms And Conditions", path: "/terms-and-conditions" },
                { name: "Privacy Policy", path: "/privacy-policy" },
                { name: "FAQs", path: "/faq" },
              ].map((link, index) => (
                <motion.a
                  key={index}
                  href={link.path}
                  whileHover={{ x: 5 }}
                  className="block font-josefin text-white/90 hover:text-white transition-colors">
                  {link.name}
                </motion.a>
              ))}
            </nav>
          </motion.div>

          {/* Social & Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-6">
            <h3 className="font-lilita text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-[#aadfff]">
              Stay Connected
            </h3>
            <div className="flex gap-4">
              {[
                { icon: FaTwitter, link: "https://twitter.com" },
                { icon: FaLinkedin, link: "https://linkedin.com" },
                { icon: FaInstagram, link: "https://instagram.com" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition">
                  <social.icon className="text-xl" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-8" />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/80">
          <p className="font-josefin text-center text-sm">
            © {new Date().getFullYear()} StudyBuddy Africa. All rights reserved.
          </p>
          {/* <div className="flex gap-4">
            <a
              href="/sitemap"
              className="text-sm hover:text-white transition-colors"
            >
              Sitemap
            </a>
            <a
              href="/accessibility"
              className="text-sm hover:text-white transition-colors"
            >
              Accessibility
            </a>
          </div> */}
        </motion.div>
      </div>
    </footer>
  );
}
