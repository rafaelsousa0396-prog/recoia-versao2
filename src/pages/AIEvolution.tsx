import { useState } from "react";
import { Brain, Sparkles, Mic, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { patients } from "@/data/mockData";
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

export default function AIEvolution() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0].id);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const patient = patients.find((p) => p.id === selectedPatient)!;

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
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
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Evolução Clínica com IA</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Assistente inteligente para documentação clínica estruturada</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Paciente</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="clinical-input !w-auto !py-1.5 text-sm"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.bed}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Profissional</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="clinical-input !w-auto !py-1.5 text-sm"
          >
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Patient Context */}
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

      {/* Editor Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrada (tópicos ou texto livre)</label>
            <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              <Mic className="w-3.5 h-3.5" />
              Ditar
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="paciente afebril, dreno produtivo 50ml, diurese satisfatória, mantendo conduta..."
            className="clinical-input !border !border-border rounded-xl !px-4 !py-3 min-h-[200px] resize-none"
            rows={10}
          />
          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isGenerating ? "Gerando..." : "Gerar Evolução com IA"}
            </Button>
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Evolução Gerada</label>
            {generatedText && !isGenerating && (
              <button className="flex items-center gap-1 text-xs text-status-stable hover:text-status-stable/80 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Assinar e Salvar
              </button>
            )}
          </div>
          <div className="bg-card border rounded-xl p-4 min-h-[200px] clinical-shadow">
            <AnimatePresence>
              {generatedText ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap"
                >
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
