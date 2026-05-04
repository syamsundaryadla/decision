"use client";

import { useAppStore } from "@/lib/store";
import { Brain } from "lucide-react";

export function LoadingScreen() {
  const { loadingMessage } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Animated brain icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-10 h-10 text-primary animate-pulse" />
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary/40" />
        </div>
        <div
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "3s", animationDelay: "1s" }}
        >
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30" />
        </div>
        <div
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "3s", animationDelay: "2s" }}
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/20" />
        </div>
      </div>

      {/* Loading message */}
      <p
        className="text-base font-medium text-foreground text-center transition-all duration-500"
        key={loadingMessage}
      >
        {loadingMessage}
      </p>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        This usually takes 5–10 seconds
      </p>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-muted rounded-full mt-6 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full animate-pulse"
          style={{
            width: "60%",
            animation: "loading-progress 2.5s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes loading-progress {
          0% {
            width: 10%;
            margin-left: 0;
          }
          50% {
            width: 60%;
            margin-left: 20%;
          }
          100% {
            width: 10%;
            margin-left: 90%;
          }
        }
      `}</style>
    </div>
  );
}
