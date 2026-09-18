import { cn } from "../ui/utils";

export function Logo({ className, forceTheme, ...props }) {
  const hasHeight = className && (className.includes("h-") || className.includes("height-"));

  if (forceTheme === "light") {
    return (
      <div className={cn("relative flex items-center justify-start shrink-0", !hasHeight && "h-[65px] md:h-[100px]", className)} {...props}>
        <img src="/assets/icons/SportXClub.png" alt="SportXClub" className="h-full w-auto object-contain transition-all duration-300" />
      </div>
    );
  }

  if (forceTheme === "dark") {
    return (
      <div className={cn("relative flex items-center justify-start shrink-0", !hasHeight && "h-[65px] md:h-[100px]", className)} {...props}>
        <img src="/assets/icons/SportXClub-light.png" alt="SportXClub" className="h-full w-auto object-contain transition-all duration-300" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-start shrink-0",
        !hasHeight && "h-[65px] md:h-[100px]",
        className,
      )}
      {...props}
    >
      <img
        src="/assets/icons/SportXClub.png"
        alt="SportXClub"
        className="h-full w-auto object-contain transition-all duration-300 block dark:hidden"
      />
      <img
        src="/assets/icons/SportXClub-light.png"
        alt="SportXClub"
        className="h-full w-auto object-contain transition-all duration-300 hidden dark:block"
      />
    </div>
  );
}
