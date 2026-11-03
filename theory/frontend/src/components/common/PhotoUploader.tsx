import { useRef, useState } from "react";
import { ImageIcon, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { MAX_UPLOAD_BYTES, apiUpload } from "@/lib/uploads";

interface PhotoUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
}

// Uploads immediately on pick; value is the stored URL list (single mode keeps at most one).
export default function PhotoUploader({
  value,
  onChange,
  multiple = false,
  label = "Unggah foto",
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(list: File[]) {
    if (list.length === 0) return;
    const urls = [...value];
    for (const file of list) {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" bukan file gambar`);
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`"${file.name}" melebihi batas 8 MB`);
        continue;
      }
      setBusy(true);
      try {
        const res = await apiUpload(file);
        if (multiple) urls.push(res.url);
        else urls.splice(0, urls.length, res.url);
        onChange([...urls]);
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
        accept="image/*"
        multiple={multiple}
        className="hidden"
        data-testid="photo-input"
        onChange={(e) => {
          const list = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = "";
          void handleFiles(list);
        }}
      />
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url} className="relative">
            <img
              src={url}
              alt={`Foto ${i + 1}`}
              className="size-20 rounded-lg object-cover ring-1 ring-border"
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              aria-label={`Hapus foto ${i + 1}`}
              data-testid={`photo-remove-${i}`}
              className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-500"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {((multiple || value.length === 0) && true) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            data-testid="photo-uploader"
            className="grid h-20 w-28 place-items-center gap-1 rounded-lg border border-dashed border-cyan-400/40 text-xs text-muted-foreground transition-colors hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin text-cyan-300" />
            ) : value.length === 0 ? (
              <>
                <ImageIcon className="size-5" />
                {label}
              </>
            ) : (
              <>
                <Plus className="size-5 text-cyan-300" />
                Tambah
              </>
            )}
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        JPG/PNG/WebP, maksimal 8 MB per foto.
      </p>
    </div>
  );
}
