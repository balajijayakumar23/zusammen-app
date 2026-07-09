"use client";

import { useState } from "react";

export default function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 truncate">
        {code}
      </code>
      <button
        onClick={copy}
        className="shrink-0 text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium px-3 py-2 rounded-lg transition"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
