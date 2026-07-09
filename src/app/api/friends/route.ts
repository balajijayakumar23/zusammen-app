import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const friendSchema = z.object({
  name: z.string().min(1).max(100),
  dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  hobby: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  notes: z.string().max(500).optional(),
});

async function getUserGroup(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.groupId ?? null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const groupId = await getUserGroup(session.user.id);
  if (!groupId) return Response.json({ error: "No group" }, { status: 400 });

  const friends = await prisma.friend.findMany({
    where: { groupId },
    orderBy: { name: "asc" },
  });

  return Response.json(friends);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const groupId = await getUserGroup(session.user.id);
  if (!groupId) return Response.json({ error: "No group" }, { status: 400 });

  const body = await req.json();
  const parsed = friendSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const friend = await prisma.friend.create({
    data: {
      ...parsed.data,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      groupId,
      notes: parsed.data.notes ?? null,
    },
  });

  return Response.json(friend, { status: 201 });
}
