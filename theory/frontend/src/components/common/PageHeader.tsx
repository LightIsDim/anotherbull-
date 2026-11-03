import type { ReactNode } from "react";

interface PageHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ kicker, title, description, action }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-border/60 bg-card/40">
      <div className="tkj-grid-bg absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">{kicker}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {action}
        </div>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        <div className="tkj-stripe mt-6 h-1 w-24 rounded-full" />
      </div>
    </header>
  );
}
