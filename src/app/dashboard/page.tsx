import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getDaysUntil, getNextBirthday, getAgeTheyTurn } from "@/lib/birthday";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { group: true },
  });

  if (!user?.groupId) redirect("/onboarding");

  const friends = await prisma.friend.findMany({
    where: { groupId: user.groupId! },
    include: {
      plans: {
        where: {
          year: new Date().getFullYear(),
          status: "confirmed",
        },
      },
    },
  });

  const now = new Date();
  const year = now.getFullYear();

  const sorted = friends
    .map((f) => {
      const dob = new Date(f.dateOfBirth);
      const next = getNextBirthday(dob);
      const days = getDaysUntil(next);
      const age = getAgeTheyTurn(dob, next);
      const hasConfirmedPlan = f.plans.length > 0;
      return { ...f, daysUntil: days, ageTheyTurn: age, nextBirthday: next, hasConfirmedPlan };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const needsAttention = sorted.filter((f) => f.daysUntil <= 56 && !f.hasConfirmedPlan);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm">{user.group?.name}</p>
          </div>
          <Link
            href="/friends/new"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Add Friend
          </Link>
        </div>

        {needsAttention.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-800 mb-2">Time to plan!</p>
            <ul className="space-y-1">
              {needsAttention.map((f) => (
                <li key={f.id} className="text-amber-700 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>
                    <strong>{f.name}</strong>&apos;s birthday is in {f.daysUntil} day
                    {f.daysUntil !== 1 ? "s" : ""} — no confirmed plan yet
                  </span>
                  <Link href={`/friends/${f.id}`} className="ml-auto text-amber-600 hover:underline text-xs font-medium">
                    Plan now
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {friends.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-lg mb-4">No friends added yet.</p>
            <Link
              href="/friends/new"
              className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
            >
              Add your first friend
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((friend) => {
              const isSoon = friend.daysUntil <= 60;
              const isVeryClose = friend.daysUntil <= 14;
              return (
                <Link key={friend.id} href={`/friends/${friend.id}`} className="block group">
                  <div
                    className={`bg-white rounded-xl border p-5 transition hover:shadow-md ${
                      isVeryClose
                        ? "border-rose-200 ring-1 ring-rose-100"
                        : isSoon
                        ? "border-amber-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h2 className="font-semibold text-slate-900 group-hover:text-violet-700 transition">
                        {friend.name}
                      </h2>
                      {friend.hasConfirmedPlan && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Planned
                        </span>
                      )}
                      {isSoon && !friend.hasConfirmedPlan && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            isVeryClose ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          Plan soon!
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-1">{friend.city}</p>
                    <p className="text-sm text-slate-400 truncate">{friend.hobby}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Turns {friend.ageTheyTurn}</p>
                        <p className="text-sm font-medium text-slate-700">
                          {friend.nextBirthday.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            isVeryClose
                              ? "text-rose-600"
                              : isSoon
                              ? "text-amber-600"
                              : "text-slate-700"
                          }`}
                        >
                          {friend.daysUntil === 0 ? "Today!" : `${friend.daysUntil}d`}
                        </p>
                        <p className="text-xs text-slate-400">until birthday</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* History section */}
        <PastBirthdays groupId={user.groupId!} currentYear={year} />
      </main>
    </div>
  );
}

async function PastBirthdays({ groupId, currentYear }: { groupId: string; currentYear: number }) {
  const completedPlans = await prisma.plan.findMany({
    where: {
      friend: { groupId },
      status: "completed",
    },
    include: { friend: true },
    orderBy: { plannedDate: "desc" },
    take: 5,
  });

  if (completedPlans.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent celebrations</h2>
      <div className="space-y-3">
        {completedPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg shrink-0">
              ✓
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900">{plan.title}</p>
              <p className="text-sm text-slate-500">
                {plan.friend.name} · {plan.location}
                {plan.plannedDate
                  ? ` · ${new Date(plan.plannedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
