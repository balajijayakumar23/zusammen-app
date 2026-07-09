import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ inviteCode: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid code" }, { status: 400 });

  const group = await prisma.group.findUnique({
    where: { inviteCode: parsed.data.inviteCode },
  });
  if (!group) return Response.json({ error: "Invalid invite code" }, { status: 404 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { groupId: group.id },
  });

  return Response.json(group);
}
