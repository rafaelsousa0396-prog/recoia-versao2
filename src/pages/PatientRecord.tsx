import React, { useState, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Brain, FileText, ClipboardList, Pill, Activity, ChevronRight, Sparkles, CheckCircle2, Calendar, User } from "lucide-react";
import { differenceInDays, differenceInYears, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInternacao } from "@/hooks/usePacientes";
import { useEvolucoes, useCreateEvolucao } from "@/hooks/useEvolucoes";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const tabs = [
  { label: "Resumo", path: "", icon: ClipboardList },
  { label: "Evolução IA", path: "/evolucao", icon: Brain },
  { label: "Prescrições", path: "/prescricoes", icon: Pill },
  { label: "Exames", path: "/exames", icon: FileText },
  { label: "Sinais Vitais", path: "/vitais", icon: Activity },
];

const riskLabelsMap: Record<string, string> = { alto: "Alto", moderado: "Moderado", estavel: "Estável" };
const riskClasses: Record<string, string> = { alto: "risk-badge-high", moderado: "risk-badge-medium", estavel: "risk-badge-stable" };

export default function PatientRecord() {
  const { id, "*": subPath } = useParams();
  const navigate = useNavigate();
  const { data: internacao, isLoading } = useInternacao(id);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="text-sm">Carregando prontuário...</p>
      </div>
    );
  }

  if (!internacao) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Paciente não encontrado.</p>
        <button onClick={() => navigate("/pacientes")} className="text-primary text-sm mt-2 underline">Voltar</button>
      </div>
    );
  }

  const paciente = (internacao as any).paciente;
  const medicoNome = (internacao as any).medico_responsavel?.nome;
  const currentTab = subPath || "";
  const stayDays = differenceInDays(new Date(), parseISO(internacao.data_admissao));
  const age = differenceInYears(new Date(), new Date(paciente.data_nascimento));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
        <button onClick={() => navigate("/pacientes")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">{paciente.nome}</h1>
            <span className="text-xs text-muted-foreground font-normal">
              {internacao.leito ? `Leito ${internacao.leito}` : "Sem leito"} · {internacao.setor || "Sem setor"}
            </span>
            <span className={riskClasses[internacao.risco] || ""}>{riskLabelsMap[internacao.risco] || internacao.risco}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {age} anos · Nasc. {format(new Date(paciente.data_nascimento), "dd/MM/yyyy")} · {paciente.sexo === "M" ? "Masculino" : "Feminino"}
            {paciente.nome_mae ? ` · Mãe: ${paciente.nome_mae}` : ""}
            {" "}· Internação {format(parseISO(internacao.data_admissao), "dd/MM/yyyy")} ({stayDays} {stayDays === 1 ? "dia" : "dias"})
            {internacao.diagnostico ? ` · ${internacao.diagnostico}` : ""}
          </p>
        </div>
        {medicoNome && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Médico responsável</p>
            <p className="text-sm font-medium">{medicoNome}</p>
          </div>
        )}
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
      {currentTab === "" && <SummaryTab internacao={internacao} paciente={paciente} />}
      {currentTab === "evolucao" && <EvolutionTab internacaoId={internacao.id} paciente={paciente} internacao={internacao} />}
      {currentTab === "prescricoes" && <PrescriptionsTab />}
      {currentTab === "exames" && <ExamsTab />}
      {currentTab === "vitais" && <VitalsTab />}
    </div>
  );
}

/* ============ SUMMARY TAB ============ */
function SummaryTab({ internacao, paciente }: { internacao: any; paciente: any }) {
  const age = differenceInYears(new Date(), new Date(paciente.data_nascimento));

  return (
    <div className="space-y-6">
      {/* Patient info cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-4 clinical-shadow space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados Pessoais</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <InfoRow label="Nome" value={paciente.nome} />
            <InfoRow label="Idade" value={`${age} anos`} />
            <InfoRow label="Sexo" value={paciente.sexo === "M" ? "Masculino" : "Feminino"} />
            <InfoRow label="CPF" value={paciente.cpf} />
            <InfoRow label="Telefone" value={paciente.telefone} />
            <InfoRow label="Convênio" value={paciente.convenio} />
            <InfoRow label="Endereço" value={paciente.endereco} />
            <InfoRow label="Cidade/UF" value={[paciente.cidade, paciente.estado].filter(Boolean).join(" / ") || null} />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4 clinical-shadow space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados da Internação</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <InfoRow label="Setor" value={internacao.setor} />
            <InfoRow label="Leito" value={internacao.leito} />
            <InfoRow label="Diagnóstico" value={internacao.diagnostico} />
            <InfoRow label="Status" value={internacao.status} />
            <InfoRow label="Risco" value={riskLabelsMap[internacao.risco] || internacao.risco} />
            <InfoRow label="Admissão" value={format(parseISO(internacao.data_admissao), "dd/MM/yyyy")} />
          </div>
          {internacao.observacoes && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Observações</p>
              <p className="text-sm text-foreground/80">{internacao.observacoes}</p>
            </div>
          )}
        </div>
      </motion.div>

      {paciente.contato_emergencia_nome && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border rounded-xl p-4 clinical-shadow">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contato de Emergência</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <InfoRow label="Nome" value={paciente.contato_emergencia_nome} />
            <InfoRow label="Telefone" value={paciente.contato_emergencia_telefone} />
            <InfoRow label="Parentesco" value={paciente.contato_emergencia_parentesco} />
          </div>
        </motion.div>
      )}

      {/* Placeholder for future features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderSection title="Evoluções" message="Nenhuma evolução registrada ainda." />
        <PlaceholderSection title="Exames Laboratoriais" message="Nenhum exame registrado ainda." />
      </div>
    </div>
  );
}


function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

function PlaceholderSection({ title, message }: { title: string; message: string }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h2>
      <div className="bg-card border rounded-xl p-6 clinical-shadow text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-evolution`;

const roleDisplayMap: Record<string, string> = {
  medico: "Médico",
  enfermagem: "Enfermagem",
  fisio: "Fisioterapia",
  assistente_social: "Assistente Social",
  farmacia: "Farmácia",
  admin: "Administrador",
  super_admin: "Administrador",
  recepcao: "Recepção",
};

function EvolutionTab({ internacaoId, paciente, internacao }: { internacaoId: string; paciente: any; internacao: any }) {
  const { data: evolucoes = [], isLoading } = useEvolucoes(internacaoId);
  const createEvolucao = useCreateEvolucao();
  const { currentRole } = useAuth();
  const userRoleDisplay = roleDisplayMap[currentRole || "medico"] || "Médico";
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [evoRoleFilter, setEvoRoleFilter] = useState("Todos");
  const generatedRef = useRef<HTMLDivElement>(null);

  const age = differenceInYears(new Date(), new Date(paciente.data_nascimento));
  const patientContext = `${paciente.nome}, ${age} anos, ${paciente.sexo === "M" ? "masculino" : "feminino"}. Setor: ${internacao.setor || "N/A"}. Leito: ${internacao.leito || "N/A"}. Diagnóstico: ${internacao.diagnostico || "N/A"}. Risco: ${internacao.risco}.`;

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error("Insira tópicos ou texto para gerar a evolução");
      return;
    }
    setIsGenerating(true);
    setGeneratedText("");

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ input: inputText, patientContext, role: userRoleDisplay }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      if (!resp.body) throw new Error("Stream não disponível");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setGeneratedText(fullText);
            }
          } catch { /* partial chunk */ }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar evolução");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedText.trim()) return;
    try {
      await createEvolucao.mutateAsync({
        internacaoId,
        conteudo: generatedText,
        role: userRoleDisplay,
        geradoPorIa: true,
        inputIa: inputText,
      });
      toast.success("Evolução salva com sucesso");
      setGeneratedText("");
      setInputText("");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar evolução");
    }
  };

  const handleSaveManual = async () => {
    if (!inputText.trim()) {
      toast.error("Insira o texto da evolução");
      return;
    }
    try {
      await createEvolucao.mutateAsync({
        internacaoId,
        conteudo: inputText,
        role: selectedRole,
        geradoPorIa: false,
      });
      toast.success("Evolução salva com sucesso");
      setInputText("");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar evolução");
    }
  };

  const filteredEvolucoes = evoRoleFilter === "Todos"
    ? evolucoes
    : evolucoes.filter(e => e.profissional_role === evoRoleFilter);

  const evolucoesByDate = filteredEvolucoes.reduce<Record<string, typeof evolucoes>>((acc, evo) => {
    const date = format(parseISO(evo.created_at), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(evo);
    return acc;
  }, {});

  const sortedDates = Object.keys(evolucoesByDate).sort((a, b) => b.localeCompare(a));
  const [openDates, setOpenDates] = useState<string[]>(() => sortedDates.length > 0 ? [sortedDates[0]] : []);

  const evoRoles = ["Todos", ...Array.from(new Set(evolucoes.map(e => e.profissional_role)))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Evolução Clínica com IA</h2>
          <p className="text-xs text-muted-foreground">Assistente inteligente para documentação clínica estruturada</p>
        </div>
      </div>

      {/* Role selector */}
      <div className="flex items-center gap-3">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Perfil profissional:</label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map(r => (
              <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrada (tópicos ou texto livre)</label>
          </div>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="paciente afebril, dreno produtivo 50ml, diurese satisfatória, mantendo conduta..."
            className="min-h-[200px] resize-none text-sm"
            rows={10}
          />
          <div className="mt-3 flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-1.5">
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Gerando..." : "Gerar com IA"}
            </Button>
            <Button variant="outline" onClick={handleSaveManual} disabled={createEvolucao.isPending} className="gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Salvar Manual
            </Button>
          </div>
        </div>

        {/* Generated output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Evolução Gerada</label>
            {generatedText && !isGenerating && (
              <button
                onClick={handleSave}
                disabled={createEvolucao.isPending}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {createEvolucao.isPending ? "Salvando..." : "Assinar e Salvar"}
              </button>
            )}
          </div>
          <div ref={generatedRef} className="bg-card border rounded-xl p-4 min-h-[200px] clinical-shadow overflow-y-auto max-h-[400px]">
            {generatedText ? (
              <div className="prose prose-sm max-w-none text-foreground/90">
                <ReactMarkdown>{generatedText}</ReactMarkdown>
                {isGenerating && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">
                A evolução gerada pela IA aparecerá aqui. Insira tópicos à esquerda e clique em "Gerar com IA".
              </p>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Histórico de Evoluções</h3>
          {evoRoles.length > 1 && (
            <Select value={evoRoleFilter} onValueChange={setEvoRoleFilter}>
              <SelectTrigger className={cn("w-[160px] h-8 text-xs", evoRoleFilter !== "Todos" && "border-primary text-primary")}>
                <User className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {evoRoles.map(r => (
                  <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Carregando evoluções...</p>
        ) : sortedDates.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 italic text-center py-6">Nenhuma evolução registrada ainda.</p>
        ) : (
          sortedDates.map(date => {
            const isOpen = openDates.includes(date);
            return (
              <div key={date}>
                <button
                  onClick={() => setOpenDates(prev =>
                    prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
                  )}
                  className="flex items-center gap-2 w-full py-2 px-3 rounded-lg hover:bg-secondary/60 transition-colors"
                >
                  <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-90")} />
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    {format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {evolucoesByDate[date].length} {evolucoesByDate[date].length === 1 ? "registro" : "registros"}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 ml-5 border-l-2 border-border pl-4 pt-2 pb-1">
                        {evolucoesByDate[date]
                          .sort((a, b) => b.created_at.localeCompare(a.created_at))
                          .map(evo => (
                            <motion.div
                              key={evo.id}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-card border rounded-xl p-4 clinical-shadow"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-foreground">{evo.profissional_nome}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{evo.profissional_role}</span>
                                  {evo.gerado_por_ia && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" /> IA
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  {format(parseISO(evo.created_at), "HH:mm")}
                                </span>
                              </div>
                              <div className="prose prose-sm max-w-none text-foreground/90">
                                <ReactMarkdown>{evo.conteudo}</ReactMarkdown>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ============ PRESCRIPTIONS TAB ============ */
function PrescriptionsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prescrições</h2>
      <div className="bg-card border rounded-xl p-6 clinical-shadow text-center">
        <p className="text-sm text-muted-foreground">Nenhuma prescrição registrada ainda.</p>
      </div>
    </div>
  );
}

/* ============ EXAMS TAB ============ */
function ExamsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exames</h2>
      <div className="bg-card border rounded-xl p-6 clinical-shadow text-center">
        <p className="text-sm text-muted-foreground">Nenhum exame registrado ainda.</p>
      </div>
    </div>
  );
}

/* ============ VITALS TAB ============ */
function VitalsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sinais Vitais</h2>
      <div className="bg-card border rounded-xl p-6 clinical-shadow text-center">
        <p className="text-sm text-muted-foreground">Nenhum registro de sinais vitais ainda.</p>
      </div>
    </div>
  );
}
