import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Droplets, Thermometer, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { patients, evolutions, exams } from "@/data/mockData";
import { SparkLine } from "@/components/SparkLine";

export default function PatientRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Paciente não encontrado.</p>
        <button onClick={() => navigate("/")} className="text-primary text-sm mt-2 underline">Voltar</button>
      </div>
    );
  }

  const riskLabels = { high: "Alto", medium: "Moderado", stable: "Estável" };
  const riskClasses = { high: "risk-badge-high", medium: "risk-badge-medium", stable: "risk-badge-stable" };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
        <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">{patient.name}</h1>
            <span className={riskClasses[patient.risk]}>{riskLabels[patient.risk]}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {patient.age} anos · {patient.gender === "M" ? "Masculino" : "Feminino"} · Leito {patient.bed} · {patient.sector} · {patient.diagnosis}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Médico responsável</p>
          <p className="text-sm font-medium">{patient.doctor}</p>
        </div>
      </motion.div>

      {/* Vitals Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <VitalCard icon={Heart} label="FC" value={`${patient.vitals.fc[patient.vitals.fc.length - 1]}`} unit="bpm" data={patient.vitals.fc} danger={patient.vitals.fc[patient.vitals.fc.length - 1] > 100} />
        <VitalCard icon={Droplets} label="SpO₂" value={`${patient.vitals.satO2[patient.vitals.satO2.length - 1]}`} unit="%" data={patient.vitals.satO2} danger={patient.vitals.satO2[patient.vitals.satO2.length - 1] < 92} />
        <VitalCard icon={Activity} label="PA" value={patient.vitals.pa} unit="mmHg" />
        <VitalCard icon={Thermometer} label="Temp" value={`${patient.vitals.temp}`} unit="°C" danger={patient.vitals.temp > 37.5} />
      </motion.div>

      {/* Alerts */}
      {patient.alerts.length > 0 && (
        <div className="bg-risk-high/5 border border-risk-high/20 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-risk-high uppercase tracking-wider mb-2">Alertas Ativos</h3>
          <ul className="space-y-1">
            {patient.alerts.map((a, i) => (
              <li key={i} className="text-sm text-foreground">• {a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Evolutions */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Evoluções</h2>
          <div className="space-y-3">
            {evolutions.map((evo) => (
              <motion.div
                key={evo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border rounded-xl p-4 clinical-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{evo.professional}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{evo.role}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{evo.date} · {evo.time}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{evo.content}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Exams */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Exames Laboratoriais</h2>
          <div className="bg-card border rounded-xl clinical-shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Exame</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Resultado</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Referência</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exams.map((ex) => (
                  <tr key={ex.id} className={ex.status === "critical" ? "bg-risk-high/5" : ex.status === "altered" ? "bg-risk-medium/5" : ""}>
                    <td className="px-4 py-2 text-sm text-foreground">{ex.name}</td>
                    <td className="px-4 py-2 font-mono text-sm font-medium tracking-tight">
                      {ex.value} <span className="text-xs text-muted-foreground">{ex.unit}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{ex.reference}</td>
                    <td className="px-4 py-2">
                      <ExamStatus status={ex.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, unit, data, danger }: {
  icon: React.ElementType; label: string; value: string; unit: string; data?: number[]; danger?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-xl p-3 clinical-shadow ${danger ? "border-risk-high/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${danger ? "text-risk-high" : "text-muted-foreground"}`} />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        {data && <SparkLine data={data} color={danger ? "hsl(0, 72%, 51%)" : "hsl(200, 80%, 45%)"} width={60} height={20} />}
      </div>
      <p className={`vital-value mt-1 ${danger ? "text-risk-high" : "text-foreground"}`}>
        {value} <span className="text-xs text-muted-foreground font-sans">{unit}</span>
      </p>
    </div>
  );
}

function ExamStatus({ status }: { status: "normal" | "altered" | "critical" }) {
  const config = {
    normal: { label: "Normal", cls: "risk-badge-stable" },
    altered: { label: "Alterado", cls: "risk-badge-medium" },
    critical: { label: "Crítico", cls: "risk-badge-high" },
  };
  const c = config[status];
  return <span className={c.cls}>{c.label}</span>;
}
