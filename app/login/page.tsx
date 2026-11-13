"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else {
        router.replace("/dashboard");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else if (data.session) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setMessage("Check your email to confirm your account, then sign in.");
      }
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0F0D] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/5 bg-[#141C18] p-6"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">Zoom Vault</h1>
          <p className="text-sm text-white/50">
            {mode === "signin" ? "Sign in to your vault" : "Create your vault"}
          </p>
        </div>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-[#0A0F0D] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#3BCCA3]"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-[#0A0F0D] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#3BCCA3]"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-[#3BCCA3]">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#3BCCA3] py-2 font-medium text-[#0A0F0D] disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-sm text-white/50 hover:text-white"
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}