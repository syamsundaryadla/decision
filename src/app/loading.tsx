export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated dots loader */}
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Loading
        </p>
      </div>
    </div>
  );
}
