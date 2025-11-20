"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { useUploadThing } from "~/utils/uploadthing";
import { toast } from "sonner";
import { func } from "fast-check";
import { usePostHog } from "posthog-js/react";

type UploadVisualState =
  | "idle"
  | "preparing"
  | "uploading"
  | "success"
  | "error";

const DEFAULT_MESSAGE = "Upload new art";

const palette: Record<
  UploadVisualState,
  { glow: string; dot: string; progress: string; headline: string }
> = {
  idle: {
    glow: "from-indigo-500 via-purple-500 to-pink-500",
    dot: "bg-indigo-300",
    progress: "bg-indigo-300",
    headline: "Ready to upload",
  },
  preparing: {
    glow: "from-sky-500 via-cyan-400 to-emerald-400",
    dot: "bg-sky-300",
    progress: "bg-cyan-300",
    headline: "Staging files",
  },
  uploading: {
    glow: "from-amber-300 via-orange-400 to-yellow-300",
    dot: "bg-amber-200",
    progress: "bg-amber-300",
    headline: "Sending to gallery",
  },
  success: {
    glow: "from-emerald-400 via-lime-300 to-emerald-500",
    dot: "bg-emerald-300",
    progress: "bg-emerald-300",
    headline: "Upload complete",
  },
  error: {
    glow: "from-rose-500 via-red-500 to-amber-500",
    dot: "bg-rose-300",
    progress: "bg-rose-400",
    headline: "Upload error",
  },
};

type VisualState = { value: UploadVisualState; message: string };

const truncate = (value: string, max = 32) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

const formatCountLabel = (count: number) => {
  const safeCount = Math.max(1, count);
  return `${safeCount} image${safeCount === 1 ? "" : "s"}`;
};

const filterToImages = (files: File[]) =>
  files.filter((file) => file.type.startsWith("image/"));

function LoadingSpinner() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={"white"}
    >
      <path
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity=".25"
      />
      <path
        d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
        className="spinner_ajPY"
      />
    </svg>
  );
}

function maleUploadToast() {
  return toast(
    <div className={"flex gap-2 text-white items-center"}>
      <LoadingSpinner/>
      <span className={"text-lg"}>Uploading...</span>
    </div>,
    {
      duration: 100000,
      id: "upload-begin",
    }
  )
}

export default function SimpleUploadButton() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const resetTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const fileCountRef = React.useRef(0);
  const posthog = usePostHog()

  const [visualState, setVisualState] = React.useState<VisualState>({
    value: "idle",
    message: DEFAULT_MESSAGE,
  });
  const [progress, setProgress] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const resetToIdle = React.useCallback(() => {
    setVisualState({ value: "idle", message: DEFAULT_MESSAGE });
    setProgress(0);
    fileCountRef.current = 0;
  }, []);

  const scheduleReset = React.useCallback(
    (delay = 2500) => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        resetToIdle();
        resetTimerRef.current = null;
      }, delay);
    },
    [resetToIdle],
  );

  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const { startUpload, routeConfig } = useUploadThing("imageUploader", {
    onUploadBegin: () => {
      posthog.capture("upload_begin")
      maleUploadToast()
      const label = formatCountLabel(fileCountRef.current);
      setVisualState({
        value: "uploading",
        message: `Uploading ${label} • starting...`,
      });
      setProgress((prev) => Math.max(prev, 12));
    },
    onUploadProgress: (value) => {
      const label = formatCountLabel(fileCountRef.current);
      setProgress(value);
      setVisualState({
        value: "uploading",
        message: `Uploading ${label} • ${Math.min(99, Math.round(value))}%`,
      });
    },
    onClientUploadComplete: (result) => {
      toast.dismiss("upload-begin");
      toast("Upload complete!");
      const uploadedCount = result?.length ?? fileCountRef.current;
      const label = formatCountLabel(uploadedCount);
      setVisualState({
        value: "success",
        message: `Uploaded ${label}. Refreshing art…`,
      });
      setProgress(100);
      scheduleReset();
      router.refresh();
    },
    onUploadError: (error) => {
      console.error(error);
      setVisualState({
        value: "error",
        message: error?.message ?? "Upload failed. Try again.",
      });
      setProgress(0);
      scheduleReset(3600);
    },
  });

  const maxFileCount = routeConfig?.image?.maxFileCount ?? 1;
  const maxFileSize = routeConfig?.image?.maxFileSize;
  const allowMultiple = maxFileCount > 1;

  const processFiles = React.useCallback(
    async (files: File[]) => {
      const onlyImages = filterToImages(files);
      if (!onlyImages.length) return;

      const normalizedFiles = allowMultiple
        ? onlyImages.slice(0, maxFileCount)
        : [onlyImages[0]];

      fileCountRef.current = normalizedFiles.length;
      const descriptor =
        normalizedFiles.length === 1
          ? `“${truncate(normalizedFiles[0]?.name ?? "image")}”`
          : `${normalizedFiles.length} images`;

      setVisualState({
        value: "preparing",
        message: `Preparing ${descriptor}`,
      });
      setProgress(8);

      try {
        await startUpload(normalizedFiles);
      } catch (error) {
        console.error(error);
        setVisualState({
          value: "error",
          message: "Upload failed. Please try again.",
        });
        setProgress(0);
        scheduleReset(3600);
      }
    },
    [allowMultiple, maxFileCount, scheduleReset, startUpload],
  );

  const onInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    await processFiles(files);
    // reset so the same file can be re-selected immediately
    event.target.value = "";
  };

  const onDrop = async (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    await processFiles(files);
  };

  const {
    glow,
    dot,
    progress: progressColor,
    headline,
  } = palette[visualState.value];

  const helperDetails = [
    allowMultiple ? `Up to ${maxFileCount} images` : "Single image",
    maxFileSize ? `${maxFileSize} each` : undefined,
    "PNG · JPG · GIF",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="group relative inline-flex w-full max-w-xs md:max-w-sm">
      <span
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${glow} opacity-70 blur-xl transition-all duration-700 ${isDragging ? "scale-105 opacity-100" : "group-hover:opacity-90"}`}
        style={{ animation: "gradient-shift 9s ease-in-out infinite" }}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          if (!isDragging) setIsDragging(true);
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!isDragging) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setIsDragging(false);
        }}
        onDrop={onDrop}
        className={`relative z-10 flex w-full flex-col gap-3 rounded-2xl border border-white/15 bg-zinc-950/80 px-6 py-5 text-left shadow-2xl shadow-black/40 backdrop-blur transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${isDragging ? "ring-2 ring-emerald-400/80" : ""}`}
        aria-live="polite"
        aria-busy={
          visualState.value === "preparing" || visualState.value === "uploading"
        }
      >
        <div className="flex items-center gap-3">
          <span
            className={`${dot} h-3.5 w-3.5 rounded-full shadow shadow-black/60 transition duration-300 ${visualState.value === "uploading" ? "animate-pulse" : ""}`}
          />
          <div>
            <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
              {headline}
            </p>
            <p className="text-base font-semibold text-white">
              {visualState.message}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`${progressColor} h-full rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/60">{helperDetails}</p>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        className="sr-only"
        onChange={onInputChange}
      />
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            transform: translate3d(-8%, 0, 0);
          }
          50% {
            transform: translate3d(8%, 0, 0);
          }
          100% {
            transform: translate3d(-8%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
