import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../ui/utils";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

export function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    setDidError(true);
    setIsLoaded(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const { src, alt, style, className, ...rest } = props;

  if (didError) {
    return (
      <div
        className={`inline-block bg-muted text-center align-middle ${className ?? ""}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={ERROR_IMG_SRC}
            alt="Error loading image"
            {...rest}
            data-original-url={src}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden inline-block bg-muted/40", className)} style={style}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/40 dark:bg-slate-800/40 animate-pulse z-10" />
      )}
      <img
        src={src}
        alt={alt}
        decoding="async"
        loading="lazy"
        className={cn("w-full h-full object-cover transition-opacity duration-300", !isLoaded ? "opacity-0" : "opacity-100")}
        {...rest}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
