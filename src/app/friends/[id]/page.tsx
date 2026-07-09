import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import { getDaysUntil, getNextBirthday, getAgeTheyTurn } from "@/lib/birthday";
import FriendDetail from "@/components/FriendDetail";

export default async function FriendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.groupId) redirect("/onboarding");

  const friend = await prisma.friend.findUnique({
    where: { id },
    include: {
      plans: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!friend || friend.groupId !== user.groupId) notFound();

  const dob = new Date(friend.dateOfBirth);
  const next = getNextBirthday(dob);
  const daysUntil = getDaysUntil(next);
  const ageTheyTurn = getAgeTheyTurn(dob, next);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <FriendDetail
          friend={{
            id: friend.id,
            name: friend.name,
            dateOfBirth: friend.dateOfBirth.toISOString(),
            hobby: friend.hobby,
            city: friend.city,
            notes: friend.notes,
            groupId: friend.groupId,
            plans: friend.plans.map((p) => ({
              id: p.id,
              friendId: p.friendId,
              year: p.year,
              title: p.title,
              description: p.description,
              location: p.location,
              plannedDate: p.plannedDate?.toISOString() ?? null,
              status: p.status,
              createdById: p.createdById,
              createdAt: p.createdAt.toISOString(),
              updatedAt: p.updatedAt.toISOString(),
              createdBy: p.createdBy,
            })),
          }}
          daysUntil={daysUntil}
          ageTheyTurn={ageTheyTurn}
          nextBirthday={next.toISOString()}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  );
}
