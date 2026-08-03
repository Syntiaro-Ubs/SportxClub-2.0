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
        className="h-full w-auto object-contain transition-all duration-300 dark:brightness-0 dark:invert"
      />
    </div>
  );
}
