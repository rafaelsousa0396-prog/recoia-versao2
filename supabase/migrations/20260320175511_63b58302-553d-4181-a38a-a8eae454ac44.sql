-- Tabela de pacientes (cadastro único, sem vínculo direto com hospital)
CREATE TABLE public.pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text UNIQUE,
  data_nascimento date NOT NULL,
  sexo text NOT NULL CHECK (sexo IN ('M', 'F')),
  nome_mae text,
  telefone text,
  endereco text,
  cidade text,
  estado text,
  convenio text,
  numero_convenio text,
  contato_emergencia_nome text,
  contato_emergencia_telefone text,
  contato_emergencia_parentesco text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de internações (vinculada a UM hospital por vez)
CREATE TABLE public.internacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  leito text,
  setor text,
  diagnostico text,
  medico_responsavel_id uuid REFERENCES public.profiles(id),
  risco text NOT NULL DEFAULT 'estavel' CHECK (risco IN ('alto', 'moderado', 'estavel')),
  status text NOT NULL DEFAULT 'internado' CHECK (status IN ('internado', 'alta', 'uti', 'transferido', 'obito')),
  data_admissao timestamptz NOT NULL DEFAULT now(),
  data_alta timestamptz,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_internacoes_hospital ON public.internacoes(hospital_id);
CREATE INDEX idx_internacoes_paciente ON public.internacoes(paciente_id);
CREATE INDEX idx_internacoes_status ON public.internacoes(status);
CREATE INDEX idx_pacientes_cpf ON public.pacientes(cpf);

-- RLS para pacientes
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patients from their hospitals"
ON public.pacientes FOR SELECT TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.internacoes i
    WHERE i.paciente_id = pacientes.id
      AND public.has_hospital_access(auth.uid(), i.hospital_id)
  )
);

CREATE POLICY "Hospital users can insert patients"
ON public.pacientes FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Hospital users can update patients"
ON public.pacientes FOR UPDATE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.internacoes i
    WHERE i.paciente_id = pacientes.id
      AND public.has_hospital_access(auth.uid(), i.hospital_id)
  )
);

-- RLS para internações
ALTER TABLE public.internacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view admissions from their hospitals"
ON public.internacoes FOR SELECT TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR public.has_hospital_access(auth.uid(), hospital_id)
);

CREATE POLICY "Hospital users can insert admissions"
ON public.internacoes FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR public.has_hospital_access(auth.uid(), hospital_id)
);

CREATE POLICY "Hospital users can update admissions"
ON public.internacoes FOR UPDATE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR public.has_hospital_access(auth.uid(), hospital_id)
);