import { clerkClient } from "@clerk/nextjs/server";
import { deleteImage, getImageById } from "~/server/queries";
import { DeleteButton } from "./delete-button";


const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});
const relativeDivisions: {
  amount: number;
  unit: Intl.RelativeTimeFormatUnit;
}[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

const formatRelativeToNow = (date: Date) => {
  let duration = (date.getTime() - Date.now()) / 1000;
  for (const division of relativeDivisions) {
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return relativeFormatter.format(0, "day");
};

const formatAbsoluteDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);

const getFileExtension = (fileName: string) => {
  const segments = fileName.split(".");
  if (segments.length <= 1) return "IMG";
  return (segments.pop() ?? "img").toUpperCase();
};

type FullPageImageProps = {
  id: number;
  layout?: "default" | "modal";
};

export default async function FullPageImageView({
  id,
  layout = "default",
}: FullPageImageProps) {
  let image;
  try {
    image = await getImageById(id);
  } catch (e) {
    return (
      <div className="flex h-full min-h-screen w-full flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold">Image not found</h1>
      </div>
    );
  }
  const client = await clerkClient();
  const uploaderInfo = await client.users.getUser(image.userId);

  const createdAt = new Date(image.createdAt);
  const uploaderName =
    uploaderInfo.fullName?.trim() ??
    uploaderInfo.username?.trim() ??
    uploaderInfo.emailAddresses?.[0]?.emailAddress ??
    "Unknown artist";
  const uploaderAvatar = uploaderInfo.imageUrl;
  const relativeCreatedLabel = formatRelativeToNow(createdAt);
  const absoluteCreatedLabel = formatAbsoluteDate(createdAt);
  const fileExtension = getFileExtension(image.name);
  const imageHost = (() => {
    try {
      return new URL(image.url).hostname;
    } catch {
      return undefined;
    }
  })();

  const isModal = layout === "modal";

  return (
    <div
      className={`relative flex h-full min-h-screen w-full flex-col items-center bg-black text-white ${isModal ? "overflow-y-auto px-4 py-6 sm:px-6" : "overflow-hidden px-4 py-10 sm:px-8"}`}
    >
      <div className="absolute inset-0">
        <img
          src={image.url}
          alt=""
          className="h-full w-full object-cover opacity-20 blur-3xl"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-zinc-950" />
      </div>

      <div
        className={`relative z-10 flex w-full flex-1 ${
          isModal
            ? "max-w-4xl flex-row flex-wrap items-start justify-center gap-6 py-4 sm:justify-between"
            : "max-w-6xl flex-row flex-wrap items-start justify-center gap-10 py-8 lg:justify-between"
        }`}
      >
        <div
          className={`flex items-center justify-center px-0 ${
            isModal
              ? "min-h-[45vh] flex-[1_1_55%]"
              : "min-h-[60vh] flex-[2_1_60%]"
          }`}
        >
          <div className="group relative flex w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4 shadow-2xl shadow-black/60 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40 opacity-0 transition group-hover:opacity-100" />
            <img
              src={image.url}
              alt={image.name}
              className={`relative z-10 w-full object-contain ${isModal ? "max-h-[70vh]" : "max-h-[80vh]"}`}
            />
          </div>
        </div>

        <aside
          className={`flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/35 px-6 py-8 text-sm backdrop-blur ${
            isModal
              ? "w-full flex-[1_1_18rem] sm:w-auto md:max-h-[75vh] md:overflow-y-auto"
              : "w-full max-w-md flex-[1_1_24rem]"
          }`}
        >
          <div>
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase">
              Artwork
            </p>
            <h1 className="text-2xl font-semibold">{image.name}</h1>
            <p className="text-white/60">{relativeCreatedLabel}</p>
          </div>

          <section className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            {uploaderAvatar ? (
              <img
                src={uploaderAvatar}
                alt={uploaderName}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white/60"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white/70">
                {uploaderName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] text-white/50 uppercase">
                Artist
              </span>
              <span className="text-lg font-semibold">{uploaderName}</span>
              {uploaderInfo.username && (
                <span className="text-white/60">@{uploaderInfo.username}</span>
              )}
            </div>
          </section>

          <dl
            className={`grid gap-4 text-sm ${
              isModal
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs tracking-[0.2em] text-white/50 uppercase">
                Uploaded
              </dt>
              <dd className="text-base font-medium">{absoluteCreatedLabel}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <dt className="text-xs tracking-[0.2em] text-white/50 uppercase">
                File type
              </dt>
              <dd className="text-base font-medium">{fileExtension}</dd>
            </div>
            {imageHost && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs tracking-[0.2em] text-white/50 uppercase">
                  Storage
                </dt>
                <dd className="text-base font-medium">{imageHost}</dd>
              </div>
            )}
          </dl>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-4">
            <p className="text-sm text-white/80">
              Want to see this image outside the gallery view? Download the
              original and share it with your audience.
            </p>
            <a
              href={image.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white"
            >
              Open original
            </a>
          </div>

          <DeleteButton
            id={id}
            onDelete={async (id) => {
              "use server";
              await deleteImage(id);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
