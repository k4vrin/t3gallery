import "server-only";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";

export async function getMyImages() {

  const user = await auth();
  if (!user.userId) {
    throw new Error("Unauthorized");
  }
  
  return await db.query.image.findMany({
    where: (image, { eq }) => eq(image.userId, user.userId),
    orderBy: (image, { desc }) => desc(image.createdAt),
  });
}



export async function getImageById(id: number) {
  const user = await auth();
  if (!user.userId) {
    throw new Error("Unauthorized");
  }
  const image = await db.query.image.findFirst({
    where: (image, { eq }) => eq(image.id, id),
  });

  if (!image) {
    throw new Error("Image not found");
  }

  if (image.userId !== user.userId) {
    throw new Error("Unauthorized");
  }

  return image;
}