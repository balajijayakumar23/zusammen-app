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
      <code className="flex-1 bg-gray-100 border border-black rounded-lg px-3 py-2 text-sm font-mono text-black truncate">
        {code}
      </code>
      <button onClick={copy} className="shrink-0 text-sm bg-black hover:bg-gray-800 text-white font-medium px-3 py-2 rounded-lg transition">
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
