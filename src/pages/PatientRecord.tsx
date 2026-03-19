import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Heart, Droplets, Thermometer, Activity, Brain, FileText, ClipboardList, Pill, Clock, AlertTriangle, CheckCircle2 as Check2, Calendar, User } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { patients, evolutions, exams, prescriptions } from "@/data/mockData";
import { SparkLine } from "@/components/SparkLine";

const tabs = [
  { label: "Resumo", path: "", icon: ClipboardList },
  { label: "Evolução IA", path: "/evolucao", icon: Brain },
  { label: "Prescrições", path: "/prescricoes", icon: Pill },
  { label: "Exames", path: "/exames", icon: FileText },
  { label: "Sinais Vitais", path: "/vitais", icon: Activity },
];

export default function PatientRecord() {
  const { id, "*": subPath } = useParams();
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

  const currentTab = subPath || "";
  const riskLabels = { high: "Alto", medium: "Moderado", stable: "Estável" };
  const riskClasses = { high: "risk-badge-high", medium: "risk-badge-medium", stable: "risk-badge-stable" };
  const stayDays = differenceInDays(new Date(), parseISO(patient.admissionDate));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
        <button onClick={() => navigate("/pacientes")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
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
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            <span>Nascimento: {format(parseISO(patient.birthDate), "dd/MM/yyyy")}</span>
            <span>Internação: {format(parseISO(patient.admissionDate), "dd/MM/yyyy")} ({stayDays} {stayDays === 1 ? "dia" : "dias"})</span>
            <span>Mãe: {patient.motherName}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Médico responsável</p>
          <p className="text-sm font-medium">{patient.doctor}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.path.replace("/", "");
          return (
            <Link
              key={tab.path}
              to={`/paciente/${id}${tab.path}`}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      {currentTab === "" && <SummaryTab patient={patient} />}
      {currentTab === "evolucao" && <EvolutionTab patient={patient} />}
      {currentTab === "prescricoes" && <PrescriptionsTab patientId={patient.id} />}
      {currentTab === "exames" && <ExamsTab />}
      {currentTab === "vitais" && <VitalsTab patient={patient} />}
    </div>
  );
}

/* ============ SUMMARY TAB ============ */
function SummaryTab({ patient }: { patient: typeof patients[0] }) {
  return (
    <div className="space-y-6">
      {/* Vitals Strip */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Evoluções</h2>
          <div className="space-y-3">
            {evolutions.map((evo) => (
              <motion.div key={evo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border rounded-xl p-4 clinical-shadow">
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
                    <td className="px-4 py-2"><ExamStatus status={ex.status} /></td>
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

/* ============ EVOLUTION TAB ============ */
import { useState } from "react";
import { Sparkles, Mic, CheckCircle2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const roles = ["Médico", "Enfermagem", "Fisioterapia", "Assistente Social", "Psicologia", "Fonoaudiologia", "Farmácia"];

const aiSuggestion = `Paciente no 3º dia de internação em UTI, mantendo quadro séptico de foco pulmonar. Apresenta-se sonolento, responsivo a estímulos verbais. Hemodinamicamente instável em uso de noradrenalina 0.3 mcg/kg/min.

**Exame Físico:**
- Neurológico: Glasgow 13 (O3V4M6), pupilas isocóricas e fotorreagentes
- Respiratório: Em VMI, modo PCV, FiO2 60%, PEEP 10. MV diminuído em base D com crepitações bilaterais
- Cardiovascular: RCR 2T, BNF, sem sopros. PAM 62 mmHg com DVA
- Abdome: Flácido, RHA presentes, sem sinais de irritação peritoneal
- Extremidades: Edema 2+/4+ em MMII, perfusão periférica lentificada

**Conduta:**
1. Escalonar antibioticoterapia para Meropenem conforme antibiograma
2. Manter drogas vasoativas com meta PAM > 65 mmHg
3. Controle de lactato em 6h
4. Manter balanço hídrico neutro — avaliar furosemida se necessário
5. Solicitar novo hemograma + PCR + procalcitonina em 12h`;

function EvolutionTab({ patient }: { patient: typeof patients[0] }) {
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    let i = 0;
    const text = aiSuggestion;
    const interval = setInterval(() => {
      setGeneratedText(text.slice(0, i));
      i += 3;
      if (i > text.length) {
        clearInterval(interval);
        setGeneratedText(text);
        setIsGenerating(false);
      }
    }, 10);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Evolução Clínica com IA</h2>
          <p className="text-xs text-muted-foreground">Assistente inteligente para documentação clínica estruturada</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Profissional</label>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="clinical-input !w-auto !py-1.5 text-sm">
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-clinical-muted border border-primary/10 rounded-xl p-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Contexto do Paciente</p>
        <p className="text-sm text-foreground">
          <strong>{patient.name}</strong>, {patient.age} anos, {patient.gender === "M" ? "masculino" : "feminino"}.
          Leito {patient.bed} ({patient.sector}). Diagnóstico: {patient.diagnosis}.
          Risco: {patient.risk === "high" ? "Alto" : patient.risk === "medium" ? "Moderado" : "Estável"}.
        </p>
        {patient.alerts.length > 0 && (
          <div className="mt-2 text-xs text-risk-high">
            {patient.alerts.map((a, i) => <p key={i}>⚠ {a}</p>)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrada (tópicos ou texto livre)</label>
            <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              <Mic className="w-3.5 h-3.5" /> Ditar
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="paciente afebril, dreno produtivo 50ml, diurese satisfatória, mantendo conduta..."
            className="clinical-input !border !border-border rounded-xl !px-4 !py-3 min-h-[200px] resize-none"
            rows={10}
          />
          <div className="mt-3">
            <Button onClick={handleGenerate} disabled={isGenerating} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isGenerating ? "Gerando..." : "Gerar Evolução com IA"}
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Evolução Gerada</label>
            {generatedText && !isGenerating && (
              <button className="flex items-center gap-1 text-xs text-status-stable hover:text-status-stable/80 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Assinar e Salvar
              </button>
            )}
          </div>
          <div className="bg-card border rounded-xl p-4 min-h-[200px] clinical-shadow">
            <AnimatePresence>
              {generatedText ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {generatedText}
                  {isGenerating && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse-clinical" />}
                </motion.div>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">
                  A evolução gerada pela IA aparecerá aqui. Insira tópicos à esquerda e clique em "Gerar".
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ PRESCRIPTIONS TAB ============ */
function PrescriptionsTab({ patientId }: { patientId: string }) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patientId);
  const filtered = patientPrescriptions.filter((p) =>
    filter === "all" ? true : filter === "active" ? p.status === "active" : p.status === "completed" || p.status === "suspended"
  );

  const categoryColors: Record<string, string> = {
    antibiotic: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    analgesic: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    cardiovascular: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    fluid: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    other: "bg-secondary text-muted-foreground border-border",
  };

  const categoryLabels: Record<string, string> = {
    antibiotic: "Antibiótico",
    analgesic: "Analgésico",
    cardiovascular: "Cardiovascular",
    fluid: "Hidratação",
    other: "Outros",
  };

  const statusConfig = {
    active: { label: "Ativo", cls: "risk-badge-stable" },
    suspended: { label: "Suspenso", cls: "risk-badge-medium" },
    completed: { label: "Concluído", cls: "bg-secondary text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-medium" },
  };

  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, "0")}:00`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Prescrições Médicas</h2>
            <p className="text-xs text-muted-foreground">Medicamentos, dosagens e aprazamento</p>
          </div>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {(["active", "all", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "active" ? "Ativos" : f === "all" ? "Todos" : "Concluídos"}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Timeline */}
      {filter !== "completed" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-4 clinical-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Aprazamento — Próximos Horários</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {["06:00", "08:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map((time) => {
              const medsAtTime = filtered.filter((p) => p.status === "active" && p.schedule.includes(time));
              const isPast = time < currentHour;
              return (
                <div key={time} className={`rounded-lg border p-2 text-center ${isPast ? "opacity-50" : ""} ${medsAtTime.length > 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                  <p className="text-[10px] font-mono font-semibold text-muted-foreground">{time}</p>
                  {medsAtTime.length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                      {medsAtTime.map((m) => (
                        <p key={m.id} className="text-[10px] text-foreground truncate" title={`${m.medication} ${m.dose}`}>
                          {m.medication.split(" ")[0]}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/40 mt-1">—</p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Medication List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Nenhuma prescrição encontrada.</div>
        ) : (
          filtered.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-card border rounded-xl p-4 clinical-shadow ${rx.status === "completed" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{rx.medication}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${categoryColors[rx.category]}`}>
                      {categoryLabels[rx.category]}
                    </span>
                    <span className={statusConfig[rx.status].cls}>{statusConfig[rx.status].label}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase">Dose</span>
                      <p className="text-sm font-mono font-medium text-foreground">{rx.dose}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase">Via</span>
                      <p className="text-sm text-foreground">{rx.route}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase">Frequência</span>
                      <p className="text-sm text-foreground">{rx.frequency}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase">Horários</span>
                      <p className="text-sm font-mono text-foreground">
                        {rx.schedule.length > 0 ? rx.schedule.join(" · ") : "Contínuo"}
                      </p>
                    </div>
                  </div>
                  {rx.notes && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground italic">{rx.notes}</p>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground">{rx.prescribedBy}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {rx.startDate}{rx.endDate ? ` → ${rx.endDate}` : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============ EXAMS TAB ============ */
function ExamsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Exames Laboratoriais</h2>
          <p className="text-xs text-muted-foreground">Resultados com destaque automático para valores alterados</p>
        </div>
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
                  <ExamStatus status={ex.status} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ VITALS TAB ============ */
function VitalsTab({ patient }: { patient: typeof patients[0] }) {
  const vitalsData = [
    { icon: Heart, label: "Frequência Cardíaca", value: patient.vitals.fc[patient.vitals.fc.length - 1], unit: "bpm", data: patient.vitals.fc, danger: patient.vitals.fc[patient.vitals.fc.length - 1] > 100 },
    { icon: Droplets, label: "Saturação O₂", value: patient.vitals.satO2[patient.vitals.satO2.length - 1], unit: "%", data: patient.vitals.satO2, danger: patient.vitals.satO2[patient.vitals.satO2.length - 1] < 92 },
    { icon: Activity, label: "Pressão Arterial", value: patient.vitals.pa, unit: "mmHg", data: undefined, danger: false },
    { icon: Thermometer, label: "Temperatura", value: patient.vitals.temp, unit: "°C", data: undefined, danger: patient.vitals.temp > 37.5 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sinais Vitais</h2>
          <p className="text-xs text-muted-foreground">Monitoramento contínuo com tendências</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vitalsData.map((v, i) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card border rounded-xl p-5 clinical-shadow ${v.danger ? "border-risk-high/30" : ""}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <v.icon className={`w-4 h-4 ${v.danger ? "text-risk-high" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{v.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <p className={`vital-value text-3xl ${v.danger ? "text-risk-high" : "text-foreground"}`}>
                {v.value} <span className="text-sm text-muted-foreground font-sans">{v.unit}</span>
              </p>
              {v.data && <SparkLine data={v.data} color={v.danger ? "hsl(0, 72%, 51%)" : "hsl(200, 80%, 45%)"} width={120} height={40} />}
            </div>
            {v.data && (
              <div className="mt-3 flex gap-2 text-[10px] text-muted-foreground">
                {v.data.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="font-mono">{val}</span>
                    <span>{idx}h</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ SHARED COMPONENTS ============ */
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
