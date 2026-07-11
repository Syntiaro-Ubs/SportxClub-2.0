import { cn } from "../ui/utils";

export function Logo({ className, ...props }) {
  const hasHeight = className && (className.includes("h-") || className.includes("height-"));

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
        className="block dark:hidden h-full w-auto object-contain transition-all duration-300"
      />
      <img
        src="/assets/icons/SportXClub-light.png"
        alt="SportXClub"
        className="hidden dark:block h-full w-auto object-contain transition-all duration-300"
      />
    </div>
  );
}
