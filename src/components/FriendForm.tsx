"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FriendFormProps {
  initial?: {
    id: string;
    name: string;
    dateOfBirth: string;
    hobby: string;
    city: string;
    notes: string | null;
  };
}

export default function FriendForm({ initial }: FriendFormProps) {
  const router = useRouter();
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    initial?.dateOfBirth ? initial.dateOfBirth.split("T")[0] : ""
  );
  const [hobby, setHobby] = useState(initial?.hobby ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = isEdit ? `/api/friends/${initial!.id}` : "/api/friends";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dateOfBirth, hobby, city, notes: notes || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.fieldErrors ? JSON.stringify(data.error.fieldErrors) : data.error || "Error saving friend");
        return;
      }
      router.push(`/friends/${data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Taylor"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date of birth *</label>
          <input
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Austin, TX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hobby *</label>
          <input
            type="text"
            required
            value={hobby}
            onChange={(e) => setHobby(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="hiking, board games, cooking…"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          placeholder="Anything the group should know…"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Friend"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
