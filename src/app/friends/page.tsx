import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import { getNextBirthday, getDaysUntil } from "@/lib/birthday";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.groupId) redirect("/onboarding");

  const friends = await prisma.friend.findMany({
    where: { groupId: user.groupId! },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Friends</h1>
          <Link href="/friends/new" className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Add Friend
          </Link>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg mb-4">No friends yet.</p>
            <Link href="/friends/new" className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg transition">
              Add your first friend
            </Link>
          </div>
        ) : (
          <div className="border border-black rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">City</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Hobby</th>
                  <th className="px-4 py-3 font-medium">Birthday</th>
                  <th className="px-4 py-3 font-medium">Days away</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {friends.map((f) => {
                  const dob = new Date(f.dateOfBirth);
                  const next = getNextBirthday(dob);
                  const days = getDaysUntil(next);
                  return (
                    <tr key={f.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-black">{f.name}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{f.city}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell truncate max-w-[180px]">{f.hobby}</td>
                      <td className="px-4 py-3 text-black">
                        {dob.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${days <= 14 ? "text-black" : days <= 60 ? "text-gray-700" : "text-gray-400"}`}>
                          {days === 0 ? "Today!" : `${days}d`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/friends/${f.id}`} className="text-black hover:underline text-xs font-medium">View</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
