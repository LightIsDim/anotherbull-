import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  testid?: string;
}

export default function StatCard({ icon: Icon, value, label, testid }: StatCardProps) {
  return (
    <div
      data-testid={testid}
      className="tkj-glow rounded-xl border border-cyan-400/20 bg-card/70 p-5 backdrop-blur"
    >
      <Icon className="size-5 text-cyan-300" />
      <p className="mt-3 font-heading text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
