import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useInternacoesAtivas, useSetores } from "@/hooks/usePacientes";
import { differenceInYears } from "date-fns";

function calcAge(dob: string): number {
  return differenceInYears(new Date(), new Date(dob));
}

export default function BedManagement() {
  const { data: pacientes = [], isLoading } = useInternacoesAtivas();
  const { data: setores = ["Todos"] } = useSetores();
  const [sectorFilter, setSectorFilter] = useState("Todos");

  const filtered = useMemo(() => {
    if (sectorFilter === "Todos") return pacientes;
    return pacientes.filter((p) => p.internacao.setor === sectorFilter);
  }, [pacientes, sectorFilter]);

  // Group by sector
  const sectorGroups = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    filtered.forEach((p) => {
      const setor = p.internacao.setor || "Sem setor";
      if (!groups.has(setor)) groups.set(setor, []);
      groups.get(setor)!.push(p);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Gestão de Leitos</h1>
          <p className="text-xs text-muted-foreground">
            {pacientes.length} {pacientes.length === 1 ? "leito ocupado" : "leitos ocupados"}
          </p>
        </div>
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="clinical-input !w-auto !py-1 text-xs"
        >
          {setores.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-sm text-muted-foreground">Carregando...</div>
      ) : sectorGroups.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 clinical-shadow text-center">
          <p className="text-sm text-muted-foreground">Nenhum leito ocupado no momento.</p>
        </div>
      ) : (
        sectorGroups.map(([sector, patients]) => (
          <div key={sector}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {sector} ({patients.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {patients.map((p, i) => (
                <motion.div
                  key={p.internacao.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="group relative rounded-xl border p-3 transition-all cursor-default bg-status-occupied/15 border-status-occupied/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {p.internacao.leito || "—"}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-status-occupied" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground truncate">{p.paciente.nome}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {calcAge(p.paciente.data_nascimento)}a · {p.internacao.diagnostico || "—"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
