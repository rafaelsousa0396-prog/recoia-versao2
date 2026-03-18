import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import PatientRecord from "./pages/PatientRecord";
import BedManagement from "./pages/BedManagement";
import AIEvolution from "./pages/AIEvolution";
import ExamsView from "./pages/ExamsView";
import VitalsView from "./pages/VitalsView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-12 flex items-center border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                <SidebarTrigger className="ml-3" />
                <span className="ml-3 text-xs text-muted-foreground">Hospital Central • 18/03/2026</span>
              </header>
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pacientes" element={<Dashboard />} />
                  <Route path="/paciente/:id" element={<PatientRecord />} />
                  <Route path="/leitos" element={<BedManagement />} />
                  <Route path="/evolucao" element={<AIEvolution />} />
                  <Route path="/exames" element={<ExamsView />} />
                  <Route path="/vitais" element={<VitalsView />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
