"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        mode: "signin",
        redirect: false,
      });
      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md border border-black rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Zusammen</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>
        {error && (
          <div className="mb-4 border border-black text-black rounded-lg px-4 py-3 text-sm bg-gray-100">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{" "}
          <Link href="/auth/signup" className="text-black hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
