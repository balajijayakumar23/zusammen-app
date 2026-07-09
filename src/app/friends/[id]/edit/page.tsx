import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import FriendForm from "@/components/FriendForm";

export default async function EditFriendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.groupId) redirect("/onboarding");

  const friend = await prisma.friend.findUnique({ where: { id } });
  if (!friend || friend.groupId !== user.groupId) notFound();

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit {friend.name}</h1>
        <FriendForm
          initial={{
            id: friend.id,
            name: friend.name,
            dateOfBirth: friend.dateOfBirth.toISOString(),
            hobby: friend.hobby,
            city: friend.city,
            notes: friend.notes,
          }}
        />
      </main>
    </div>
  );
}
