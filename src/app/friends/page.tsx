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
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Friends</h1>
          <Link
            href="/friends/new"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Add Friend
          </Link>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-lg mb-4">No friends yet.</p>
            <Link
              href="/friends/new"
              className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
            >
              Add your first friend
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">City</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Hobby</th>
                  <th className="px-4 py-3 font-medium">Birthday</th>
                  <th className="px-4 py-3 font-medium">Days away</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {friends.map((f) => {
                  const dob = new Date(f.dateOfBirth);
                  const next = getNextBirthday(dob);
                  const days = getDaysUntil(next);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">{f.name}</td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{f.city}</td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell truncate max-w-[180px]">
                        {f.hobby}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {dob.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            days <= 14
                              ? "text-rose-600"
                              : days <= 60
                              ? "text-amber-600"
                              : "text-slate-600"
                          }`}
                        >
                          {days === 0 ? "Today!" : `${days}d`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/friends/${f.id}`}
                          className="text-violet-600 hover:underline text-xs font-medium"
                        >
                          View
                        </Link>
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
