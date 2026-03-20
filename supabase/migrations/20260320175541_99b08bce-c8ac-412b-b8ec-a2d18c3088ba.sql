-- Fix overly permissive INSERT policy on pacientes
DROP POLICY IF EXISTS "Hospital users can insert patients" ON public.pacientes;

CREATE POLICY "Hospital users can insert patients"
ON public.pacientes FOR INSERT TO authenticated
WITH CHECK (
  -- User must have access to at least one active hospital
  public.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_hospitals uh
    WHERE uh.user_id = auth.uid() AND uh.ativo = true
  )
);