import { Button } from "./button";
import { motion } from "motion/react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/60 bg-muted/20 ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl  mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-[280px] mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="lg">
          {actionText}
        </Button>
      )}
    </motion.div>
  );
}
