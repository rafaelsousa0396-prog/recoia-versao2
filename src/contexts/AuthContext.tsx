import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "super_admin" | "admin" | "medico" | "enfermagem" | "fisio" | "assistente_social" | "recepcao" | "farmacia";

interface Profile {
  id: string;
  nome: string;
  email: string;
  registro: string;
}

interface Hospital {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

interface UserHospitalLink {
  id: string;
  user_id: string;
  hospital_id: string;
  role: AppRole;
  ativo: boolean;
  hospital?: Hospital;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  hospitals: UserHospitalLink[];
  currentHospital: UserHospitalLink | null;
  currentRole: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, nome: string, registro: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  selectHospital: (hospitalLink: UserHospitalLink) => void;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hospitals, setHospitals] = useState<UserHospitalLink[]>([]);
  const [currentHospital, setCurrentHospital] = useState<UserHospitalLink | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  const fetchHospitals = useCallback(async (userId: string) => {
    const { data: links } = await supabase
      .from("user_hospitals")
      .select("*")
      .eq("user_id", userId)
      .eq("ativo", true);

    if (links && links.length > 0) {
      const hospitalIds = links.map((l: any) => l.hospital_id);
      const { data: hospitalData } = await supabase
        .from("hospitals")
        .select("*")
        .in("id", hospitalIds);

      const enriched = links.map((link: any) => ({
        ...link,
        hospital: hospitalData?.find((h: any) => h.id === link.hospital_id),
      }));

      setHospitals(enriched as UserHospitalLink[]);

      // Restore from sessionStorage
      const savedHospitalId = sessionStorage.getItem("current_hospital_id");
      if (savedHospitalId) {
        const saved = enriched.find((h: any) => h.hospital_id === savedHospitalId);
        if (saved) {
          setCurrentHospital(saved as UserHospitalLink);
          return;
        }
      }

      // Auto-select if only one
      if (enriched.length === 1) {
        setCurrentHospital(enriched[0] as UserHospitalLink);
        sessionStorage.setItem("current_hospital_id", enriched[0].hospital_id);
      }
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchHospitals(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setHospitals([]);
          setCurrentHospital(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchHospitals(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchHospitals]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, nome: string, registro: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, registro },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    sessionStorage.removeItem("current_hospital_id");
    await supabase.auth.signOut();
  };

  const selectHospital = (hospitalLink: UserHospitalLink) => {
    setCurrentHospital(hospitalLink);
    sessionStorage.setItem("current_hospital_id", hospitalLink.hospital_id);
  };

  const hasRole = (role: AppRole) => {
    if (!currentHospital) return false;
    return currentHospital.role === role;
  };

  const currentRole = currentHospital?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        hospitals,
        currentHospital,
        currentRole,
        loading,
        signIn,
        signUp,
        signOut,
        selectHospital,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
