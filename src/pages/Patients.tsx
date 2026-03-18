import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { PatientRow } from "@/components/PatientRow";
import { patients, sectors, doctors, riskLevels } from "@/data/mockData";

const riskLabelsMap: Record<string, string> = { Todos: "Todos", high: "Alto", medium: "Moderado", stable: "Estável" };

export default function Patients() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("Todos");
  const [doctorFilter, setDoctorFilter] = useState("Todos");
  const [riskFilter, setRiskFilter] = useState("Todos");

  const filtered = patients.filter((p) => {
    if (sectorFilter !== "Todos" && p.sector !== sectorFilter) return false;
    if (doctorFilter !== "Todos" && p.doctor !== doctorFilter) return false;
    if (riskFilter !== "Todos" && p.risk !== riskFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.bed.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Pacientes Internados</h1>
        <p className="text-xs text-muted-foreground">{patients.length} pacientes · {filtered.length} exibidos</p>
      </div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, leito ou diagnóstico..."
            className="clinical-input !pl-9 !py-2 text-sm w-full"
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="clinical-input !w-auto !py-1.5 text-xs">
            {sectors.map((s) => <option key={s} value={s}>{s === "Todos" ? "Setor" : s}</option>)}
          </select>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="clinical-input !w-auto !py-1.5 text-xs">
            {riskLevels.map((r) => <option key={r} value={r}>{r === "Todos" ? "Risco" : riskLabelsMap[r]}</option>)}
          </select>
          <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="clinical-input !w-auto !py-1.5 text-xs">
            {doctors.map((d) => <option key={d} value={d}>{d === "Todos" ? "Médico" : d}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Table */}
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
              {filtered.length > 0 ? (
                filtered.map((p, i) => <PatientRow key={p.id} patient={p} index={i} />)
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
