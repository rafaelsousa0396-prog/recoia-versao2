-- Grant table access to authenticated users
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_hospitals TO authenticated;
GRANT SELECT ON public.hospitals TO authenticated;

-- Drop the recursive admin policy
DROP POLICY IF EXISTS "Admins can manage hospital links" ON public.user_hospitals;

-- Recreate admin policy using the security definer function to avoid recursion
CREATE POLICY "Admins can manage hospital links"
ON public.user_hospitals
FOR ALL
TO authenticated
USING (
  public.has_hospital_access(auth.uid(), hospital_id)
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_hospital_access(auth.uid(), hospital_id)
  AND public.has_role(auth.uid(), 'admin')
);