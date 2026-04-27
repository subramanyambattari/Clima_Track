# Weather-Based Outfit Suggestion System

A production-ready full-stack weather outfit app built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI components, NextAuth, Prisma, PostgreSQL, and the OpenWeatherMap API.

## Features

- Email/password authentication with JWT sessions
- Google OAuth sign-in alongside credentials login
- Protected dashboard routes
- Real-time weather by city search or geolocation
- Weather-aware outfit recommendation engine
- User preferences for casual, formal, and sporty styles
- Save favorite outfits
- Search history for previous weather lookups
- SSR weather rendering on the dashboard
- Cached API responses for performance
- Rate limiting on API routes
- Dark/light mode toggle
- Responsive mobile-first UI
- Docker support and Vercel-friendly structure

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style component primitives
- NextAuth.js
- Prisma
- PostgreSQL
- OpenWeatherMap API

## What You Need To Create

You need to provision these on your side before the app can run:

- A PostgreSQL database
- An OpenWeatherMap API key
- A strong `NEXTAUTH_SECRET`
- A public app URL for `NEXTAUTH_URL`
- Google OAuth client credentials

No MongoDB is required for this implementation. The app is wired for PostgreSQL.

## Environment Variables

Create or update a `.env` file with these values:

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
WEATHER_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Example:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/weather_outfit"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
WEATHER_API_KEY="your-openweather-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Google OAuth must allow the callback URL:

```bash
http://localhost:3000/api/auth/callback/google
```

## Setup Guide

1. Install dependencies

```bash
npm install
```

2. Create the database and apply the Prisma schema

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Start the app

```bash
npm run dev
```

4. Open the app

```bash
http://localhost:3000
```

## Deployment

### Vercel

- Add the environment variables in Vercel
- Connect the repository
- Deploy as a standard Next.js app

### Docker

Build and run:

```bash
docker build -t weather-outfit .
docker run -p 3000:3000 --env-file .env weather-outfit
```

## Architecture

- `app/` - route handlers, pages, and layouts
- `components/` - reusable UI and page sections
- `lib/` - shared utilities, auth, caching, validation, and Prisma client
- `services/` - business logic and integration layers
- `types/` - TypeScript types and module augmentation
- `prisma/` - database schema

## Notes

- Weather data is cached in memory and via CDN-friendly headers to reduce API usage.
- Rate limiting is implemented at the application layer. For multi-region scale, you can swap it for Redis or Upstash later.
- The outfit engine is deterministic and rule-based so it works without any extra AI keys. It is easy to replace or augment with an AI model later.
