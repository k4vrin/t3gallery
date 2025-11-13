import { db } from "~/server/db";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function HomePage() {


  return (
    <main className="">
      <SignedOut>
        <div className="h-full w-full text-2x1 text-center">Please sign in above</div>
      </SignedOut>
      <SignedIn>
        <Images />
      </SignedIn>
    </main>
  );
}


async function Images() {
  const images = await db.query.image.findMany({
    orderBy: (model, { desc }) => desc(model.createdAt),
  });

  return (
    <div className="flex flex-wrap">
      {images.map((image) => (
        <div key={image.id} className={"m-2 flex w-48 flex-col"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={"image"} />
          <div>Name: {image.name}</div>
        </div>
      ))}
    </div>
  )
}

