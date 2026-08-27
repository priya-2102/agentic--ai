import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import type { Plan } from "@/types/plans";

const getCurrentPlan = async (): Promise<Plan> => {
  const { has } = await auth();
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "starter" })) return "starter";
  return "free";
};

export const checkUser = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;

    const currentPlan = await getCurrentPlan();

    const existing = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (existing) {
      if (existing.credits !== 100 || existing.plan !== currentPlan) {
        await db.user.update({
          where: { clerkId: user.id },
          data: {
            plan: currentPlan,
            credits: 100,
          },
        });
        return await db.user.findUnique({ where: { clerkId: user.id } });
      }

      return existing;
    }

    // New user — create with 100 credits
    return await db.user.create({
      data: {
        clerkId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl ?? "",
        credits: 100,
        plan: currentPlan,
      },
    });
  } catch (error: any) {
    if (
      error &&
      (error.digest === "DYNAMIC_SERVER_USAGE" ||
        (error.message && error.message.includes("Dynamic server usage")))
    ) {
      throw error;
    }
    console.error("checkUser error:", error);
    return null;
  }
};
