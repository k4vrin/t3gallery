import { db } from "~/server/db";

export const dynamic = "force-dynamic";

const mockUrls = [
  "https://cqo0kqilkx.ufs.sh/f/XAGxK3znhX4IFR1OmPuxVJipjedHnNR3oWU0KuTa1I2fEMhm",
  "https://cqo0kqilkx.ufs.sh/f/XAGxK3znhX4Ihf2TQ5SaB9Xxce5ZJ82AIrMVHojDuWQEmCSw",
  "https://cqo0kqilkx.ufs.sh/f/XAGxK3znhX4IFWwaAOxVJipjedHnNR3oWU0KuTa1I2fEMhmF",
  "https://cqo0kqilkx.ufs.sh/f/XAGxK3znhX4IXP5SwKznhX4ItwKoQJakTv5HzCZgbyUpARfS",
];

const mockImages = mockUrls.map((url, index) => ({
  id: index + 1,
  url,
}));

export default async function HomePage() {
  const posts = await db.query.posts.findMany();
  console.log("posts", posts);

  return (
    <main className="">
      <div className="flex flex-wrap">
        {posts.map((post) => (
          <div key={post.id} className="p-2 border">{post.name}</div>
        ))}
        {[...mockImages, ...mockImages, ...mockImages].map((image, index) => (
          <div key={index} className={"w-48"}>
            <img src={image.url} alt={"image"} />
          </div>
        ))}
      </div>
      Hello (gallery in progress)
    </main>
  );
}
