import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { apiGet } from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { FaksiEditorDialog } from "@/components/admin/ContentManagers";
import { FAKSI_SECTIONS } from "@/lib/constants";
import { useMe } from "@/lib/session";
import type { SiteContent } from "@/types";

export default function Tujuan() {
  const { data: me } = useMe();
  const isAdmin = !!me;
  const { data: content, isLoading } = useQuery({
    queryKey: ["content", "faksi"],
    queryFn: () => apiGet<SiteContent>("/content/faksi"),
  });
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <PageHeader
        kicker="Identitas Faksi"
        title="Tujuan dan Arah Perjuangan Teknisi TKJ"
        description="Dokumen hidup — latar belakang, visi, misi, tujuan, prinsip, dan harapan yang dikembangkan admin Teknisi TKJ."
        action={
          isAdmin ? (
            <Button onClick={() => setEditing(true)} data-testid="btn-edit-tujuan">
              <PenLine /> Edit Halaman
            </Button>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {isLoading && (
          <div className="space-y-10">
            {FAKSI_SECTIONS.map((s) => (
              <div key={s.key} className="h-20 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>
        )}
        {!isLoading && (
          <div className="space-y-12">
            {FAKSI_SECTIONS.map((s, i) => {
              const value = content?.data[s.key] ?? "";
              return (
                <section key={s.key} data-testid={`faksi-section-${s.key}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-red-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-heading text-xl font-bold sm:text-2xl">{s.label}</h2>
                  </div>
                  <div className="tkj-stripe mt-2 h-0.5 w-16 rounded-full" />
                  {value ? (
                    <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {value}
                    </p>
                  ) : (
                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-dashed border-border/70 bg-card/30 p-6 text-sm text-muted-foreground">
                      <PenLine className="mt-0.5 size-4 shrink-0 text-cyan-300" />
                      <span>
                        Belum diisi — bagian ini dapat diisi kapan saja oleh admin
                        melalui dashboard.
                      </span>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <FaksiEditorDialog open={editing} onOpenChange={setEditing} content={content ?? null} />
    </div>
  );
}
