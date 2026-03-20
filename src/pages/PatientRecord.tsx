import React, { useState, useMemo, useRef } from "react";
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

/* ============ EVOLUTION TAB ============ */
import { Sparkles, Mic, CheckCircle2 } from "lucide-react";

function EvolutionTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Evolução Clínica com IA</h2>
          <p className="text-xs text-muted-foreground">Assistente inteligente para documentação clínica estruturada</p>
        </div>
      </div>
      <div className="bg-card border rounded-xl p-6 clinical-shadow text-center">
        <p className="text-sm text-muted-foreground">Módulo de evolução IA em desenvolvimento.</p>
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
