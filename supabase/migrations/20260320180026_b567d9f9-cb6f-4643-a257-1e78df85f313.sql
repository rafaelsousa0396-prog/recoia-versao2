-- Grant table-level permissions for the new tables
GRANT SELECT, INSERT, UPDATE ON public.pacientes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.internacoes TO authenticated;