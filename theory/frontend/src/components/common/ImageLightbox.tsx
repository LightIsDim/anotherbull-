import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface LightboxState {
  url: string;
  caption?: string;
}

interface ImageLightboxProps {
  state: LightboxState | null;
  onClose: () => void;
}

// Full-size photo viewer: click backdrop / close to dismiss, link out for original size.
export default function ImageLightbox({ state, onClose }: ImageLightboxProps) {
  return (
    <Dialog open={state !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-full gap-3 p-3 sm:max-w-4xl">
        {state && (
          <div className="space-y-3">
            <img
              src={state.url}
              alt={state.caption ?? "Foto dokumentasi"}
              data-testid="lightbox-image"
              className="max-h-[72svh] w-full rounded-lg bg-black/40 object-contain"
            />
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="truncate text-sm text-muted-foreground">
                {state.caption ?? "\u00a0"}
              </p>
              <a
                href={state.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-mono text-xs uppercase tracking-[0.15em] text-cyan-300 hover:underline"
                data-testid="lightbox-download"
              >
                Buka ukuran penuh
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
