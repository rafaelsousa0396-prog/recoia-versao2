import { useState } from "react";
import { AlertTriangle, Users, BedDouble, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { AlertCard } from "@/components/AlertCard";
import { PatientRow } from "@/components/PatientRow";
import { patients, alerts, sectors, doctors } from "@/data/mockData";

const stats = [
  { label: "Pacientes Críticos", value: "3", icon: AlertTriangle, accent: "text-risk-high" },
  { label: "Internados", value: "6", icon: Users, accent: "text-primary" },
  { label: "Leitos Disponíveis", value: "10", icon: BedDouble, accent: "text-status-stable" },
  { label: "Alta Prevista Hoje", value: "1", icon: TrendingUp, accent: "text-muted-foreground" },
];

export default function Dashboard() {
  const [sectorFilter, setSectorFilter] = useState("Todos");
  const [doctorFilter, setDoctorFilter] = useState("Todos");

  const filtered = patients.filter((p) => {
    if (sectorFilter !== "Todos" && p.sector !== sectorFilter) return false;
    if (doctorFilter !== "Todos" && p.doctor !== doctorFilter) return false;
    return true;
  });

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alertas Clínicos</h2>
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <AlertCard key={a.id} alert={a} index={i} />
            ))}
          </div>
        </div>

        {/* Patient List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pacientes Internados</h2>
            <div className="flex gap-2">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="clinical-input !w-auto !py-1 text-xs"
              >
                {sectors.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="clinical-input !w-auto !py-1 text-xs"
              >
                {doctors.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-card rounded-xl border clinical-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Paciente</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Leito</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Setor</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Diagnóstico</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Risco</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vitais 6h</th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Médico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p, i) => (
                    <PatientRow key={p.id} patient={p} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
