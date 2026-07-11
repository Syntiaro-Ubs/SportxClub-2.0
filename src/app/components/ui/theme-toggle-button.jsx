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
      className={cn("shrink-0", className)}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
