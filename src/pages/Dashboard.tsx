import { AlertTriangle, Users, BedDouble, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertCard } from "@/components/AlertCard";
import { patients, alerts, beds } from "@/data/mockData";

const occupiedBeds = beds.filter((b) => b.status === "occupied").length;
const availableBeds = beds.filter((b) => b.status === "available").length;
const criticalPatients = patients.filter((p) => p.risk === "high");

const stats = [
  { label: "Pacientes Internados", value: String(patients.length), icon: Users, accent: "text-primary" },
  { label: "Pacientes Críticos", value: String(criticalPatients.length), icon: AlertTriangle, accent: "text-risk-high" },
  { label: "Leitos Disponíveis", value: String(availableBeds), icon: BedDouble, accent: "text-status-stable" },
  { label: "Taxa Ocupação", value: `${Math.round((occupiedBeds / beds.length) * 100)}%`, icon: TrendingUp, accent: "text-muted-foreground" },
];

const sectorOccupancy = ["UTI", "4º Andar", "Emergência"].map((sector) => {
  const sectorBeds = beds.filter((b) => b.sector === sector);
  const occupied = sectorBeds.filter((b) => b.status === "occupied").length;
  return { sector, total: sectorBeds.length, occupied, rate: Math.round((occupied / sectorBeds.length) * 100) };
});

export default function Dashboard() {
  const navigate = useNavigate();

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
            <p className="text-2xl font-semibold mt-1 font-mono tracking-tighter">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alertas Clínicos</h2>
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <AlertCard key={a.id} alert={a} index={i} />
            ))}
          </div>
        </div>

        {/* Sector Occupancy */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ocupação por Setor</h2>
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
                  <span className="text-xs text-muted-foreground">{s.occupied}/{s.total} leitos</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${s.rate > 80 ? "bg-risk-high" : s.rate > 50 ? "bg-risk-medium" : "bg-status-stable"}`}
                    style={{ width: `${s.rate}%` }}
                  />
                </div>
                <p className="text-right text-[10px] text-muted-foreground mt-1">{s.rate}%</p>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => navigate("/leitos")}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Ver gestão de leitos <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Critical Patients Quick Access */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pacientes Críticos</h2>
          <div className="space-y-2">
            {criticalPatients.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/paciente/${p.id}`)}
                className="bg-card rounded-xl border border-risk-high/20 p-4 clinical-shadow cursor-pointer hover:bg-risk-high/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.age}a · Leito {p.bed}</p>
                  </div>
                  <Activity className="w-4 h-4 text-risk-high" />
                </div>
                <p className="text-xs text-foreground/80 mt-1">{p.diagnosis}</p>
                {p.alerts.length > 0 && (
                  <p className="text-[10px] text-risk-high mt-1 truncate">⚠ {p.alerts[0]}</p>
                )}
              </motion.div>
            ))}
          </div>
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
