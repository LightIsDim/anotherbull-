import { useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Attachment } from "@/types";
import { MAX_UPLOAD_BYTES, apiUpload } from "@/lib/uploads";

interface AttachmentUploaderProps {
  value: Attachment[];
  onChange: (files: Attachment[]) => void;
}

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt";

// Supporting documents (PDF/office/zip) for projects — uploads immediately, keeps the original name.
export default function AttachmentUploader({ value, onChange }: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(list: File[]) {
    if (list.length === 0) return;
    const files = [...value];
    for (const file of list) {
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`"${file.name}" melebihi batas 8 MB`);
        continue;
      }
      setBusy(true);
      try {
        const res = await apiUpload(file);
        files.push({ name: res.original_name || res.name, url: res.url });
        onChange([...files]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload gagal");
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        data-testid="attachment-input"
        onChange={(e) => {
          const list = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = "";
          void handleFiles(list);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        data-testid="file-uploader"
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-dashed border-cyan-400/40 px-4 text-sm text-muted-foreground transition-colors hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin text-cyan-300" />
        ) : (
          <Paperclip className="size-4" />
        )}
        Tambah file pendukung (PDF/dokumen)
      </button>
      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((f, i) => (
            <li
              key={`${f.url}-${i}`}
              data-testid={`file-item-${i}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/50 px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <FileText className="size-4 shrink-0 text-cyan-300" />
                <span className="truncate">{f.name}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label={`Hapus file ${f.name}`}
                data-testid={`file-remove-${i}`}
                className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
