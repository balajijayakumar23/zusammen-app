import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  location: z.string().min(1).max(300).optional(),
  plannedDate: z.string().nullable().optional(),
  status: z.enum(["suggested", "confirmed", "completed"]).optional(),
});

async function assertPlanAccess(userId: string, planId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.groupId) return null;
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { friend: true },
  });
  if (!plan || plan.friend.groupId !== user.groupId) return null;
  return plan;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const plan = await assertPlanAccess(session.user.id, id);
  if (!plan) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(plan);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const plan = await assertPlanAccess(session.user.id, id);
  if (!plan) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.plannedDate !== undefined) {
    data.plannedDate = parsed.data.plannedDate ? new Date(parsed.data.plannedDate) : null;
  }

  const updated = await prisma.plan.update({
    where: { id },
    data,
    include: { friend: true, createdBy: { select: { id: true, name: true } } },
  });

  return Response.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const plan = await assertPlanAccess(session.user.id, id);
  if (!plan) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.plan.delete({ where: { id } });
  return Response.json({ ok: true });
}
