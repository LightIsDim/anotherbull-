import { Pencil, Trash2 } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Leader } from "@/types";

interface LeaderNodeProps {
  leader: Leader;
  head?: boolean;
  admin?: boolean;
  onEdit?: (leader: Leader) => void;
  onDelete?: (leader: Leader) => void;
}

// One org-chart node — the first (order 0) renders as the head with a red tactical ring.
export default function LeaderNode({ leader, head, admin, onEdit, onDelete }: LeaderNodeProps) {
  return (
    <div
      data-testid={`card-pengurus-${leader.id}`}
      className={cn(
        "relative flex flex-col rounded-xl bg-card p-5 text-center ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1",
        head ? "ring-2 ring-red-500/50 md:mx-auto md:max-w-sm" : "hover:ring-cyan-400/30"
      )}
    >
      <div className="mx-auto w-fit">
        <Avatar
          src={leader.photo || undefined}
          name={leader.name}
          className={head ? "size-20" : "size-16"}
        />
      </div>
      <div className="mt-3 flex justify-center">
        <Badge
          className={
            head
              ? "bg-red-600 text-white"
              : "border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
          }
        >
          {leader.position}
        </Badge>
      </div>
      <h3 className="mt-2 font-heading text-lg font-semibold leading-snug">{leader.name}</h3>
      {leader.period && (
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Periode {leader.period}
        </p>
      )}
      {leader.duties && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{leader.duties}</p>
      )}
      {admin && (
        <div className="mt-auto flex justify-center gap-1 border-t border-border/60 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(leader)}
            data-testid={`btn-edit-pengurus-${leader.id}`}
          >
            <Pencil /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onDelete?.(leader)}
            data-testid={`btn-delete-pengurus-${leader.id}`}
          >
            <Trash2 /> Hapus
          </Button>
        </div>
      )}
    </div>
  );
}
