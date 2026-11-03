import { FileText, ImageIcon, Pencil, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onOpen?: (project: Project) => void;
  admin?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export default function ProjectCard({ project, onOpen, admin, onEdit, onDelete }: ProjectCardProps) {
  const cover = project.photos[0];
  return (
    <article
      data-testid={`card-projek-${project.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,229,255,0.12)]"
    >
      <button
        type="button"
        onClick={() => onOpen?.(project)}
        className="block w-full text-left"
        data-testid={`btn-open-projek-${project.id}`}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          {cover ? (
            <img
              src={cover}
              alt={project.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="tkj-grid-bg grid size-full place-items-center text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
          <span className="absolute left-3 top-3">
            <Badge className="border border-cyan-400/40 bg-cyan-950/80 text-cyan-300">
              {project.category}
            </Badge>
          </span>
          {project.attachments.length > 0 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-mono text-xs text-red-300 backdrop-blur">
              <FileText className="size-3" />
              {project.attachments.length}
            </span>
          )}
        </div>
        <div className="space-y-2 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-cyan-300">
            {formatDate(project.date)}
          </p>
          <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug">
            {project.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          {project.team && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5 shrink-0" /> {project.team}
            </p>
          )}
          {project.tech.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.tech.slice(0, 4).map((t) => (
                <Badge key={t} variant="outline" className="font-mono text-xs">
                  {t}
                </Badge>
              ))}
              {project.tech.length > 4 && (
                <Badge variant="outline" className="font-mono text-xs">
                  +{project.tech.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>
      </button>
      {admin && (
        <div className="mt-auto flex justify-end gap-1 border-t border-border/60 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(project)}
            data-testid={`btn-edit-projek-${project.id}`}
          >
            <Pencil /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onDelete?.(project)}
            data-testid={`btn-delete-projek-${project.id}`}
          >
            <Trash2 /> Hapus
          </Button>
        </div>
      )}
    </article>
  );
}
