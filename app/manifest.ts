import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Weather-Based Outfit Suggestion System",
    short_name: "Weather Outfit",
    description: "Weather-aware outfit recommendations and saved preferences.",
    start_url: "/",
    display: "standalone",
    background_color: "#08101f",
    theme_color: "#19d3ff",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
