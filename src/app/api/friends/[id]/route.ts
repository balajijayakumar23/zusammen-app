import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const friendSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  dateOfBirth: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "Invalid date")
    .optional(),
  hobby: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  notes: z.string().max(500).nullable().optional(),
});

async function assertOwnership(userId: string, friendId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.groupId) return null;
  const friend = await prisma.friend.findUnique({ where: { id: friendId } });
  if (!friend || friend.groupId !== user.groupId) return null;
  return friend;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const friend = await assertOwnership(session.user.id, id);
  if (!friend) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(friend);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const friend = await assertOwnership(session.user.id, id);
  if (!friend) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = friendSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.dateOfBirth) data.dateOfBirth = new Date(parsed.data.dateOfBirth);

  const updated = await prisma.friend.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const friend = await assertOwnership(session.user.id, id);
  if (!friend) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.friend.delete({ where: { id } });
  return Response.json({ ok: true });
}
