import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-zinc-500">포트폴리오 관리자</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
