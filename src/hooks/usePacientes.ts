import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string;
  sexo: "M" | "F";
  nome_mae: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  convenio: string | null;
  numero_convenio: string | null;
  contato_emergencia_nome: string | null;
  contato_emergencia_telefone: string | null;
  contato_emergencia_parentesco: string | null;
}

export interface Internacao {
  id: string;
  paciente_id: string;
  hospital_id: string;
  leito: string | null;
  setor: string | null;
  diagnostico: string | null;
  medico_responsavel_id: string | null;
  risco: "alto" | "moderado" | "estavel";
  status: "internado" | "alta" | "uti" | "transferido" | "obito";
  data_admissao: string;
  data_alta: string | null;
  observacoes: string | null;
  paciente?: Paciente;
  medico_responsavel?: { id: string; nome: string };
}

export interface PacienteInternado {
  internacao: Internacao;
  paciente: Paciente;
  medicoNome: string | null;
}

export function useInternacoesAtivas() {
  const { currentHospital } = useAuth();
  const hospitalId = currentHospital?.hospital_id;

  return useQuery({
    queryKey: ["internacoes-ativas", hospitalId],
    queryFn: async (): Promise<PacienteInternado[]> => {
      if (!hospitalId) return [];

      const { data, error } = await supabase
        .from("internacoes")
        .select(`
          *,
          paciente:pacientes(*),
          medico_responsavel:profiles!internacoes_medico_responsavel_id_fkey(id, nome)
        `)
        .eq("hospital_id", hospitalId)
        .in("status", ["internado", "uti"])
        .order("data_admissao", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        internacao: row,
        paciente: row.paciente,
        medicoNome: row.medico_responsavel?.nome ?? null,
      }));
    },
    enabled: !!hospitalId,
  });
}

export function useInternacao(internacaoId: string | undefined) {
  return useQuery({
    queryKey: ["internacao", internacaoId],
    queryFn: async () => {
      if (!internacaoId) return null;

      const { data, error } = await supabase
        .from("internacoes")
        .select(`
          *,
          paciente:pacientes(*),
          medico_responsavel:profiles!internacoes_medico_responsavel_id_fkey(id, nome)
        `)
        .eq("id", internacaoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!internacaoId,
  });
}

export function useSetores() {
  const { currentHospital } = useAuth();
  const hospitalId = currentHospital?.hospital_id;

  return useQuery({
    queryKey: ["setores", hospitalId],
    queryFn: async (): Promise<string[]> => {
      if (!hospitalId) return [];

      const { data, error } = await supabase
        .from("internacoes")
        .select("setor")
        .eq("hospital_id", hospitalId)
        .in("status", ["internado", "uti"])
        .not("setor", "is", null);

      if (error) throw error;
      const setores = [...new Set((data || []).map((d: any) => d.setor).filter(Boolean))];
      return ["Todos", ...setores.sort()];
    },
    enabled: !!hospitalId,
  });
}

export function useMedicos() {
  const { currentHospital } = useAuth();
  const hospitalId = currentHospital?.hospital_id;

  return useQuery({
    queryKey: ["medicos", hospitalId],
    queryFn: async (): Promise<string[]> => {
      if (!hospitalId) return [];

      const { data, error } = await supabase
        .from("internacoes")
        .select("medico_responsavel:profiles!internacoes_medico_responsavel_id_fkey(nome)")
        .eq("hospital_id", hospitalId)
        .in("status", ["internado", "uti"])
        .not("medico_responsavel_id", "is", null);

      if (error) throw error;
      const nomes = [...new Set((data || []).map((d: any) => d.medico_responsavel?.nome).filter(Boolean))];
      return ["Todos", ...nomes.sort()];
    },
    enabled: !!hospitalId,
  });
}
