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
 