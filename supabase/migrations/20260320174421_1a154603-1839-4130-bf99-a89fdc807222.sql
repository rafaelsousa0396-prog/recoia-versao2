-- Fix user_hospitals SELECT policy - use security definer functions only
DROP POLICY IF EXISTS "Users can view hospital links" ON public.user_hospitals;
CREATE POLICY "Users can view hospital links"
ON public.user_hospitals FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_super_admin(auth.uid())
  OR public.has_hospital_access(auth.uid(), hospital_id)
);

-- Fix profiles SELECT policy - avoid referencing user_hospitals directly
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view hospital user profiles" ON public.profiles;

CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.is_super_admin(auth.uid())
);