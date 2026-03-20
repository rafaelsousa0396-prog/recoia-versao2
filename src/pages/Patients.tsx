import { useState, useMemo } from "react";
import { Search, ArrowUpAZ, ArrowDownZA, ArrowUp01, ArrowDown10, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useInternacoesAtivas, useSetores, useMedicos, type PacienteInternado } from "@/hooks/usePacientes";
import { differenceInYears } from "date-fns";

const riskLabelsMap: Record<string, string> = { Todos: "Todos", alto: "Alto", moderado: "Moderado", estavel: "Estável" };
const riskLevels = ["Todos", "alto", "moderado", "estavel"];

function calcAge(dob: string): number {
  return differenceInYears(new Date(), new Date(dob));
}

export default function Patients() {
  const navigate = useNavigate();
  const { data: pacientes = [], isLoading } = useInternacoesAtivas();
  const { data: setores = ["Todos"] } = useSetores();
  const { data: medicos = ["Todos"] } = useMedicos();

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
    const list = pacientes.filter((p) => {
      if (sectorFilter !== "Todos" && p.internacao.setor !== sectorFilter) return false;
      if (doctorFilter !== "Todos" && p.medicoNome !== doctorFilter) return false;
      if (riskFilter !== "Todos" && p.internacao.risco !== riskFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.paciente.nome.toLowerCase().includes(q) ||
          (p.internacao.leito || "").toLowerCase().includes(q) ||
          (p.internacao.diagnostico || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sortCol === "name") {
        return sortDir === "asc"
          ? a.paciente.nome.localeCompare(b.paciente.nome)
          : b.paciente.nome.localeCompare(a.paciente.nome);
      }
      const numA = parseInt((a.internacao.leito || "").replace(/\D/g, "")) || 0;
      const numB = parseInt((b.internacao.leito || "").replace(/\D/g, "")) || 0;
      return sortDir === "asc" ? numA - numB : numB - numA;
    });
  }, [pacientes, search, sectorFilter, doctorFilter, riskFilter, sortCol, sortDir]);

  const riskClasses: Record<string, string> = {
    alto: "risk-badge-high",
    moderado: "risk-badge-medium",
    estavel: "risk-badge-stable",
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Pacientes Internados</h1>
        <p className="text-xs text-muted-foreground">{pacientes.length} pacientes · {filtered.length} exibidos</p>
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
              {setores.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Risco</label>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="clinical-input !w-auto !py-1.5 text-xs">
              {riskLevels.map((r) => <option key={r} value={r}>{riskLabelsMap[r]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Médico</label>
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="clinical-input !w-auto !py-1.5 text-xs">
              {medicos.map((d) => <option key={d} value={d}>{d}</option>)}
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
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Médico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((p, i) => (
                  <motion.tr
                    key={p.internacao.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group cursor-pointer hover:bg-clinical-muted/50 transition-colors"
                    onClick={() => navigate(`/paciente/${p.internacao.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.paciente.nome}</p>
                        <p className="text-xs text-muted-foreground">{calcAge(p.paciente.data_nascimento)}a · {p.paciente.sexo}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.internacao.leito || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.internacao.setor || "—"}</td>
                    <td className="px-4 py-3 text-xs text-foreground max-w-[200px] truncate">{p.internacao.diagnostico || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={riskClasses[p.internacao.risco] || ""}>
                        {riskLabelsMap[p.internacao.risco]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.medicoNome || "—"}</td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-muted-foreground">
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
