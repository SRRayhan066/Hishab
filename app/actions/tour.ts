"use server";

import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";

export async function completeTour() {
  const userId = await getSessionUserId();
  if (!userId) return;

  await db.user.updateMany({
    where: { id: userId, tourCompletedAt: null },
    data: { tourCompletedAt: new Date() },
  });
}
