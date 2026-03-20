import { AlertTriangle, Users, BedDouble, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useInternacoesAtivas, type PacienteInternado } from "@/hooks/usePacientes";
import { differenceInYears } from "date-fns";

const riskLabelsMap: Record<string, string> = { alto: "Alto", moderado: "Moderado", estavel: "Estável" };

function calcAge(dob: string): number {
  return differenceInYears(new Date(), new Date(dob));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: pacientes = [], isLoading } = useInternacoesAtivas();

  const criticalPatients = pacientes.filter((p) => p.internacao.risco === "alto");

  // Derive sector occupancy from real data
  const sectorMap = new Map<string, number>();
  pacientes.forEach((p) => {
    const setor = p.internacao.setor || "Sem setor";
    sectorMap.set(setor, (sectorMap.get(setor) || 0) + 1);
  });
  const sectorOccupancy = Array.from(sectorMap.entries())
    .map(([sector, occupied]) => ({ sector, occupied }))
    .sort((a, b) => b.occupied - a.occupied);

  const stats = [
    { label: "Pacientes Internados", value: String(pacientes.length), icon: Users, accent: "text-primary" },
    { label: "Pacientes Críticos", value: String(criticalPatients.length), icon: AlertTriangle, accent: "text-risk-high" },
    { label: "Setores Ativos", value: String(sectorMap.size), icon: BedDouble, accent: "text-status-stable" },
    { label: "Taxa Risco Alto", value: pacientes.length > 0 ? `${Math.round((criticalPatients.length / pacientes.length) * 100)}%` : "0%", icon: TrendingUp, accent: "text-muted-foreground" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border p-4 clinical-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <p className="text-2xl font-semibold mt-1 font-mono tracking-tighter">{isLoading ? "—" : s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Occupancy */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pacientes por Setor</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : sectorOccupancy.length > 0 ? (
            <div className="space-y-3">
              {sectorOccupancy.map((s, i) => (
                <motion.div
                  key={s.sector}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border p-4 clinical-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{s.sector}</span>
                    <span className="text-xs text-muted-foreground">{s.occupied} {s.occupied === 1 ? "paciente" : "pacientes"}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all bg-primary"
                      style={{ width: `${Math.min((s.occupied / Math.max(pacientes.length, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border p-6 clinical-shadow text-center">
              <p className="text-sm text-muted-foreground">Nenhum paciente internado no momento.</p>
            </div>
          )}
          <button
            onClick={() => navigate("/pacientes")}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos os pacientes <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Critical Patients Quick Access */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pacientes Críticos</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : criticalPatients.length > 0 ? (
            <div className="space-y-2">
              {criticalPatients.map((p, i) => (
                <motion.div
                  key={p.internacao.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/paciente/${p.internacao.id}`)}
                  className="bg-card rounded-xl border border-risk-high/20 p-4 clinical-shadow cursor-pointer hover:bg-risk-high/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.paciente.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {calcAge(p.paciente.data_nascimento)}a · Leito {p.internacao.leito || "—"}
                      </p>
                    </div>
                    <Activity className="w-4 h-4 text-risk-high" />
                  </div>
                  <p className="text-xs text-foreground/80 mt-1">{p.internacao.diagnostico || "Sem diagnóstico"}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border p-6 clinical-shadow text-center">
              <p className="text-sm text-muted-foreground">Nenhum paciente em risco alto.</p>
            </div>
          )}
          <button
            onClick={() => navigate("/pacientes")}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos os pacientes <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
