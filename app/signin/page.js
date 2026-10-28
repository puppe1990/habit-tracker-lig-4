"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AuthFrame from "../components/habits/AuthFrame";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Falha ao entrar");
        return;
      }

      router.replace("/");
    } catch (err) {
      console.error(err);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Entrar"
      subtitle="Sente à mesa e continue o jogo."
      footerLabel="Ainda não tem conta?"
      footerHref="/signup"
      footerCta="Criar conta"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="signin-email" className="mb-1 block text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field bg-black/25 text-white placeholder:text-white/35"
            placeholder="seu@email.com"
            required
          />
        </div>
        <div>
          <label htmlFor="signin-password" className="mb-1 block text-sm font-medium text-white/80">
            Senha
          </label>
          <div className="flex items-center gap-1 rounded-[14px] border border-[var(--panel-border)] bg-black/25 pr-1 focus-within:border-gold focus-within:ring-4 focus-within:ring-[color-mix(in_srgb,var(--gold)_28%,transparent)]">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35"
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-disc-missed/15 px-3 py-2 text-sm text-[#ffb4ac] ring-1 ring-disc-missed/30">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-gold w-full py-2.5 text-sm">
          {loading ? "Entrando..." : "Sentar à mesa"}
        </button>
      </form>
    </AuthFrame>
  );
}
