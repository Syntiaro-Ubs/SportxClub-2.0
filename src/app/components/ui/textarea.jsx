import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border border-slate-300 dark:border-slate-700/80 placeholder:text-muted-foreground focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 focus-visible:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md bg-background/80 px-3 py-2 text-base shadow-2xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
