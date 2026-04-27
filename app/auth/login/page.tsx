import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-sm text-slate-400">
          New here?{" "}
          <Link href="/auth/signup" className="text-cyan-300 hover:text-cyan-200">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
