import { Link } from "react-router";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Logo } from "../brand/Logo";
import { cn } from "../ui/utils";

export function GlobalFooter() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";

  const columns = [
    {
      title: "Platform",
      links: [
        { label: "Venues", to: "/venues" },
        { label: "Tournaments", to: "/tournaments" },
        { label: "Community", to: "/community" }
      ]
    },
    {
      title: "For business",
      links: [
        { label: "Organizers", to: "/organizer-dashboard" },
        { label: "Player Details", to: "/profile" },
        { label: "Support", to: "/profile" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Terms & Conditions", to: "/terms" },
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Refund Policy", to: "/refund-policy" }
      ]
    }
  ];

  const socialLinks = [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/sportxclubs/",
      brandColor: "#0A66C2",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/sportxclubs?igsh=cmEyaTlzODhjNzh6",
      brandColor: "#E4405F",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      )
    },
    {
      label: "Facebook",
      brandColor: "#1877F2",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.114.198v3.425c-.257-.042-.803-.08-1.196-.08-2.22 0-2.628.718-2.628 2.235v1.677h4.083l-.68 3.667h-3.403v7.98H9.101z" />
        </svg>
      )
    },
    {
      label: "Twitter",
      brandColor: "#1DA1F2",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      )
    },
    {
      label: "YouTube",
      brandColor: "#FF0000",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    }
  ];

  return (
    <footer className={`w-full pt-4 sm:pt-6 pb-4 md:pb-6 px-6 md:px-12 border-t mt-2 transition-all duration-300 text-left ${isDark
      ? "bg-[#090D16] border-white/[0.05] text-white"
      : "bg-[#FBFBFA] border-slate-200 text-slate-800"
      }`}>
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.1fr_0.75fr_0.75fr_0.8fr_0.8fr] gap-5 lg:gap-8 items-start">
        {/* Left Column: Logo, description, and app badges */}
        <div className="space-y-2.5 sm:space-y-4 max-w-md col-span-2 sm:col-span-3 lg:col-span-1">
          <a href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <Logo className="h-[50px] md:h-[80px]" />
          </a>
          <p className={`text-xs leading-relaxed transition-colors duration-300 ${isDark ? "text-white/60" : "text-slate-650"
            }`}>
            SportXClub is the premium way to discover, book, and compete across the best sports venues and tournaments.
          </p>
        </div>

        {/* Platform & For Business Columns */}
        {columns.map((column) => (
          <div key={column.title} className="space-y-2 sm:space-y-3">
            <h4 className={`text-[10px] uppercase font-bold tracking-[0.24em] ${isDark ? "text-white/50" : "text-slate-400"
              }`}>
              {column.title}
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className={`text-xs transition-colors ${isDark ? "text-white/70 hover:text-emerald-600" : "text-slate-600 hover:text-emerald-600"
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Social Column */}
        <div className="space-y-2 sm:space-y-3 min-w-max">
          <h4 className={`text-[10px] uppercase font-bold tracking-[0.24em] ${isDark ? "text-white/50" : "text-slate-400"
            }`}>
            Social
          </h4>
          <div className="flex items-center flex-nowrap gap-1.5 sm:gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href || `#${social.label.toLowerCase()}`}
                target={social.href ? "_blank" : "_self"}
                rel={social.href ? "noopener noreferrer" : ""}
                className={`h-9 w-9 rounded-full flex items-center justify-center border-0 bg-transparent transition-all hover:scale-110 active:scale-95 relative overflow-hidden hover:bg-slate-100/50 dark:hover:bg-white/10 shrink-0`}
                style={{ color: social.brandColor }}
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 pt-3 border-t flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-light",
          isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
        )}
      >
        <p className="text-center">
          Powered By{" "}
          <a
            href="https://www.syntiaro.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-medium transition-colors",
              isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-700 hover:text-teal-800"
            )}
          >
            SYNTIARO
          </a>
        </p>
      </div>
    </footer>
  );
}
