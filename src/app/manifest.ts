import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Decisely — AI-Powered Decision Intelligence",
    short_name: "Decisely",
    description:
      "Analyze choices, simulate outcomes, and make confident decisions with AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/decisely.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/decisely.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
