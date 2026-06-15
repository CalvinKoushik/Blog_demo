import { getApiUrl } from "./api";

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

export async function uploadImage(
  token: string,
  file: File,
  folder: "avatars" | "thumbnails" | "posts",
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: unknown = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as UploadResult);
        return;
      }
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message: unknown }).message)
          : "Upload failed";
      reject(new Error(message));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.open("POST", getApiUrl("/uploads/image"));
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(form);
  });
}
