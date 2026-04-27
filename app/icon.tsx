const svg = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" role="img" aria-label="Weather outfit icon">
  <rect width="64" height="64" rx="18" fill="#0f172a" />
  <path d="M20 29c0-6.627 5.373-12 12-12 5.392 0 9.96 3.559 11.453 8.5C48.432 26.84 52 30.95 52 36c0 5.523-4.477 10-10 10H24c-4.418 0-8-3.582-8-8 0-3.83 2.71-7.03 6.32-7.84A11.957 11.957 0 0 1 20 29Z" fill="#19d3ff" fill-opacity=".18" />
  <path d="M32 19c-6.627 0-12 5.373-12 12 0 .292.01.581.03.867A8.01 8.01 0 0 0 12 40c0 4.418 3.582 8 8 8h26c4.418 0 8-3.582 8-8 0-4.72-4.045-8.49-9.06-7.94A12.01 12.01 0 0 0 32 19Z" stroke="#19d3ff" stroke-width="3" stroke-linejoin="round" />
  <path d="M32 29v14m-7-7h14" stroke="#f8fafc" stroke-width="3" stroke-linecap="round" />
</svg>`;

export default function Icon() {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
