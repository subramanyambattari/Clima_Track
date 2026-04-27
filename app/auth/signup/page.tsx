import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <AuthForm mode="signup" />
        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-cyan-300 hover:text-cyan-200">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
