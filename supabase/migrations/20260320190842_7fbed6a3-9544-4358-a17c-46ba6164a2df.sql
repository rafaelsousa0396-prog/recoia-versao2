
CREATE TABLE public.evolucoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  internacao_id uuid NOT NULL REFERENCES public.internacoes(id) ON DELETE CASCADE,
  profissional_id uuid NOT NULL REFERENCES public.profiles(id),
  profissional_nome text NOT NULL,
  profissional_role text NOT NULL DEFAULT 'Médico',
  conteudo text NOT NULL,
  gerado_por_ia boolean NOT NULL DEFAULT false,
  input_ia text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.evolucoes ENABLE ROW LEVEL SECURITY;

-- Users can view evolutions from their hospitals
CREATE POLICY "Users can view evolutions from their hospitals"
ON public.evolucoes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.internacoes i
    WHERE i.id = evolucoes.internacao_id
    AND (is_super_admin(auth.uid()) OR has_hospital_access(auth.uid(), i.hospital_id))
  )
);

-- Authenticated users can insert evolutions for their hospitals
CREATE POLICY "Users can insert evolutions for their hospitals"
ON public.evolucoes FOR INSERT TO authenticated
WITH CHECK (
  profissional_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.internacoes i
    WHERE i.id = evolucoes.internacao_id
    AND (is_super_admin(auth.uid()) OR has_hospital_access(auth.uid(), i.hospital_id))
  )
);

CREATE INDEX idx_evolucoes_internacao ON public.evolucoes(internacao_id);
CREATE INDEX idx_evolucoes_created ON public.evolucoes(created_at DESC);
