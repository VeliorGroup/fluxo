"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Eye, EyeOff, AlertCircle, User, Lock } from "lucide-react";

/* ── SVG Icons ── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 23 23" className="h-5 w-5">
      <rect x="0" y="0" width="11" height="11" fill="#F25022" />
      <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
      <rect x="0" y="12" width="11" height="11" fill="#00A4EF" />
      <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
    </svg>
  );
}

/* ── Animated mesh background ── */
function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.96 0.02 250) 0%, oklch(0.98 0.01 280) 50%, oklch(0.95 0.03 230) 100%)",
        }}
      />
      <div
        className="absolute -top-1/4 -left-1/4 h-[60%] w-[60%] rounded-full opacity-40 blur-[100px]"
        style={{ background: "oklch(0.70 0.18 250)", animation: "float-slow 20s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[50%] w-[50%] rounded-full opacity-30 blur-[120px]"
        style={{ background: "oklch(0.72 0.14 200)", animation: "float-slow 25s ease-in-out infinite reverse" }}
      />
      <div
        className="absolute top-1/3 right-1/4 h-[35%] w-[35%] rounded-full opacity-20 blur-[80px]"
        style={{ background: "oklch(0.65 0.16 290)", animation: "float-slow 18s ease-in-out infinite 5s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, oklch(0.20 0.02 250) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Dark mode overlay */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.03 260) 0%, oklch(0.14 0.02 280) 50%, oklch(0.18 0.04 240) 100%)",
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  const { login, loginWithOAuth, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  if (isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const errorMsg = await login(username, password);
    if (errorMsg) setError("Invalid username or password");
    setLoading(false);
  }

  async function handleOAuth(provider: "google" | "apple" | "azure") {
    setError("");
    setOauthLoading(provider);
    const errorMsg = await loginWithOAuth(provider);
    if (errorMsg) setError(errorMsg);
    setOauthLoading(null);
  }

  const socialBtn =
    "flex h-11 items-center justify-center gap-2.5 rounded-xl border border-border bg-white text-sm font-medium shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 dark:bg-zinc-800 dark:border-white/10 dark:hover:bg-zinc-700";

  return (
    <>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .d1 { animation-delay: 0.06s; }
        .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.18s; }
        .d4 { animation-delay: 0.24s; }
        .d5 { animation-delay: 0.30s; }
        .d6 { animation-delay: 0.36s; }
        .d7 { animation-delay: 0.42s; }
      `}</style>

      <div className="relative flex min-h-svh items-center justify-center p-4 sm:p-6">
        <MeshBackground />

        {/* Theme toggle */}
        <div className="fixed top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="anim relative z-10 w-full max-w-[420px]">
          <div className="rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-black/[0.03] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/70 dark:shadow-black/20 sm:p-10">

            {/* Logo */}
            <div className="anim d1 mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-extrabold shadow-sm">
                F
              </div>
              <span className="text-xl font-bold tracking-tight">Fluxo</span>
            </div>

            {/* Heading */}
            <div className="anim d2 mb-8">
              <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight">
                Welcome back
              </h1>
              <p className="mt-1.5 text-[0.9rem] text-muted-foreground">
                Sign in to continue to your workspace
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="anim d3 space-y-1.5">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    className="flex h-11 w-full rounded-xl border border-input bg-white/80 pl-10 pr-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-zinc-800/80"
                  />
                </div>
              </div>

              <div className="anim d4 space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="flex h-11 w-full rounded-xl border border-input bg-white/80 pl-10 pr-11 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-zinc-800/80"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="anim d5 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="anim d6 my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                or continue with
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Social auth */}
            <div className="anim d7 grid grid-cols-3 gap-3">
              <button type="button" onClick={() => handleOAuth("google")} disabled={!!oauthLoading} className={socialBtn}>
                {oauthLoading === "google" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <GoogleIcon />}
              </button>
              <button type="button" onClick={() => handleOAuth("apple")} disabled={!!oauthLoading} className={socialBtn}>
                {oauthLoading === "apple" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <AppleIcon />}
              </button>
              <button type="button" onClick={() => handleOAuth("azure")} disabled={!!oauthLoading} className={socialBtn}>
                {oauthLoading === "azure" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <MicrosoftIcon />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
