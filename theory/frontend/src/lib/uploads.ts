// Multipart upload helper (api.ts only speaks JSON). Posts to the relative /api
// path so the Vite proxy carries it in dev, single origin in prod.

export interface UploadedFile {
  url: string;
  name: string;
  original_name?: string;
  content_type?: string;
}

export class UploadError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

export async function apiUpload(file: File): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body: form });
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const detail =
      body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : "Upload gagal";
    throw new UploadError(res.status, detail);
  }
  return (await res.json()) as UploadedFile;
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
