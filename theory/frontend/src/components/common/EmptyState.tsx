import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  testid?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, testid }: EmptyStateProps) {
  return (
    <div
      data-testid={testid}
      className="grid place-items-center rounded-xl border border-dashed border-border/80 bg-card/30 px-6 py-14 text-center"
    >
      <Icon className="size-8 text-muted-foreground/70" />
      <p className="mt-4 font-heading text-base font-semibold">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
