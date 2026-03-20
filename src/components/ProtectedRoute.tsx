import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, currentHospital, hospitals } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but hasn't selected a hospital yet
  if (!currentHospital && hospitals.length > 1) {
    return <Navigate to="/selecionar-hospital" replace />;
  }

  // No hospital links at all
  if (!currentHospital && hospitals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Você não está vinculado a nenhum hospital.
          </p>
          <p className="text-xs text-muted-foreground">
            Entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    );
  }

  // Role check
  if (allowedRoles && currentHospital && !allowedRoles.includes(currentHospital.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">Acesso negado</p>
          <p className="text-xs text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
