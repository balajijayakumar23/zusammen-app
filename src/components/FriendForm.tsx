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

  const inputClass = "w-full border border-black rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black";

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
    <form onSubmit={handleSubmit} className="border border-black rounded-xl p-6 space-y-5 bg-white">
      {error && (
        <div className="border border-black text-black rounded-lg px-4 py-3 text-sm bg-gray-100">
          {error}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Name *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Taylor" />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Date of birth *</label>
          <input type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">City *</label>
          <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Berlin, Germany" />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Hobby *</label>
          <input type="text" required value={hobby} onChange={(e) => setHobby(e.target.value)} className={inputClass} placeholder="hiking, board games, cooking…" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-black mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Anything the group should know…"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Friend"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-black font-medium px-4 py-2.5 rounded-lg border border-black hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
