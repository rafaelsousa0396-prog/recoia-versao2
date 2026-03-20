
-- Create setores table
CREATE TABLE public.setores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  nome text NOT NULL,
  numero_leitos integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, nome)
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.setores TO authenticated;

-- RLS policies
CREATE POLICY "Users can view sectors from their hospitals"
  ON public.setores FOR SELECT TO authenticated
  USING (is_super_admin(auth.uid()) OR has_hospital_access(auth.uid(), hospital_id));

CREATE POLICY "Admins can insert sectors"
  ON public.setores FOR INSERT TO authenticated
  WITH CHECK (is_super_admin(auth.uid()) OR (has_hospital_access(auth.uid(), hospital_id) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins can update sectors"
  ON public.setores FOR UPDATE TO authenticated
  USING (is_super_admin(auth.uid()) OR (has_hospital_access(auth.uid(), hospital_id) AND has_role(auth.uid(), 'admin'::app_role)));
