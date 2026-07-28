// Footer.jsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUp,
} from "lucide-react";
import { FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon, YoutubeIcon } from "../ui/SocialIcons";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const QUICK_LINKS = [
  { url: "/", label: "Home" },
  { url: "/about", label: "About" },
  { url: "/leadership", label: "Leadership" },
  { url: "/gallery", label: "Gallery" },
  { url: "/contact", label: "Contact" },
];

const POLICY_LINKS = [
  { url: "/faq", label: "FAQ" },
  { url: "/policies/privacy-policy", label: "Privacy Policy" },
  { url: "/policies/terms-and-conditions", label: "Terms and Conditions" },
  { url: "/policies/admissions-policy", label: "Admissions Policy" },
];

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

export default function Footer() {
  const { settings } = useSiteSettings();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const contactDetails = [
    settings.address && { icon: MapPin, text: settings.address },
    settings.phones?.[0] && { icon: Phone, text: settings.phones.join(' · ') },
    settings.email && { icon: Mail, text: settings.email },
    settings.officeHours && { icon: Clock, text: settings.officeHours },
  ].filter(Boolean);

  const socialEntries = Object.entries(settings.socialLinks || {}).filter(([, url]) => url);

  return (
    <footer className="relative bg-gray-900 text-gray-200">
      <div className="h-1 bg-blue-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* School Info — sourced from Website Settings */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={settings.logo}
                alt={`${settings.schoolName} logo`}
                className="h-12 w-12 object-contain"
              />
              <h3 className="text-2xl font-bold text-white">
                {settings.schoolName}
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-4">
              {settings.footer?.description ||
                'Nurturing excellence in education. We provide a holistic learning environment that fosters intellectual, social, and emotional growth.'}
            </p>
            {settings.motto && (
              <p className="italic text-sm text-gray-500 border-l-2 border-pink-500 pl-3">&quot;{settings.motto}&quot;</p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.url}>
                  <NavLink
                    to={link.url}
                    className={({ isActive }) =>
                      `inline-block text-gray-400 hover:text-pink-400 transition-colors duration-200 border-b border-transparent hover:border-pink-400 pb-0.5 ${
                        isActive ? "text-pink-400 font-medium border-pink-400" : ""
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 uppercase tracking-wide">Policies</h4>
            <ul className="space-y-3">
              {POLICY_LINKS.map((link) => (
                <li key={link.url}>
                  <NavLink
                    to={link.url}
                    className={({ isActive }) =>
                      `inline-block text-gray-400 hover:text-pink-400 transition-colors duration-200 border-b border-transparent hover:border-pink-400 pb-0.5 ${
                        isActive ? "text-pink-400 font-medium border-pink-400" : ""
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info + Social */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 uppercase tracking-wide">Contact Us</h4>
            {contactDetails.length === 0 ? (
              <p className="text-gray-500 text-sm">Contact details coming soon.</p>
            ) : (
              <ul className="space-y-4 mb-6">
                {contactDetails.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index} className="flex items-start space-x-3 text-gray-400">
                      <Icon className="h-5 w-5 mt-0.5 text-pink-400 flex-shrink-0" />
                      <span className="text-sm">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {socialEntries.length > 0 && (
              <div className="flex space-x-3">
                {socialEntries.map(([key, url]) => {
                  const Icon = SOCIAL_ICONS[key];
                  if (!Icon) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={key}
                      className="btn-animated text-gray-400 hover:text-white rounded-full p-2 bg-gray-800 hover:bg-blue-600"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
          <p>{settings.footer?.copyrightText || `© ${new Date().getFullYear()} ${settings.schoolName}. All rights reserved.`}</p>
          <p className="mt-2 sm:mt-0">
            Designed with <span className="text-pink-400">♥</span> for education
          </p>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn-animated fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
}
