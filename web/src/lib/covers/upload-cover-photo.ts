import { pickCoverPhotoUrl } from "./cover-photos";

const COVER_BUCKET = "post-images";

export async function uploadCoverPhoto(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storageClient: any,
  opts: { seed: string; cluster?: string; tags?: string[] | null },
) {
  const photoUrl = pickCoverPhotoUrl(opts);
  const res = await fetch(photoUrl, {
    headers: { "User-Agent": "prtfl-cover-upload/1.0" },
  });
  if (!res.ok) throw new Error(`Cover download failed (${res.status})`);

  const bytes = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `covers/${crypto.randomUUID()}.${ext}`;

  const { error } = await storageClient.storage.from(COVER_BUCKET).upload(path, bytes, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return storageClient.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl as string;
}
