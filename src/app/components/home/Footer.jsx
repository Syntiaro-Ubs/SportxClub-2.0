import { Link } from "react-router";
import { Logo } from "../brand/Logo";
import { useTheme } from "next-themes";
import { cn } from "../ui/utils";

const asset = (path) => `/assets${path}`;

export function Footer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <footer
      id="contact"
      className={cn(
        "relative overflow-hidden border-t pb-4 pt-16 transition-colors duration-200",
        isDark ? "border-white/[0.08] bg-[#050505]" : "border-slate-200 bg-white"
      )}
    >
      <div className="absolute inset-0">
        <img
          src={asset("/footer/footer-pattern.svg")}
          alt=""
          aria-hidden="true"
          className={cn(
            "h-full w-full object-cover",
            isDark ? "opacity-25" : "opacity-5"
          )}
        />

        <div className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[linear-gradient(180deg,rgba(5,5,5,0.72),#050505)]"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.72),#ffffff)]"
        )} />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.18fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <Logo />
            </div>
            <p className={cn(
              "mt-5 text-sm leading-7",
              isDark ? "text-white/64" : "text-slate-600"
            )}>
              SportXClub is the premium way to discover, book, and compete
              across the best sports venues and tournaments.
            </p>

          </div>

          {[
            {
              title: "Platform",
              links: [
                { label: "Venues", to: "/venues" },
                { label: "Tournaments", to: "/tournaments" },
                { label: "Community", to: "/community" },
              ],
            },
            {
              title: "For business",
              links: [
                { label: "Organizers", to: "/organizer-dashboard" },
                { label: "Player Details", to: "/profile" },
                { label: "Support", to: "/profile" },
              ],
            },
            {
              title: "Social",
              links: [
                {
                  label: "LinkedIn",
                  icon: asset("/icons/social-linkedin.svg"),
                },
                {
                  label: "Instagram",
                  icon: asset("/icons/social-instagram.svg"),
                },
                {
                  label: "Facebook",
                  icon: asset("/icons/social-facebook.svg"),
                },
                { label: "Twitter", icon: asset("/icons/social-twitter.svg") },
                { label: "YouTube", icon: asset("/icons/social-youtube.svg") },
              ],
            },
          ].map((column) => (
            <div key={column.title}>
              <p className={cn(
                "text-sm uppercase tracking-[0.24em]",
                isDark ? "text-white/55" : "text-slate-500 font-semibold"
              )}>
                {column.title}
              </p>
              {column.title !== "Social" ? (
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to ?? "#"}
                        className={cn(
                          "text-sm transition",
                          isDark ? "text-white/68 hover:text-white" : "text-slate-600 hover:text-emerald-600"
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  {column.links.map((link) => (
                    <a
                      key={link.label}
                      href="#"
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-full border transition",
                        isDark
                          ? "border-white/[0.08] bg-white/[0.04] hover:border-[#6DFF3B]/30 hover:bg-[#6DFF3B]/10"
                          : "border-slate-200 bg-slate-50 hover:border-emerald-500/30 hover:bg-emerald-50"
                      )}
                      aria-label={link.label}
                    >
                      {"icon" in link && (
                        <img
                          src={link.icon}
                          alt=""
                          aria-hidden="true"
                          className="h-5 w-5"
                        />
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={cn(
          "mt-8 flex flex-col md:flex-row gap-4 border-t pt-4 text-sm items-center justify-between",
          isDark ? "border-white/[0.08] text-white/46" : "border-slate-200 text-slate-500"
        )}>
          <div className="flex-1 hidden md:block"></div>
          <p className={cn(
            "flex-1 text-[10px] md:text-xs font-light text-center",
            isDark ? "text-white/40" : "text-slate-400"
          )}>
            Powered By <a href="https://www.syntiaro.com/" target="_blank" rel="noopener noreferrer" className={cn("font-normal transition-colors", isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700")}>SYNTIARO</a>
          </p>
          <div className="flex-1 flex flex-wrap gap-5 justify-center md:justify-end">
            <a href="#" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-900")}>
              Privacy
            </a>
            <a href="#" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-900")}>
              Terms
            </a>
            <a href="#" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-900")}>
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
