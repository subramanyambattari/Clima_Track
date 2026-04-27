"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = Object.fromEntries(formData.entries());

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            password: payload.password,
            stylePreference: payload.stylePreference,
            homeCity: payload.homeCity
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to create account.");
        }
      }

      const result = await signIn("credentials", {
        email: String(payload.email ?? ""),
        password: String(payload.password ?? ""),
        redirect: false
      });

      if (result?.error) {
        throw new Error("Invalid email or password.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);

    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false
      });

      if (!result?.url) {
        throw new Error("Unable to start Google sign-in.");
      }

      window.location.assign(result.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to start Google sign-in.");
      setGoogleLoading(false);
    }
  }

  return (
    <Card className="glass border-white/10 shadow-glow">
      <CardHeader>
        <Badge className="w-fit bg-cyan-400/10 text-cyan-200">
          {mode === "login" ? "Welcome back" : "Create account"}
        </Badge>
        <CardTitle className="font-[var(--font-display)] text-3xl">
          {mode === "login" ? "Log in to your weather dashboard" : "Start your style profile"}
        </CardTitle>
        <CardDescription className="text-slate-300">
          {mode === "login"
            ? "Use your credentials to access your weather-aware outfit recommendations."
            : "Create a profile so the system can learn your preferred style and home city."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(new FormData(event.currentTarget));
          }}
          className="space-y-4"
        >
          {mode === "signup" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" placeholder="Aarav Sharma" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeCity">Home city</Label>
                <Input id="homeCity" name="homeCity" placeholder="Mumbai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stylePreference">Preferred style</Label>
                <select
                  id="stylePreference"
                  name="stylePreference"
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                  defaultValue="casual"
                >
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="sporty">Sporty</option>
                </select>
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="********" required />
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <div className="space-y-3">
            <div className="relative flex items-center justify-center">
              <span className="absolute inset-x-0 border-t border-white/10" />
              <span className="relative bg-slate-950 px-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                Or continue with
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void handleGoogleSignIn()}
              disabled={loading || googleLoading}
            >
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {googleLoading ? "Redirecting" : "Continue with Google"}
            </Button>
          </div>

          <Button type="submit" className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Please wait" : mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
