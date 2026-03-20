import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { User, Building2, LogOut } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientRecord from "./pages/PatientRecord";
import BedManagement from "./pages/BedManagement";
import Login from "./pages/Login";
import SelectHospital from "./pages/SelectHospital";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LiveClock() {
  const [now, setNow] = useState(new Date());
  const { currentHospital, profile, signOut, hospitals } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = now.toLocaleDateString("pt-BR");
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const hospitalName = currentHospital?.hospital?.nome || "Hospital";
  const initials = profile?.nome?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "U";
  const roleName = currentHospital?.role?.replace("_", " ") || "";

  return (
    <div className="flex items-center gap-3 w-full justify-between">
      <span className="text-xs text-muted-foreground">{hospitalName} • {date} • {time}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[10px] font-semibold text-muted-foreground">{initials}</span>
            </div>
            <span className="text-xs font-medium text-foreground">{profile?.nome}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">{profile?.nome}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
              {roleName && (
                <p className="text-[10px] text-muted-foreground capitalize">{roleName}</p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 cursor-pointer" disabled>
            <User className="w-4 h-4" />
            Meu Perfil
          </DropdownMenuItem>
          {hospitals.length > 1 && (
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => {
                sessionStorage.removeItem("current_hospital_id");
                navigate("/selecionar-hospital");
              }}
            >
              <Building2 className="w-4 h-4" />
              Trocar Hospital
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 px-4">
            <div className="flex items-center gap-2 w-full">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary-foreground">HC</span>
              </div>
              <LiveClock />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pacientes" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
              <Route path="/paciente/:id/*" element={<ProtectedRoute><PatientRecord /></ProtectedRoute>} />
              <Route path="/leitos" element={<ProtectedRoute><BedManagement /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/selecionar-hospital" element={<SelectHospital />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
