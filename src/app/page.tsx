import { SignedIn, SignedOut } from "@clerk/nextjs";
import { getMyImages } from "~/server/queries";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="">
      <SignedOut>
        <div className="text-2x1 h-full w-full text-center">
          Please sign in above
        </div>
      </SignedOut>
      <SignedIn>
        <Images />
      </SignedIn>
    </main>
  );
}

async function Images() {
  const images = await getMyImages();

  return (
    <div className="flex flex-wrap justify-center">
      {images.map((image) => (
        <div key={image.id} className={"m-2 flex w-48 flex-col"}>
          {/* Image container must be positioned when using `fill` */}
          <div className="relative h-48 w-48">
            <Image
              src={image.url}
              alt={image.name ?? "image"}
              fill
              style={{ objectFit: "contain" }}
              // Optionally you can add `priority` for important images
            />
          </div>
          <div className="mt-2 truncate text-sm">Name: {image.name}</div>
        </div>
      ))}
    </div>
  );
}
