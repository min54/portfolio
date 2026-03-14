"use client";

import { useState } from "react";
import { loginAction } from "@/app/admin/actions";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = await loginAction(email, password);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="이메일"
          required
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          required
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors"
      >
        {loading ? "..." : "로그인"}
      </button>
    </form>
  );
}
