import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { Activity } from "@/types";

interface ActivityCardProps {
  activity: Activity;
  onOpen?: (activity: Activity) => void;
  admin?: boolean;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
}

export default function ActivityCard({ activity, onOpen, admin, onEdit, onDelete }: ActivityCardProps) {
  const cover = activity.photos[0];
  return (
    <article
      data-testid={`card-kegiatan-${activity.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(220,38,38,0.15)]"
    >
      <button
        type="button"
        onClick={() => onOpen?.(activity)}
        className="block w-full text-left"
        data-testid={`btn-open-kegiatan-${activity.id}`}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          {cover ? (
            <img
              src={cover}
              alt={activity.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="tkj-grid-bg grid size-full place-items-center text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
          <span className="absolute left-3 top-3">
            <Badge className="bg-red-600 text-white">{activity.category}</Badge>
          </span>
          {activity.photos.length > 1 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-mono text-xs text-cyan-300 backdrop-blur">
              <ImageIcon className="size-3" />
              {activity.photos.length}
            </span>
          )}
        </div>
        <div className="space-y-2 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-cyan-300">
            {formatDate(activity.date)}
          </p>
          <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug">
            {activity.title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{activity.description}</p>
        </div>
      </button>
      {admin && (
        <div className="mt-auto flex justify-end gap-1 border-t border-border/60 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(activity)}
            data-testid={`btn-edit-kegiatan-${activity.id}`}
          >
            <Pencil /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onDelete?.(activity)}
            data-testid={`btn-delete-kegiatan-${activity.id}`}
          >
            <Trash2 /> Hapus
          </Button>
        </div>
      )}
    </article>
  );
}
