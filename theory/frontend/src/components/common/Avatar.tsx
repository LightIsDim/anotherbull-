import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

// Photo when available; otherwise a red/cyan initials medallion.
export default function Avatar({ src, name, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={`Foto ${name}`}
        className={cn("size-12 shrink-0 rounded-full object-cover ring-2 ring-red-500/40", className)}
      />
    );
  }
  return (
    <div
      aria-label={name}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-600/80 to-red-950 font-heading font-bold text-white ring-2 ring-cyan-400/30",
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
