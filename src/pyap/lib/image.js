// ============================================================================
// Client-side image compression
// Bago mag-upload sa Supabase Storage, pinaliliit ang mga litrato sa browser
// para maliit lang ang file size — friendly sa free-tier storage at egress.
// Walang server/Edge Function na kailangan, built-in canvas lang.
// ============================================================================

// Pinakamalaking original file na tatanggapin bago i-compress (MB).
export const MAX_INPUT_MB = 15;

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Minsan hindi supported (hal. HEIC sa Chrome) — subukan ang <img>.
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    img.src = url;
  });
}

function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
}

// WebP muna (pinakamaliit). Kung hindi supported ng browser ang WebP encoding,
// ang toBlob ay bumabalik sa PNG — kaya i-check ang blob.type at mag-JPEG.
async function encode(canvas, quality) {
  const webp = await toBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") return { blob: webp, mime: "image/webp", ext: "webp" };
  const jpeg = await toBlob(canvas, "image/jpeg", quality);
  if (jpeg) return { blob: jpeg, mime: "image/jpeg", ext: "jpg" };
  throw new Error("Could not compress this image.");
}

function baseName(name) {
  const base = (name || "photo")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 60);
  return base || "photo";
}

export function isSupportedImage(file) {
  // gif: animated sa original, pero first frame ang kukunin ng canvas
  // (ok lang para sa photo album — mas maliit ang file).
  return !!file && /^image\/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(file.type || "");
}

export function isHeic(file) {
  return /^image\/hei[cf]$/i.test(file?.type || "");
}

// Snapshots: buong litrato, i-resize lang kung mas malaki sa maxSize.
export async function compressImage(file, { maxSize = 1600, quality = 0.8 } = {}) {
  const bitmap = await decodeImage(file);
  const w = bitmap.width || bitmap.naturalWidth || 0;
  const h = bitmap.height || bitmap.naturalHeight || 0;
  if (!w || !h) throw new Error("Could not read this image.");
  const scale = Math.min(1, maxSize / Math.max(w, h));
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));
  const canvas = makeCanvas(tw, th);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, tw, th);
  if (typeof bitmap.close === "function") bitmap.close();
  const { blob, mime, ext } = await encode(canvas, quality);
  return {
    blob,
    mime,
    ext,
    name: `${baseName(file.name)}.${ext}`,
    originalSize: file.size,
    width: tw,
    height: th,
  };
}

// Avatars: i-crop sa gitnang square para pantay sa bilog na avatar display.
export async function compressToSquare(file, { size = 512, quality = 0.82 } = {}) {
  const bitmap = await decodeImage(file);
  const w = bitmap.width || bitmap.naturalWidth || 0;
  const h = bitmap.height || bitmap.naturalHeight || 0;
  if (!w || !h) throw new Error("Could not read this image.");
  const side = Math.min(w, h);
  const sx = Math.round((w - side) / 2);
  const sy = Math.round((h - side) / 2);
  const canvas = makeCanvas(size, size);
  canvas.getContext("2d").drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  if (typeof bitmap.close === "function") bitmap.close();
  const { blob, mime, ext } = await encode(canvas, quality);
  return { blob, mime, ext, originalSize: file.size };
}
