"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dice5, 
  Layers, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sparkles,
  ChevronRight,
  Gamepad2,
  BrainCircuit,
  LogOut,
  Sun,
  Moon,
  Clock,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "next-themes";

type Mode = "dice" | "cards";

export default function RandomDecisionPage() {
  const [mode, setMode] = useState<Mode>("dice");
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);
  const [newOption, setNewOption] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlaygroundMenuOpen, setIsPlaygroundMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Parse mode from URL if navigated from dashboard mobile menu
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get("mode");
      if (urlMode === "dice" || urlMode === "cards") {
        setMode(urlMode);
      }
    }
  }, []);

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setResult(null);
    
    // Simulate roll animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * options.length);
      setResult(randomIndex);
      setIsRolling(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border relative">
        <div className="max-w-[900px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/decisely-light.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain dark:hidden" priority />
              <Image src="/decisely.png" alt="Decisely" width={90} height={36} className="h-6 md:h-8 w-auto object-contain hidden dark:block" priority />
            </Link>

            <div className="flex items-center gap-6 flex-1 ml-8">
              <div className="hidden sm:flex bg-muted/50 p-1 rounded-xl">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BrainCircuit className="w-4 h-4" />
                  AI Mode
                </Link>
                <Link
                  href="/random"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-background shadow-sm text-foreground"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  Playground
                </Link>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {user && (
                <Link
                  href="/dashboard/history"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  History
                </Link>
              )}
              
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              )}

              {user ? (
                <>
                  {/* User avatar / Profile Link */}
                  <Link 
                    href="/dashboard/profile"
                    className="flex items-center gap-2 pl-2 border-l border-border hover:bg-muted/50 rounded-lg py-1 px-2 transition-colors"
                  >
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-7 h-7 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="text-xs text-muted-foreground hidden md:block max-w-[120px] truncate">
                      {user.displayName?.split(" ")[0]}
                    </span>
                  </Link>

                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4 text-muted-foreground" />
                  </button>
                </>
              ) : (
                <div className="pl-2 border-l border-border flex items-center gap-2">
                  <Link 
                    href="/login"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                  >
                    Sign In
                  </Link>
                </div>
              )}
              
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b border-border bg-background/95 backdrop-blur-xl p-4 flex flex-col gap-2 shadow-lg z-40 animate-in slide-in-from-top-2 duration-200">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 text-muted-foreground font-medium transition-colors"
            >
              <BrainCircuit className="w-5 h-5" />
              AI Mode
            </Link>
            
            <div className="flex flex-col">
              <button 
                onClick={() => setIsPlaygroundMenuOpen(!isPlaygroundMenuOpen)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Playground
                </div>
              </button>
              
              {isPlaygroundMenuOpen && (
                <div className="flex flex-col gap-1 pl-12 pr-4 pb-2 animate-in slide-in-from-top-1">
                  <button onClick={() => { setMode("dice"); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full text-left">
                    <Dice5 className="w-4 h-4 text-primary" />
                    Dice Roll
                  </button>
                  <button onClick={() => { setMode("cards"); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full text-left">
                    <Layers className="w-4 h-4 text-primary" />
                    Card Draw
                  </button>
                </div>
              )}
            </div>
            
            {user && (
              <Link 
                href="/dashboard/history" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 text-muted-foreground font-medium transition-colors"
              >
                <Clock className="w-5 h-5" />
                History
              </Link>
            )}
          </div>
        )}
      </header>

      <main className={`flex-1 transition-all duration-300 ${isMobileMenuOpen ? "blur-md pointer-events-none opacity-50" : ""} w-full max-w-[900px] mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10`}>
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3 h-3" />
              Instant Playground
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Chance & Fate</h1>
            <p className="text-muted-foreground mt-2 text-lg">Let the universe decide your next move.</p>
          </div>
          
          <div className="flex bg-muted p-1 rounded-2xl w-fit">
            <button 
              onClick={() => { setMode("dice"); setResult(null); }}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
                mode === "dice" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Dice5 className="w-4 h-4" />
              Dice Roll
            </button>
            <button 
              onClick={() => { setMode("cards"); setResult(null); }}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
                mode === "cards" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="w-4 h-4" />
              Card Draw
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Options Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                Your Options
                <span className="text-xs font-normal text-muted-foreground">({options.length})</span>
              </h3>
              
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {options.map((opt, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 transition-all",
                      result === i && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <div className="flex-1 text-sm font-medium">{opt}</div>
                    <button 
                      onClick={() => removeOption(i)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  placeholder="Add new option..."
                  className="flex-1 bg-muted border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button 
                  onClick={addOption}
                  className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <Link 
              href="/dashboard"
              className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all group"
            >
              <div className="text-sm font-medium">Need deeper AI analysis?</div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Interactive Area */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border rounded-[40px] p-8 md:p-12 shadow-xl min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
              
              <AnimatePresence mode="wait">
                {mode === "dice" ? (
                  <DiceComponent key="dice" isRolling={isRolling} result={result} />
                ) : (
                  <CardComponent key="cards" isRolling={isRolling} result={result} />
                )}
              </AnimatePresence>

              <div className="mt-12 text-center relative z-10">
                <AnimatePresence>
                  {result !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20"
                    >
                      <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">The Winner Is</p>
                      <h2 className="text-3xl font-bold text-foreground">{options[result]}</h2>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={handleRoll}
                  disabled={isRolling}
                  className={cn(
                    "relative group px-12 py-5 rounded-full font-bold text-xl transition-all shadow-2xl shadow-primary/30 active:scale-95 disabled:opacity-50",
                    isRolling ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"
                  )}
                >
                  <span className="flex items-center gap-3">
                    {isRolling ? (
                      <>
                        <RotateCcw className="w-6 h-6 animate-spin" />
                        Rolling...
                      </>
                    ) : (
                      <>
                        {mode === "dice" ? <Dice5 className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                        {result !== null ? "Roll Again" : "Decide for Me"}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}

function DiceComponent({ isRolling, result }: { isRolling: boolean, result: number | null }) {
  return (
    <motion.div 
      animate={isRolling ? { 
        rotate: [0, 90, 180, 270, 360],
        y: [0, -50, 0],
        scale: [1, 1.2, 1]
      } : {}}
      transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0, ease: "linear" }}
      className="relative w-40 h-40 flex items-center justify-center z-10"
    >
      <div className="w-32 h-32 bg-card border-4 border-primary rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
        {/* Dice Dots */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-20 h-20">
          {/* Example dots for 5 */}
          <div className="w-4 h-4 rounded-full bg-primary" />
          <div />
          <div className="w-4 h-4 rounded-full bg-primary" />
          <div />
          <div className="w-4 h-4 rounded-full bg-primary" />
          <div />
          <div className="w-4 h-4 rounded-full bg-primary" />
          <div />
          <div className="w-4 h-4 rounded-full bg-primary" />
        </div>
      </div>
      
      {/* Dynamic Dots based on result would go here */}
    </motion.div>
  );
}

function CardComponent({ isRolling, result }: { isRolling: boolean, result: number | null }) {
  return (
    <div className="flex gap-4 z-10">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={isRolling ? { 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.4, delay: i * 0.1, repeat: isRolling ? Infinity : 0 }}
          className={cn(
            "w-24 h-36 rounded-xl border-2 border-border bg-card shadow-lg flex items-center justify-center relative transition-all",
            result !== null && i === 2 ? "border-primary bg-primary/5 scale-110 -translate-y-4" : "opacity-40"
          )}
        >
          <div className="text-primary/20">
            <Layers className="w-12 h-12" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
