import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTemperature } from "@/lib/utils";
import { CloudSun, MapPin, ShieldCheck, Sparkles, Zap, Database, Layers3 } from "lucide-react";

export default async function HomePage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: CloudSun,
      title: "Live weather intelligence",
      description: "Pull current weather from OpenWeatherMap using city search or geolocation."
    },
    {
      icon: Sparkles,
      title: "Dynamic outfit engine",
      description: "Generate outfit suggestions from temperature, condition, and style preference."
    },
    {
      icon: ShieldCheck,
      title: "JWT auth + protected routes",
      description: "Email/password login with NextAuth and route protection via middleware."
    },
    {
      icon: Database,
      title: "Prisma + PostgreSQL",
      description: "Persist preferences, saved outfits, and search history in a relational database."
    },
    {
      icon: Layers3,
      title: "Scalable structure",
      description: "App Router, reusable UI, API caching, and service layers keep the app maintainable."
    },
    {
      icon: Zap,
      title: "Deployment ready",
      description: "Vercel-friendly with Docker support and environment-based configuration."
    }
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute left-0 top-0 h-[34rem] w-[34rem] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-orange-400/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Weather Outfit System</p>
            <h1 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
              Weather-Based Outfit Suggestion System
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="border-white/10 bg-white/5 text-white">
              Next.js + Prisma
            </Badge>
            <Link
              href="/auth/login"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-cyan-400 px-4 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Get Started
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center">
            <Badge className="mb-5 w-fit bg-cyan-400/15 px-3 py-1 text-cyan-200 hover:bg-cyan-400/20">
              <MapPin className="mr-2 h-3.5 w-3.5" />
              City search + geolocation + SSR weather
            </Badge>
            <h2 className="max-w-3xl font-[var(--font-display)] text-5xl font-semibold tracking-tight text-balance md:text-7xl">
              Outfit recommendations that react to the sky in real time.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              This app blends live weather, saved style preferences, and a rule-based recommendation engine
              to suggest outfits that match temperature, rain, cold snaps, heat, and everything in between.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-cyan-400 px-6 text-base font-medium text-slate-950 transition-colors hover:bg-cyan-300"
              >
                Open Dashboard
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 text-base font-medium text-white transition-colors hover:bg-white/10"
              >
                Create an Account
              </Link>
            </div>
          </div>

          <Card className="glass border-white/10 shadow-glow">
            <CardHeader>
              <CardDescription className="text-cyan-200/80">Preview</CardDescription>
              <CardTitle className="font-[var(--font-display)] text-2xl">Weather-aware outfit snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Current weather</p>
                    <p className="mt-1 text-3xl font-semibold">{formatTemperature(28)}, clear sky</p>
                  </div>
                  <CloudSun className="h-12 w-12 text-cyan-300" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-slate-300">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-slate-400">Humidity</p>
                    <p className="mt-1 text-lg font-semibold">58%</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-slate-400">Feels like</p>
                    <p className="mt-1 text-lg font-semibold">{formatTemperature(30)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-slate-400">Style</p>
                    <p className="mt-1 text-lg font-semibold">Casual</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Suggested outfit</p>
                <p className="mt-2 text-2xl font-semibold">Breathable tee, light shorts, sneakers</p>
                <p className="mt-2 text-sm leading-6 text-cyan-50/85">
                  Keep the outfit light, mobile, and comfortable for a warm, sunny day.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="glass border-white/10 transition-transform duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-300">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
