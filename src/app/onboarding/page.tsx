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

  const inputClass = "w-full border border-black rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black";

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md border border-black rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Zusammen</h1>
          <p className="text-gray-500 mt-1">Set up your friend group</p>
        </div>

        <div className="flex rounded-lg border border-black p-1 mb-6">
          <button
            onClick={() => setTab("create")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === "create" ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
          >
            Create Group
          </button>
          <button
            onClick={() => setTab("join")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === "join" ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
          >
            Join Group
          </button>
        </div>

        {error && (
          <div className="mb-4 border border-black text-black rounded-lg px-4 py-3 text-sm bg-gray-100">
            {error}
          </div>
        )}

        {tab === "create" ? (
          <form onSubmit={createGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Group name</label>
              <input type="text" required value={groupName} onChange={(e) => setGroupName(e.target.value)} className={inputClass} placeholder="e.g. The Squad" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
              {loading ? "Creating..." : "Create Group"}
            </button>
          </form>
        ) : (
          <form onSubmit={joinGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Invite code</label>
              <input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className={`${inputClass} font-mono`} placeholder="Paste invite code here" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
              {loading ? "Joining..." : "Join Group"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
