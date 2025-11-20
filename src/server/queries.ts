import "server-only";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { image as imageTable } from "~/server/db/schema";
import { revalidatePath } from "next/cache";

import { log } from "console";

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

export async function deleteImage(id: number) {
  const user = await auth();
  if (!user.userId) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(imageTable)
    .where(and(eq(imageTable.id, id), eq(imageTable.userId, user.userId)));

  revalidatePath("/");
}
