import { useEffect, useRef, useState } from "react";
import { IconCamera, IconTrash, IconX } from "@/components/ui/icons";
import Button from "@/components/ui/Button";

/** Upload control with live preview. `shape`: "circle" (avatar) or "rect" (banner).
 *  `allowCapture` additionally offers a live "take a photo" camera option (rect only). */
export default function ImageUpload({ label, value, onChange, shape = "rect", initials, ringClassName = "", allowCapture = false }) {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

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

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => stopStream, []);

  const openCamera = async (e) => {
    e.stopPropagation();
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // videoRef isn't mounted until cameraOpen renders it — attach on next tick.
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 0);
    } catch (err) {
      setCameraError(err?.message || "Could not access the camera. Use upload instead.");
    }
  };

  const closeCamera = (e) => {
    e?.stopPropagation();
    stopStream();
    setCameraOpen(false);
  };

  const capturePhoto = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      handleFile(file);
      closeCamera();
    }, "image/jpeg", 0.9);
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

  if (cameraOpen) {
    return (
      <div>
        {label && <p className="mb-1.5 text-sm font-medium text-ink-dim">{label}</p>}
        <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        </div>
        <div className="mt-2 flex gap-2">
          <Button type="button" variant="primary" size="sm" className="flex-1 justify-center" onClick={capturePhoto}>
            <IconCamera className="h-4 w-4" /> Capture
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={closeCamera}>
            Cancel
          </Button>
        </div>
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
            {allowCapture && <span className="text-xs text-ink-ghost/70">or use your camera below</span>}
          </span>
        )}
      </div>
      {allowCapture && !preview && (
        <button
          type="button"
          onClick={openCamera}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-dim transition hover:border-ink-ghost hover:text-ink"
        >
          <IconCamera className="h-4 w-4" /> Take a photo
        </button>
      )}
      {cameraError && <p className="mt-1.5 text-xs text-red-500">{cameraError}</p>}
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
