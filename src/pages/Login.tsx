import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function Login() {
  const { signIn, signUp, user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already logged in
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [registro, setRegistro] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (isSignUp) {
      if (!nome.trim() || !registro.trim()) {
        setError("Preencha todos os campos.");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, nome, registro);
      if (error) {
        setError(error);
      } else {
        setSuccess("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Reco.IA</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Prontuário Inteligente</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border bg-card clinical-shadow">
          <h2 className="text-sm font-medium text-foreground">
            {isSignUp ? "Criar conta" : "Entrar"}
          </h2>

          {isSignUp && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-xs">Nome completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Dr. João Silva"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="registro" className="text-xs">Nº de Registro (CRM, COREN...)</Label>
                <Input
                  id="registro"
                  value={registro}
                  onChange={(e) => setRegistro(e.target.value)}
                  placeholder="CRM-12345"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--status-stable))] bg-[hsl(var(--status-stable-muted))] rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {submitting ? "Aguarde..." : isSignUp ? "Criar conta" : "Entrar"}
          </Button>

          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            {isSignUp ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
