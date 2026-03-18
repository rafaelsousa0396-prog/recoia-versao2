import { useState } from "react";
import { motion } from "framer-motion";
import { beds, sectors } from "@/data/mockData";

const statusConfig = {
  occupied: { label: "Ocupado", bg: "bg-status-occupied/15 border-status-occupied/30", dot: "bg-status-occupied" },
  available: { label: "Disponível", bg: "bg-status-stable/10 border-status-stable/30", dot: "bg-status-stable" },
  cleaning: { label: "Higienização", bg: "bg-status-cleaning/10 border-status-cleaning/30", dot: "bg-status-cleaning" },
  reserved: { label: "Reservado", bg: "bg-status-reserved/10 border-status-reserved/30", dot: "bg-status-reserved" },
};

export default function BedManagement() {
  const [sectorFilter, setSectorFilter] = useState("Todos");

  const filtered = sectorFilter === "Todos" ? beds : beds.filter((b) => b.sector === sectorFilter);
  const sectorGroups = [...new Set(filtered.map((b) => b.sector))];

  const counts = {
    total: beds.length,
    occupied: beds.filter((b) => b.status === "occupied").length,
    available: beds.filter((b) => b.status === "available").length,
    cleaning: beds.filter((b) => b.status === "cleaning").length,
    reserved: beds.filter((b) => b.status === "reserved").length,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Gestão de Leitos</h1>
          <p className="text-xs text-muted-foreground">Mapa de ocupação hospitalar em tempo real</p>
        </div>
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="clinical-input !w-auto !py-1 text-xs">
          {sectors.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            <span className="text-xs text-muted-foreground">
              {cfg.label} ({counts[key as keyof typeof counts]})
            </span>
          </div>
        ))}
      </div>

      {/* Bed Grid by Sector */}
      {sectorGroups.map((sector) => (
        <div key={sector}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{sector}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.filter((b) => b.sector === sector).map((bed, i) => {
              const cfg = statusConfig[bed.status];
              return (
                <motion.div
                  key={bed.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`group relative rounded-xl border p-3 transition-all cursor-default ${cfg.bg} hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-semibold text-foreground">{bed.number}</span>
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  </div>
                  {bed.status === "occupied" && bed.patientName ? (
                    <div>
                      <p className="text-xs font-medium text-foreground truncate">{bed.patientName}</p>
                      <p className="text-[10px] text-muted-foreground">{bed.patientAge}a · {bed.diagnosis}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
