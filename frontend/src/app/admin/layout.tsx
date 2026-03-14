import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "./actions";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Admin
          </span>
          <Link
            href="/admin/dashboard"
            className="text-sm text-zinc-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/upload"
            className="text-sm text-zinc-300 hover:text-white transition-colors"
          >
            + Upload
          </Link>
          <Link
            href="/admin/devtools"
            className="text-sm text-zinc-300 hover:text-white transition-colors"
          >
            개발도구
          </Link>
        </nav>
        <form
          action={async () => {
            "use server";
            await logoutAction();
          }}
        >
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            Logout
          </button>
        </form>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
      <Link
        href="/"
        className="fixed bottom-5 left-5 text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors select-none"
      >
        ← 사이트 보기
      </Link>
    </div>
  );
}
