import { Pencil, Trash2 } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Member } from "@/types";

interface MemberCardProps {
  member: Member;
  admin?: boolean;
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
}

export default function MemberCard({ member, admin, onEdit, onDelete }: MemberCardProps) {
  return (
    <article
      data-testid={`card-anggota-${member.id}`}
      className="flex flex-col rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:ring-cyan-400/30"
    >
      <div className="flex items-start gap-3">
        <Avatar src={member.photo || undefined} name={member.full_name} className="size-14" />
        <div className="min-w-0">
          <h3 className="truncate font-heading text-base font-semibold">{member.full_name}</h3>
          {member.nickname && <p className="text-sm text-cyan-300">@{member.nickname}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{member.status}</Badge>
            {member.angkatan && (
              <Badge variant="outline" className="font-mono">
                Angkatan {member.angkatan}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {member.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {member.skills.map((s) => (
            <Badge key={s} variant="outline" className="border-cyan-400/30 text-cyan-300">
              {s}
            </Badge>
          ))}
        </div>
      )}
      {member.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{member.description}</p>
      )}
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        {member.year ? `Tahun masuk ${member.year}` : ""}
      </p>
      {admin && (
        <div className="mt-auto flex justify-end gap-1 border-t border-border/60 pt-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(member)}
            data-testid={`btn-edit-anggota-${member.id}`}
          >
            <Pencil /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onDelete?.(member)}
            data-testid={`btn-delete-anggota-${member.id}`}
          >
            <Trash2 /> Hapus
          </Button>
        </div>
      )}
    </article>
  );
}
