import Link from "next/link";

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

export default function HomePage() {
  return (
    <main className="">
      <div className="flex flex-wrap">
        {[...mockImages, ...mockImages, ...mockImages].map((image, index) => (
          <div key={image.id} className={"w-48"}>
            <img src={image.url} alt={"image"} />
          </div>
        ))}
      </div>
      Hello (gallery in progress)
    </main>
  );
}
