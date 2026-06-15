const MAX_DIMENSION = 1920;
const AVATAR_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

export async function compressImageFile(
  file: File,
  options?: { maxDim?: number; quality?: number; square?: boolean },
): Promise<File> {
  const maxDim = options?.maxDim ?? MAX_DIMENSION;
  const quality = options?.quality ?? JPEG_QUALITY;

  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (options?.square) {
    const side = Math.min(width, height);
    width = side;
    height = side;
  }

  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  if (options?.square) {
    const offsetX = (bitmap.width - Math.min(bitmap.width, bitmap.height)) / 2;
    const offsetY = (bitmap.height - Math.min(bitmap.width, bitmap.height)) / 2;
    const side = Math.min(bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, offsetX, offsetY, side, side, 0, 0, w, h);
  } else {
    ctx.drawImage(bitmap, 0, 0, w, h);
  }
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

export async function compressForAvatar(file: File) {
  return compressImageFile(file, {
    maxDim: AVATAR_DIMENSION,
    quality: 0.88,
    square: true,
  });
}

export async function compressForThumbnail(file: File) {
  return compressImageFile(file, { maxDim: 1600, quality: 0.82 });
}
