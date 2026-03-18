import { useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { patients, exams } from "@/data/mockData";

export default function ExamsView() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0].id);
  const patient = patients.find((p) => p.id === selectedPatient)!;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Exames Laboratoriais</h1>
            <p className="text-xs text-muted-foreground">Resultados com destaque automático para valores alterados</p>
          </div>
        </div>
        <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="clinical-input !w-auto !py-1 text-xs">
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="bg-card border rounded-xl clinical-shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Exame</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Resultado</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Referência</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {exams.map((ex, i) => (
              <motion.tr
                key={ex.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={ex.status === "critical" ? "bg-risk-high/5" : ex.status === "altered" ? "bg-risk-medium/5" : ""}
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground">{ex.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{ex.date}</td>
                <td className="px-4 py-3 font-mono text-sm font-semibold tracking-tight">
                  {ex.value} <span className="text-xs text-muted-foreground font-normal">{ex.unit}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{ex.reference}</td>
                <td className="px-4 py-3">
                  <span className={ex.status === "critical" ? "risk-badge-high" : ex.status === "altered" ? "risk-badge-medium" : "risk-badge-stable"}>
                    {ex.status === "critical" ? "Crítico" : ex.status === "altered" ? "Alterado" : "Normal"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
