import { spawnSync } from "node:child_process";

const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

if (!isVercel) {
  console.log("[prebuild] Skipping Prisma migrate deploy outside Vercel.");
  process.exit(0);
}

console.log("[prebuild] Running Prisma migrate deploy...");

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
