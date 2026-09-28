import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { TourAutoStart } from "./TourAutoStart";

export async function TourStatus() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { tourCompletedAt: true },
  });

  return user && !user.tourCompletedAt ? <TourAutoStart /> : null;
}
