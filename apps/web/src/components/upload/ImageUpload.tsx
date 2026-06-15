"use client";

import { useCallback, useState } from "react";
import { Upload, X, Loader2, ImageIcon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/uploads-api";
import { compressForAvatar, compressForThumbnail } from "@/lib/compress-image";
import { toast } from "sonner";

type ImageUploadProps = {
  token: string;
  folder: "avatars" | "thumbnails" | "posts";
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  aspect?: "square" | "video";
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function ImageUpload({
  token,
  folder,
  value,
  onChange,
  label = "Upload image",
  className,
  aspect = "video",
}: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      setProgress(0);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setLastFile(file);
      try {
        const compressed =
          folder === "avatars"
            ? await compressForAvatar(file)
            : await compressForThumbnail(file);
        const result = await uploadImage(token, compressed, folder, setProgress);
        onChange(result.url);
        toast.success("Image uploaded");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setError(msg);
        toast.error(msg);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [token, folder, onChange],
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Image must be 8MB or smaller before compression");
        return;
      }
      await upload(file);
    },
    [upload],
  );

  const retry = () => {
    if (lastFile) void upload(lastFile);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const displayUrl = preview || value;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}
      {displayUrl ? (
        <div className="space-y-2">
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border border-border/50 bg-muted/30 transition-shadow",
              aspect === "square"
                ? "aspect-square w-full max-w-[220px] mx-auto sm:mx-0"
                : "aspect-video w-full",
            )}
          >
            <img
              src={displayUrl}
              alt=""
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                uploading && "opacity-60",
              )}
            />
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 flex items-center justify-center shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => {
                  onChange("");
                  setPreview(null);
                  setLastFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <span>{error}</span>
              <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={retry}>
                <RotateCcw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          )}
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 sm:p-8 cursor-pointer transition-all duration-200",
            dragging
              ? "border-primary bg-primary/5 scale-[1.01] shadow-inner"
              : "border-border/60 hover:border-primary/50 hover:bg-muted/30",
            aspect === "square"
              ? "aspect-square w-full max-w-[280px] mx-auto sm:mx-0"
              : "min-h-[140px] w-full",
            uploading && "pointer-events-none opacity-70",
          )}
        >
          <input
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading {progress}%</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center px-2">
                <p className="text-sm font-medium">Drop image here or tap to browse</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-compressed · JPEG, PNG, WebP
                </p>
              </div>
              <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
            </>
          )}
        </label>
      )}
    </div>
  );
}
