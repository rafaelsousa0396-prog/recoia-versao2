import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useInternacoesAtivas, useSetores, SetorInfo } from "@/hooks/usePacientes";
import { differenceInYears } from "date-fns";
import { Badge } from "@/components/ui/badge";

function calcAge(dob: string): number {
  return differenceInYears(new Date(), new Date(dob));
}

function riskColor(risco: string) {
  if (risco === "alto") return "bg-destructive";
  if (risco === "moderado") return "bg-amber-500";
  return "bg-emerald-500";
}

import { sectorAbbrev, bedLabel } from "@/lib/bedUtils";

export default function BedManagement() {
  const { data: pacientes = [], isLoading: loadingPacientes } = useInternacoesAtivas();
  const { data: setores = [], isLoading: loadingSetores } = useSetores();
  const [sectorFilter, setSectorFilter] = useState("Todos");

  const filtered = useMemo(() => {
    if (sectorFilter === "Todos") return pacientes;
    return pacientes.filter((p) => p.internacao.setor === sectorFilter);
  }, [pacientes, sectorFilter]);

  const totalLeitos = useMemo(() => setores.reduce((sum, s) => sum + s.numero_leitos, 0), [setores]);
  const totalOcupados = pacientes.length;
  const taxaOcupacao = totalLeitos > 0 ? Math.round((totalOcupados / totalLeitos) * 100) : 0;

  // Build sector display data
  const sectorDisplay = useMemo(() => {
    const displaySetores = sectorFilter === "Todos" ? setores : setores.filter(s => s.nome === sectorFilter);

    return displaySetores.map((setor) => {
      const patients = pacientes.filter(p => p.internacao.setor === setor.nome);
      const disponivel = Math.max(0, setor.numero_leitos - patients.length);
      return { setor, patients, disponivel };
    });
  }, [setores, pacientes, sectorFilter]);

  // Patients without a registered sector
  const orphanPatients = useMemo(() => {
    const setorNames = new Set(setores.map(s => s.nome));
    return filtered.filter(p => !p.internacao.setor || !setorNames.has(p.internacao.setor));
  }, [filtered, setores]);

  const isLoading = loadingPacientes || loadingSetores;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Gestão de Leitos</h1>
          <p className="text-xs text-muted-foreground">
            {totalOcupados}/{totalLeitos} leitos ocupados · {taxaOcupacao}% ocupação
          </p>
        </div>
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="clinical-input !w-auto !py-1 text-xs"
        >
          <option value="Todos">Todos os setores</option>
          {setores.map((s) => (
            <option key={s.id} value={s.nome}>{s.nome}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total de Leitos" value={totalLeitos} />
        <SummaryCard label="Ocupados" value={totalOcupados} accent="text-status-occupied" />
        <SummaryCard label="Disponíveis" value={Math.max(0, totalLeitos - totalOcupados)} accent="text-emerald-600" />
        <SummaryCard label="Ocupação" value={`${taxaOcupacao}%`} accent={taxaOcupacao > 85 ? "text-destructive" : "text-foreground"} />
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-sm text-muted-foreground">Carregando...</div>
      ) : setores.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 clinical-shadow text-center">
          <p className="text-sm text-muted-foreground">Nenhum setor cadastrado. Cadastre setores no painel de administração.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sectorDisplay.map(({ setor, patients, disponivel }) => (
            <SectorSection key={setor.id} setor={setor} patients={patients} disponivel={disponivel} />
          ))}

          {orphanPatients.length > 0 && sectorFilter === "Todos" && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Sem setor definido ({orphanPatients.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {orphanPatients.map((p, i) => (
                  <BedCard key={p.internacao.id} p={p} i={i} label={p.internacao.leito || `S/S ${String(i + 1).padStart(2, "0")}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-card rounded-xl border p-3 clinical-shadow">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 ${accent || "text-foreground"}`}>{value}</p>
    </div>
  );
}

function SectorSection({ setor, patients, disponivel }: { setor: SetorInfo; patients: any[]; disponivel: number }) {
  const ocupacao = setor.numero_leitos > 0 ? Math.round((patients.length / setor.numero_leitos) * 100) : 0;
  const abbrev = sectorAbbrev(setor.nome);

  // Build all bed slots: occupied ones first, then empty
  const occupiedCount = patients.length;
  const emptyStartIndex = occupiedCount;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {setor.nome}
        </h2>
        <Badge variant="secondary" className="text-[10px]">
          {patients.length}/{setor.numero_leitos} leitos
        </Badge>
        <Badge variant={disponivel > 0 ? "outline" : "destructive"} className="text-[10px]">
          {disponivel > 0 ? `${disponivel} disponível(is)` : "Lotado"}
        </Badge>
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground">{ocupacao}%</span>
        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${ocupacao > 85 ? "bg-destructive" : ocupacao > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(100, ocupacao)}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {patients.map((p, i) => (
          <BedCard key={p.internacao.id} p={p} i={i} label={bedLabel(abbrev, i)} />
        ))}
        {Array.from({ length: disponivel }).map((_, i) => {
          const idx = emptyStartIndex + i;
          return (
            <motion.div
              key={`empty-${setor.id}-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              className="rounded-xl border border-dashed border-muted-foreground/20 p-3 min-h-[72px]"
            >
              <span className="font-mono text-xs font-semibold text-muted-foreground/50">
                {bedLabel(abbrev, idx)}
              </span>
              <p className="text-[10px] text-muted-foreground mt-1">Disponível</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function BedCard({ p, i, label }: { p: any; i: number; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.02 }}
      className="group relative rounded-xl border p-3 transition-all cursor-default bg-status-occupied/15 border-status-occupied/30 hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-sm font-semibold text-foreground">
          {label}
        </span>
        <div className={`w-2 h-2 rounded-full ${riskColor(p.internacao.risco)}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground truncate">{p.paciente.nome}</p>
        <p className="text-[10px] text-muted-foreground">
          {calcAge(p.paciente.data_nascimento)}a · {p.internacao.diagnostico || "—"}
        </p>
      </div>
    </motion.div>
  );
}
