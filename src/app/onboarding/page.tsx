"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create group"); return; }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function joinGroup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid invite code"); return; }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-violet-700">Zusammen</h1>
          <p className="text-slate-500 mt-1">Set up your friend group</p>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
          <button
            onClick={() => setTab("create")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === "create" ? "bg-white shadow text-violet-700" : "text-slate-500 hover:text-slate-700"}`}
          >
            Create Group
          </button>
          <button
            onClick={() => setTab("join")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === "join" ? "bg-white shadow text-violet-700" : "text-slate-500 hover:text-slate-700"}`}
          >
            Join Group
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {tab === "create" ? (
          <form onSubmit={createGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Group name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="e.g. The Squad"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </form>
        ) : (
          <form onSubmit={joinGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invite code</label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Paste invite code here"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Group"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
