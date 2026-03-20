import { useState, useMemo } from "react"; 
import { Search, ArrowUpAZ, ArrowDownZA, ArrowUp01, ArrowDown10, X } from "lucide-react";
import { motion } from "framer-motion";
import { PatientRow } from "@/components/PatientRow";
import { patients, sectors, doctors, riskLevels } from "@/data/mockData";

const riskLabelsMap: Record<string, string> = { Todos: "Todos", high: "Alto", medium: "Moderado", stable: "Estável" };

export default function Patients() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("Todos");
  const [doctorFilter, setDoctorFilter] = useState("Todos");
  const [riskFilter, setRiskFilter] = useState("Todos");
  const [sortCol, setSortCol] = useState<"name" | "bed">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (col: "name" | "bed") => {
    if (sortCol === col) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    const list = patients.filter((p) => {
      if (sectorFilter !== "Todos" && p.sector !== sectorFilter) return false;
      if (doctorFilter !== "Todos" && p.doctor !== doctorFilter) return false;
      if (riskFilter !== "Todos" && p.risk !== riskFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.bed.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sortCol === "name") {
        return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      // Sort bed numerically (extract numbers)
      const numA = parseInt(a.bed.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.bed.replace(/\D/g, "")) || 0;
      return sortDir === "asc" ? numA - numB : numB - numA;
    });
  }, [search, sectorFilter, doctorFilter, riskFilter, sortCol, sortDir]);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Pacientes Internados</h1>
        <p className="text-xs text-muted-foreground">{patients.length} pacientes · {filtered.length} exibidos</p>
      </div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1">
            <Search className="w-3 h-3" />
            Buscar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, leito, diagnóstico..."
            className="clinical-input !py-1.5 text-xs w-full"
          />
        </div>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Setor</label>
            <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="clinical-input !w-auto !py-1.5 text-xs">
              {sectors.map((s) => <option key={s} value={s}>{s === "Todos" ? "Todos" : s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Risco</label>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="clinical-input !w-auto !py-1.5 text-xs">
              {riskLevels.map((r) => <option key={r} value={r}>{r === "Todos" ? "Todos" : riskLabelsMap[r]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Médico</label>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="clinical-input !w-auto !py-1.5 text-xs">
              {doctors.map((d) => <option key={d} value={d}>{d === "Todos" ? "Todos" : d}</option>)}
            </select>
          </div>
          {(search || sectorFilter !== "Todos" || doctorFilter !== "Todos" || riskFilter !== "Todos") && (
            <button
              onClick={() => { setSearch(""); setSectorFilter("Todos"); setDoctorFilter("Todos"); setRiskFilter("Todos"); }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-0.5 whitespace-nowrap"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-card rounded-xl border clinical-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/50">
                <th
                  className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("name")}
                >
                  <span className="inline-flex items-center gap-1">
                    Paciente
                    {sortCol === "name" && (sortDir === "asc" ? <ArrowUpAZ className="w-3 h-3" /> : <ArrowDownZA className="w-3 h-3" />)}
                  </span>
                </th>
                <th
                  className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("bed")}
                >
                  <span className="inline-flex items-center gap-1">
                    Leito
                    {sortCol === "bed" && (sortDir === "asc" ? <ArrowUp01 className="w-3 h-3" /> : <ArrowDown10 className="w-3 h-3" />)}
                  </span>
                </th>
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
