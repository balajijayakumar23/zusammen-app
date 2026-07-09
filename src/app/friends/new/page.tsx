import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import FriendForm from "@/components/FriendForm";

export default async function NewFriendPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.groupId) redirect("/onboarding");

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Add Friend</h1>
        <FriendForm />
      </main>
    </div>
  );
}
