import { useRef, useState } from "react";
import { IconCamera, IconTrash, IconX } from "@/components/ui/icons";

/** Upload control with live preview. `shape`: "circle" (avatar) or "rect" (banner). */
export default function ImageUpload({ label, value, onChange, shape = "rect", initials, ringClassName = "" }) {
  const inputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [removed, setRemoved] = useState(false);

  // Prefer a freshly-picked file's preview; otherwise fall back to the (possibly async-loaded) value prop.
  const preview = localPreview || (removed ? null : value) || null;

  const handleFile = (file) => {
    if (!file) return;
    setRemoved(false);
    onChange(file);
    setLocalPreview(URL.createObjectURL(file));
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange(null);
    setLocalPreview(null);
    setRemoved(true);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (shape === "circle") {
    return (
      <div className="inline-block">
        {label && <p className="mb-2 text-sm font-medium text-ink-dim">{label}</p>}
        <div className="relative inline-flex">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            title="Change photo"
            className={`group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-2xl font-semibold text-white transition dark:from-zinc-600 dark:to-zinc-800 ${ringClassName || "ring-1 ring-black/10 dark:ring-white/10"}`}
          >
            {preview ? (
              <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
            ) : (
              <span>{initials || "?"}</span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
              <IconCamera className="h-6 w-6 text-white" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Change photo"
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-ink text-canvas shadow-md transition hover:opacity-90"
          >
            <IconCamera className="h-3.5 w-3.5" />
          </button>
          {preview && (
            <button
              type="button"
              onClick={clear}
              aria-label="Remove photo"
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-red-500 text-white shadow-md transition hover:bg-red-600"
            >
              <IconX className="h-3 w-3" />
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-ink-dim">{label}</p>}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className="group relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-canvas transition hover:border-ink-ghost"
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
              <IconCamera className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">Change image</span>
            </span>
            <button
              type="button"
              onClick={clear}
              aria-label="Remove image"
              className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white transition hover:bg-red-600"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-ink-ghost">
            <IconCamera className="h-6 w-6" />
            <span className="text-sm font-medium">Click to upload an image</span>
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
