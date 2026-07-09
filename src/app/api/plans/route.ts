import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const planSchema = z.object({
  friendId: z.string(),
  year: z.number().int().min(2000).max(2100),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  location: z.string().min(1).max(300),
  plannedDate: z.string().optional().nullable(),
  status: z.enum(["suggested", "confirmed", "completed"]).default("suggested"),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const friendId = url.searchParams.get("friendId");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.groupId) return Response.json({ error: "No group" }, { status: 400 });

  const where = friendId
    ? { friendId, friend: { groupId: user.groupId } }
    : { friend: { groupId: user.groupId } };

  const plans = await prisma.plan.findMany({
    where,
    include: { friend: true, createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(plans);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.groupId) return Response.json({ error: "No group" }, { status: 400 });

  const friend = await prisma.friend.findUnique({ where: { id: parsed.data.friendId } });
  if (!friend || friend.groupId !== user.groupId) {
    return Response.json({ error: "Friend not found" }, { status: 404 });
  }

  const plan = await prisma.plan.create({
    data: {
      ...parsed.data,
      plannedDate: parsed.data.plannedDate ? new Date(parsed.data.plannedDate) : null,
      createdById: session.user.id,
    },
    include: { friend: true, createdBy: { select: { id: true, name: true } } },
  });

  return Response.json(plan, { status: 201 });
}
