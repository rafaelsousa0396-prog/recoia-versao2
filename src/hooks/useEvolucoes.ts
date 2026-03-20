import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Evolucao {
  id: string;
  internacao_id: string;
  profissional_id: string;
  profissional_nome: string;
  profissional_role: string;
  conteudo: string;
  gerado_por_ia: boolean;
  input_ia: string | null;
  created_at: string;
}

export function useEvolucoes(internacaoId: string | undefined) {
  return useQuery({
    queryKey: ["evolucoes", internacaoId],
    queryFn: async (): Promise<Evolucao[]> => {
      if (!internacaoId) return [];
      const { data, error } = await supabase
        .from("evolucoes")
        .select("*")
        .eq("internacao_id", internacaoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Evolucao[];
    },
    enabled: !!internacaoId,
  });
}

export function useCreateEvolucao() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      internacaoId,
      conteudo,
      role,
      geradoPorIa,
      inputIa,
    }: {
      internacaoId: string;
      conteudo: string;
      role: string;
      geradoPorIa: boolean;
      inputIa?: string;
    }) => {
      if (!profile) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("evolucoes").insert({
        internacao_id: internacaoId,
        profissional_id: profile.id,
        profissional_nome: profile.nome,
        profissional_role: role,
        conteudo,
        gerado_por_ia: geradoPorIa,
        input_ia: inputIa || null,
      });

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["evolucoes", vars.internacaoId] });
    },
  });
}
