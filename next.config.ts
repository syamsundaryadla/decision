import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const cspDirectives = [
  "default-src 'self'",
  // Scripts: self + inline (Next.js requires it) + eval (dev hot reload) + external SDKs
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com`,
  // Styles: self + inline (Tailwind/Next.js) + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts: self + Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images: self + data URIs + Google profile pics + Razorpay assets
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com https://*.razorpay.com https://cdn.razorpay.com",
  // Connections: Firebase Auth/Firestore/Analytics + Gemini + Razorpay + dev WebSocket
  [
    "connect-src 'self'",
    "https://*.firebaseio.com",
    "https://*.googleapis.com",
    "https://*.firebase.com",
    "https://*.firebaseapp.com",
    "https://firebaseinstallations.googleapis.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://generativelanguage.googleapis.com",
    "https://lux.razorpay.com",
    "https://api.razorpay.com",
    "https://*.razorpay.com",
    "wss://*.firebaseio.com",
    // Dev mode: Next.js HMR WebSocket
    ...(isDev ? ["ws://localhost:*", "http://localhost:*"] : []),
  ].join(" "),
  // Frames: Razorpay checkout + Firebase Auth popup
  "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.firebaseapp.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // In dev, use report-only so CSP issues don't block pages
    // In production, enforce the policy
    key: isDev ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

