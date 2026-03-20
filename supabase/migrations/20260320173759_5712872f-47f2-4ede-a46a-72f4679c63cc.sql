-- Create is_super_admin helper function
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hospitals
    WHERE user_id = _user_id AND role = 'super_admin' AND ativo = true
  )
$$;

-- Update hospitals SELECT policy to include super_admins
DROP POLICY IF EXISTS "Users can view their hospitals" ON public.hospitals;
CREATE POLICY "Users can view their hospitals"
ON public.hospitals
FOR SELECT
TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_hospitals uh
    WHERE uh.hospital_id = hospitals.id AND uh.user_id = auth.uid() AND uh.ativo = true
  )
);

-- Super admins can manage hospitals
CREATE POLICY "Super admins can insert hospitals"
ON public.hospitals FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update hospitals"
ON public.hospitals FOR UPDATE TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Update profiles SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_hospitals uh1
    JOIN public.user_hospitals uh2 ON uh1.hospital_id = uh2.hospital_id
    WHERE uh1.user_id = auth.uid()
    AND uh1.role = 'admin'
    AND uh1.ativo = true
    AND uh2.user_id = profiles.id
    AND uh2.ativo = true
  )
);

-- Update user_hospitals SELECT policy
DROP POLICY IF EXISTS "Users can view own hospital links" ON public.user_hospitals;
CREATE POLICY "Users can view hospital links"
ON public.user_hospitals FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_hospitals uh
    WHERE uh.hospital_id = user_hospitals.hospital_id
    AND uh.user_id = auth.uid()
    AND uh.role = 'admin'
    AND uh.ativo = true
  )
);