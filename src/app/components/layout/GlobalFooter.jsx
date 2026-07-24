import { Link } from "react-router";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Logo } from "../brand/Logo";

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
    }
  ];

  const socialLinks = [
    {
      label: "LinkedIn",
      icon: "/assets/icons/social-linkedin.svg",
      fallback: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    },
    {
      label: "Instagram",
      icon: "/assets/icons/social-instagram.svg",
      fallback: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
        </svg>
      )
    },
    {
      label: "Facebook",
      icon: "/assets/icons/social-facebook.svg",
      fallback: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      )
    },
    {
      label: "Twitter",
      icon: "/assets/icons/social-twitter.svg",
      fallback: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      )
    },
    {
      label: "YouTube",
      icon: "/assets/icons/social-youtube.svg",
      fallback: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </svg>
      )
    }
  ];

  return (
    <footer className={`w-full pt-16 pb-6 px-6 md:px-12 border-t mt-12 transition-all duration-300 text-left ${isDark
      ? "bg-[#090D16] border-white/[0.05] text-white"
      : "bg-[#FBFBFA] border-slate-200 text-slate-800"
      }`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-10 items-start">
        {/* Left Column: Logo, description, and app badges */}
        <div className="space-y-6 max-w-md">
          <Logo />
          <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? "text-white/60" : "text-slate-650"
            }`}>
            SportXClub is the premium way to discover, book, and compete across the best sports venues and tournaments.
          </p>

        </div>

        {/* Platform & For Business Columns */}
        {columns.map((column) => (
          <div key={column.title} className="space-y-5">
            <h4 className={`text-[11px] uppercase font-bold tracking-[0.24em] ${isDark ? "text-white/50" : "text-slate-400"
              }`}>
              {column.title}
            </h4>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className={`text-sm transition-colors ${isDark ? "text-white/70 hover:text-[#6DFF3B]" : "text-slate-600 hover:text-emerald-600"
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
        <div className="space-y-5">
          <h4 className={`text-[11px] uppercase font-bold tracking-[0.24em] ${isDark ? "text-white/50" : "text-slate-400"
            }`}>
            Social
          </h4>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={`#${social.label.toLowerCase()}`}
                className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95 relative overflow-hidden ${isDark
                  ? "bg-white/[0.04] border-white/[0.08] text-white hover:border-[#6DFF3B]/30 hover:bg-[#6DFF3B]/10 hover:text-[#6DFF3B]"
                  : "bg-white border-slate-200 text-emerald-650 hover:border-emerald-500/30 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                aria-label={social.label}
              >
                <img
                  src={social.icon}
                  alt={social.label}
                  className="h-5 w-5 opacity-80 absolute inset-0 m-auto"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                {social.fallback}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto border-t mt-8 pt-4 flex flex-col md:flex-row items-center justify-between text-sm transition-colors duration-300 ${isDark ? "border-white/[0.08] text-white/40" : "border-slate-200 text-slate-500"
        }`}>
        <div className="hidden md:block flex-1" />
        <p className="flex-1 text-[10px] md:text-xs font-light text-center order-2 md:order-1 mt-3 md:mt-0">
          Powered By{" "}
          <a
            href="https://www.syntiaro.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-500 font-normal hover:text-teal-400 transition-colors"
          >
            SYNTIARO
          </a>
        </p>
        <div className="flex-1 flex gap-6 justify-center md:justify-end order-1 md:order-2">
          <Link to="/" className={`hover:underline ${isDark ? "hover:text-white" : "hover:text-slate-900"}`}>
            Privacy
          </Link>
          <Link to="/" className={`hover:underline ${isDark ? "hover:text-white" : "hover:text-slate-900"}`}>
            Terms
          </Link>
          <Link to="/" className={`hover:underline ${isDark ? "hover:text-white" : "hover:text-slate-900"}`}>
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
