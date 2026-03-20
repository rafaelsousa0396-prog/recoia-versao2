
-- 1. Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'medico', 'enfermagem', 'fisio', 'assistente_social', 'recepcao', 'farmacia');

-- 2. Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  registro TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User-Hospital junction table with role
CREATE TABLE public.user_hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'medico',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, hospital_id)
);

-- 5. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hospitals ENABLE ROW LEVEL SECURITY;

-- 6. Security definer function to check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hospitals
    WHERE user_id = _user_id AND role = _role AND ativo = true
  )
$$;

-- 7. Function to check hospital access
CREATE OR REPLACE FUNCTION public.has_hospital_access(_user_id UUID, _hospital_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hospitals
    WHERE user_id = _user_id AND hospital_id = _hospital_id AND ativo = true
  )
$$;

-- 8. Function to get user hospitals
CREATE OR REPLACE FUNCTION public.get_user_hospitals(_user_id UUID)
RETURNS SETOF public.user_hospitals
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.user_hospitals
  WHERE user_id = _user_id AND ativo = true
$$;

-- 9. RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- 10. RLS Policies for hospitals
CREATE POLICY "Users can view their hospitals"
  ON public.hospitals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_hospitals uh
      WHERE uh.hospital_id = hospitals.id
        AND uh.user_id = auth.uid()
        AND uh.ativo = true
    )
  );

-- 11. RLS Policies for user_hospitals
CREATE POLICY "Users can view own hospital links"
  ON public.user_hospitals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage hospital links"
  ON public.user_hospitals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_hospitals uh
      WHERE uh.hospital_id = user_hospitals.hospital_id
        AND uh.user_id = auth.uid()
        AND uh.role = 'admin'
        AND uh.ativo = true
    )
  );

-- 12. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, registro)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'registro', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
