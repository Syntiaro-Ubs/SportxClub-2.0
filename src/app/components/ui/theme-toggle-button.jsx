import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./button";
import { cn } from "./utils";

export function ThemeToggleButton({
  className,
  variant = "ghost",
  size = "icon",
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "shrink-0 rounded-full border-0 !bg-transparent hover:!bg-transparent focus:!bg-transparent active:!bg-transparent shadow-none hover:shadow-none focus:ring-0 focus-visible:ring-0 cursor-pointer group p-0 transition-colors",
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-12 text-foreground group-hover:text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 ease-out group-hover:scale-125 group-hover:-rotate-12 text-foreground group-hover:text-emerald-500" />
      )}
    </Button>
  );
}
