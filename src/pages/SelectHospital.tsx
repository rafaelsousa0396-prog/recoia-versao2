import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Brain, Building2, LogOut, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  medico: "Médico",
  enfermagem: "Enfermagem",
  fisio: "Fisioterapia",
  assistente_social: "Serviço Social",
  recepcao: "Recepção",
  farmacia: "Farmácia",
};

export default function SelectHospital() {
  const { hospitals, selectHospital, signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (link: typeof hospitals[0]) => {
    selectHospital(link);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Selecionar Hospital</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Olá, {profile?.nome || "usuário"}. Escolha onde deseja acessar.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {hospitals.map((link) => (
            <button
              key={link.id}
              onClick={() => handleSelect(link)}
              className="w-full p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {link.hospital?.nome || "Hospital"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {link.hospital?.cidade} - {link.hospital?.estado}
                    </span>
                  </div>
                  <span className="inline-block mt-1.5 text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                    {roleLabels[link.role] || link.role}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Button variant="ghost" onClick={signOut} className="w-full text-muted-foreground">
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
