import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import CopyInviteCode from "@/components/CopyInviteCode";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      group: {
        include: {
          users: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!user?.groupId || !user.group) redirect("/onboarding");

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Group Settings</h1>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">{user.group.name}</h2>

          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 mb-2">Invite link</p>
            <p className="text-xs text-slate-500 mb-2">
              Share this code with friends so they can join your group.
            </p>
            <CopyInviteCode code={user.group.inviteCode} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              Members ({user.group.users.length})
            </p>
            <ul className="space-y-2">
              {user.group.users.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm shrink-0">
                    {(member.name || member.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {member.name || "—"}
                      {member.id === session.user?.id && (
                        <span className="ml-2 text-xs text-slate-400">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-2">v2 Roadmap</h2>
          <ul className="text-sm text-slate-500 space-y-1.5">
            <li>• Email notifications when a birthday is 8 weeks away</li>
            <li>• Google Places integration for real venue search</li>
            <li>• Native mobile app (React Native sharing this API)</li>
            <li>• Postgres migration for production deployments</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
