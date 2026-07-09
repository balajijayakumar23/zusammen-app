"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ActivitySuggestion, PlanStatus } from "@/lib/types";

interface Plan {
  id: string;
  friendId: string;
  year: number;
  title: string;
  description: string;
  location: string;
  plannedDate: string | null;
  status: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string | null };
}

interface FriendData {
  id: string;
  name: string;
  dateOfBirth: string;
  hobby: string;
  city: string;
  notes: string | null;
  groupId: string;
  plans: Plan[];
}

interface Props {
  friend: FriendData;
  daysUntil: number;
  ageTheyTurn: number;
  nextBirthday: string;
  currentUserId: string;
}

export default function FriendDetail({ friend, daysUntil, ageTheyTurn, nextBirthday, currentUserId }: Props) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [plans, setPlans] = useState<Plan[]>(friend.plans);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [creatingFromSuggestion, setCreatingFromSuggestion] = useState<ActivitySuggestion | null>(null);
  const [unlockId, setUnlockId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState<"plans" | "suggest" | "history">("plans");

  const dob = new Date(friend.dateOfBirth);
  const isSoon = daysUntil <= 60;

  async function loadSuggestions() {
    setSuggestError("");
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId: friend.id }),
      });
      const data = await res.json();
      if (!res.ok) { setSuggestError(data.error || "Failed to generate suggestions"); return; }
      setSuggestions(data);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function deleteFriend() {
    if (!confirm(`Delete ${friend.name}? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/friends/${friend.id}`, { method: "DELETE" });
    router.push("/friends");
    router.refresh();
  }

  async function updatePlanStatus(planId: string, status: PlanStatus) {
    const res = await fetch(`/api/plans/${planId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
    }
  }

  async function deletePlan(planId: string) {
    if (!confirm("Delete this plan?")) return;
    const res = await fetch(`/api/plans/${planId}`, { method: "DELETE" });
    if (res.ok) setPlans((prev) => prev.filter((p) => p.id !== planId));
  }

  const currentYear = new Date().getFullYear();
  const activePlans = plans.filter((p) => p.status !== "completed");
  const history = plans.filter((p) => p.status === "completed");

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{friend.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {friend.city} · {friend.hobby}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/friends/${friend.id}/edit`}
            className="text-sm border border-slate-200 hover:border-slate-300 text-slate-600 font-medium px-3 py-1.5 rounded-lg transition"
          >
            Edit
          </Link>
          <button
            onClick={deleteFriend}
            disabled={deleting}
            className="text-sm border border-red-200 hover:border-red-300 text-red-600 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Birthday card */}
      <div
        className={`rounded-xl p-5 mb-6 flex flex-wrap gap-6 justify-between ${
          isSoon ? "bg-amber-50 border border-amber-200" : "bg-slate-50 border border-slate-200"
        }`}
      >
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Date of birth</p>
          <p className="text-base font-semibold text-slate-800">
            {dob.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Next birthday</p>
          <p className="text-base font-semibold text-slate-800">
            {new Date(nextBirthday).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Turns</p>
          <p className="text-base font-semibold text-slate-800">{ageTheyTurn}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Days away</p>
          <p
            className={`text-2xl font-bold ${
              daysUntil <= 14 ? "text-rose-600" : daysUntil <= 60 ? "text-amber-600" : "text-slate-800"
            }`}
          >
            {daysUntil === 0 ? "Today!" : `${daysUntil}`}
          </p>
        </div>
        {friend.notes && (
          <div className="w-full border-t border-slate-200 pt-3 mt-1">
            <p className="text-xs text-slate-500 font-medium mb-1">Notes</p>
            <p className="text-sm text-slate-700">{friend.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6 w-fit">
        {(["plans", "suggest", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition capitalize ${
              tab === t ? "bg-white shadow text-violet-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "suggest" ? "AI Suggestions" : t}
            {t === "plans" && activePlans.length > 0 && (
              <span className="ml-1.5 bg-violet-100 text-violet-700 text-xs px-1.5 py-0.5 rounded-full">
                {activePlans.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Plans tab */}
      {tab === "plans" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Active Plans</h2>
            <button
              onClick={() => {
                setCreatingFromSuggestion({ title: "", description: "", venue: "", whyItFits: "", seasonalNote: "" });
                setEditingPlan(null);
              }}
              className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium px-3 py-1.5 rounded-lg transition"
            >
              + New Plan
            </button>
          </div>

          {(creatingFromSuggestion || editingPlan) && (
            <PlanEditor
              friendId={friend.id}
              year={currentYear}
              initial={editingPlan}
              suggestion={creatingFromSuggestion}
              onSave={(plan) => {
                setPlans((prev) =>
                  editingPlan ? prev.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...prev]
                );
                setEditingPlan(null);
                setCreatingFromSuggestion(null);
              }}
              onCancel={() => {
                setEditingPlan(null);
                setCreatingFromSuggestion(null);
              }}
            />
          )}

          {activePlans.length === 0 && !creatingFromSuggestion ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p>No active plans yet.</p>
              <button
                onClick={() => setTab("suggest")}
                className="mt-2 text-violet-600 hover:underline text-sm"
              >
                Get AI suggestions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  unlocked={unlockId === plan.id}
                  onUnlock={() => setUnlockId(plan.id)}
                  onLock={() => setUnlockId(null)}
                  onEdit={() => {
                    setEditingPlan(plan);
                    setCreatingFromSuggestion(null);
                  }}
                  onDelete={() => deletePlan(plan.id)}
                  onStatusChange={(s) => updatePlanStatus(plan.id, s)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions tab */}
      {tab === "suggest" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Activity Ideas for {friend.name}</h2>
            <button
              onClick={loadSuggestions}
              disabled={loadingSuggestions}
              className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {loadingSuggestions ? "Generating..." : suggestions.length ? "Regenerate" : "Generate Ideas"}
            </button>
          </div>

          {suggestError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {suggestError}
            </div>
          )}

          {loadingSuggestions && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {!loadingSuggestions && suggestions.length === 0 && !suggestError && (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p>Click &ldquo;Generate Ideas&rdquo; to get AI-powered suggestions</p>
              <p className="text-xs mt-1">Based on {friend.name}&apos;s hobby ({friend.hobby}) and location ({friend.city})</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
                  <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{s.description}</p>
                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <p><span className="font-medium text-slate-700">Venue:</span> {s.venue}</p>
                    <p><span className="font-medium text-slate-700">Why it fits:</span> {s.whyItFits}</p>
                    <p><span className="font-medium text-slate-700">Seasonal note:</span> {s.seasonalNote}</p>
                  </div>
                  <button
                    onClick={() => {
                      setCreatingFromSuggestion(s);
                      setTab("plans");
                    }}
                    className="w-full text-center text-sm bg-violet-50 hover:bg-violet-100 text-violet-700 font-medium py-2 rounded-lg transition"
                  >
                    Use this idea
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div>
          <h2 className="font-semibold text-slate-800 mb-4">Past Celebrations</h2>
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No completed plans yet.
            </div>
          ) : (
            <div className="relative border-l-2 border-violet-200 ml-4 space-y-6 pl-6">
              {history.map((plan) => (
                <div key={plan.id} className="relative">
                  <div className="absolute -left-8 top-1 w-3.5 h-3.5 rounded-full bg-violet-400 border-2 border-white" />
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{plan.title}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                        {plan.year}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{plan.description}</p>
                    <p className="text-xs text-slate-500">
                      {plan.location}
                      {plan.plannedDate
                        ? ` · ${new Date(plan.plannedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Plan card component
function PlanCard({
  plan,
  unlocked,
  onUnlock,
  onLock,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  plan: Plan;
  unlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: PlanStatus) => void;
}) {
  const isConfirmed = plan.status === "confirmed";

  const statusColors: Record<string, string> = {
    suggested: "bg-blue-100 text-blue-700",
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-slate-100 text-slate-600",
  };

  return (
    <div className={`bg-white rounded-xl border p-5 ${isConfirmed && !unlocked ? "border-green-200" : "border-slate-200"}`}>
      <div className="flex items-start gap-3 justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isConfirmed && !unlocked && <span className="text-base" title="Plan locked">🔒</span>}
            <h3 className="font-semibold text-slate-900">{plan.title}</h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[plan.status] || ""}`}>
            {plan.status}
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          {isConfirmed && !unlocked ? (
            <button onClick={onUnlock} className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-2 py-1 rounded-md transition">
              Unlock to edit
            </button>
          ) : (
            <>
              <button onClick={onEdit} className="text-xs text-violet-600 hover:underline">Edit</button>
              <button onClick={onDelete} className="text-xs text-red-500 hover:underline">Delete</button>
              {isConfirmed && <button onClick={onLock} className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-2 py-1 rounded-md">Lock</button>}
            </>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-2">{plan.description}</p>
      <p className="text-xs text-slate-500 mb-3">
        <span className="font-medium">Location:</span> {plan.location}
        {plan.plannedDate && (
          <> · {new Date(plan.plannedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
        )}
      </p>

      {(!isConfirmed || unlocked) && (
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          {plan.status === "suggested" && (
            <button
              onClick={() => onStatusChange("confirmed")}
              className="text-xs bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-md transition"
            >
              Confirm plan
            </button>
          )}
          {plan.status === "confirmed" && (
            <button
              onClick={() => onStatusChange("completed")}
              className="text-xs bg-slate-600 hover:bg-slate-700 text-white font-medium px-3 py-1.5 rounded-md transition"
            >
              Mark completed
            </button>
          )}
          {plan.status === "suggested" && (
            <button
              onClick={() => onStatusChange("confirmed")}
              className="text-xs border border-slate-200 text-slate-600 hover:border-slate-300 font-medium px-3 py-1.5 rounded-md transition hidden"
            >
              Keep as suggested
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Plan editor form
function PlanEditor({
  friendId,
  year,
  initial,
  suggestion,
  onSave,
  onCancel,
}: {
  friendId: string;
  year: number;
  initial: Plan | null;
  suggestion: ActivitySuggestion | null;
  onSave: (plan: Plan) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? suggestion?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? suggestion?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? suggestion?.venue ?? "");
  const [plannedDate, setPlannedDate] = useState(initial?.plannedDate?.split("T")[0] ?? "");
  const [status, setStatus] = useState<PlanStatus>((initial?.status as PlanStatus) ?? "suggested");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = initial ? `/api/plans/${initial.id}` : "/api/plans";
      const method = initial ? "PUT" : "POST";
      const body = initial
        ? { title, description, location, plannedDate: plannedDate || null, status }
        : { friendId, year, title, description, location, plannedDate: plannedDate || null, status };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error saving plan"); return; }
      onSave(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-violet-50 border border-violet-200 rounded-xl p-5 mb-4 space-y-4">
      <h3 className="font-semibold text-violet-900">{initial ? "Edit Plan" : "New Plan"}</h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Description *</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Location *</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Planned date</label>
          <input
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PlanStatus)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="suggested">Suggested</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Plan"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg border border-slate-200">
          Cancel
        </button>
      </div>
    </form>
  );
}
