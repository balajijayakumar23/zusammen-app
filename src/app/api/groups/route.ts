import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({ name: z.string().min(2).max(60) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const group = await prisma.group.create({ data: { name: parsed.data.name } });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { groupId: group.id },
  });

  return Response.json(group, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { group: true },
  });

  return Response.json(user?.group ?? null);
}
