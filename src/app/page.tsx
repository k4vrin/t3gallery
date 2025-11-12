import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const images = await db.query.images.findMany({
    orderBy: (model, { desc }) => desc(model.createdAt),
  });
  console.log("images", images);

  return (
    <main className="">
      <div className="flex flex-wrap">
        {[...images, ...images, ...images].map((image, index) => (
          <div key={index} className={"m-2 flex w-48 flex-col"}>
            <img src={image.url} alt={"image"} />
            <div>Name: {image.name}</div>
          </div>
        ))}
      </div>
      Hello (gallery in progress)
    </main>
  );
}
