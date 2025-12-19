import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const footerLinks = {
    products: ["Mobile Parts", "IC Chips", "Sensors", "Batteries", "Displays"],
    company: ["About Us", "Careers", "Press", "Blog", "Partnerships"],
    support: ["Help Center", "Contact Us", "Shipping Info", "Returns", "Warranty"]
  };

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" }
  ];

  return (
    <footer className="relative border-t border-[var(--footer-border)] bg-[var(--footer-bg)] transition-colors duration-500">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
       
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="w-8 h-8 text-cyan-400 fill-cyan-400" />
                <div className="absolute inset-0 blur-lg bg-cyan-400/50"></div>
              </div>
              <span className="text-[var(--footer-text)] tracking-tight">
                ABvolt
              </span>
            </div>
            <p className="text-[var(--footer-subtext)] max-w-sm">
              Your trusted partner for premium electronics and hardware components. Building the future of technology, one component at a time.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[var(--footer-subtext)]">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>support@technova.com</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--footer-subtext)]">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--footer-subtext)]">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>123 Tech Street, Silicon Valley, CA</span>
              </div>
            </div>
          </div>

          {/* Products column */}
          <div>
            <h3 className="text-[var(--footer-text)] mb-4">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-[var(--footer-subtext)] hover:text-cyan-400 transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-[var(--footer-text)] mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-[var(--footer-subtext)] hover:text-cyan-400 transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h3 className="text-[var(--footer-text)] mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-[var(--footer-subtext)] hover:text-cyan-400 transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-[var(--footer-border)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-[var(--footer-subtext)]">
              © 2025 TechNova. All rights reserved.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-[var(--footer-card-bg)] border border-[var(--footer-border)] flex items-center justify-center text-[var(--footer-subtext)] hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-[var(--footer-card-hover-bg)] transition-all duration-300 group"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Legal links */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-[var(--footer-subtext)] hover:text-cyan-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-[var(--footer-subtext)] hover:text-cyan-400 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
