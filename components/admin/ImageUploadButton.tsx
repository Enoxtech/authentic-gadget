"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface ImageUploadButtonProps {
  folder: "products" | "banners";
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUploadButton({
  folder,
  onUploaded,
  label = "Upload image",
  className = "",
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      onUploaded(data.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : label}
      </button>
    </>
  );
}
