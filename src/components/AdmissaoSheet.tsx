import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X, UserPlus, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { sectorAbbrev, bedLabel } from "@/lib/bedUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const admissaoSchema = z.object({
  // Paciente
  nome: z.string().min(3, "Mínimo 3 caracteres").max(100),
  cpf: z.string().optional(),
  data_nascimento: z.date({ required_error: "Data de nascimento obrigatória" }),
  sexo: z.enum(["M", "F"], { required_error: "Selecione o sexo" }),
  nome_mae: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  convenio: z.string().optional(),
  numero_convenio: z.string().optional(),
  contato_emergencia_nome: z.string().optional(),
  contato_emergencia_telefone: z.string().optional(),
  contato_emergencia_parentesco: z.string().optional(),
  // Internação
  leito: z.string().optional(),
  setor: z.string().optional(),
  diagnostico: z.string().optional(),
  risco: z.enum(["alto", "moderado", "estavel"]).default("estavel"),
  status: z.enum(["internado", "uti"]).default("internado"),
  observacoes: z.string().optional(),
});

type AdmissaoForm = z.infer<typeof admissaoSchema>;

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

type Setor = { id: string; nome: string; numero_leitos: number; ativo: boolean };

export function AdmissaoSheet() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [setoresHospital, setSetoresHospital] = useState<Setor[]>([]);
  const [availableBeds, setAvailableBeds] = useState<string[]>([]);
  const { currentHospital } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentHospital?.hospital_id) return;
    supabase
      .from("setores")
      .select("id, nome, numero_leitos, ativo")
      .eq("hospital_id", currentHospital.hospital_id)
      .eq("ativo", true)
      .order("nome")
      .then(({ data }) => setSetoresHospital((data as Setor[]) || []));
  }, [currentHospital?.hospital_id]);

  const form = useForm<AdmissaoForm>({
    resolver: zodResolver(admissaoSchema),
    defaultValues: {
      nome: "",
      sexo: undefined,
      risco: "estavel",
      status: "internado",
    },
  });

  const onSubmit = async (data: AdmissaoForm) => {
    if (!currentHospital) {
      toast.error("Nenhum hospital selecionado");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Criar paciente
      const { data: paciente, error: pacError } = await supabase
        .from("pacientes")
        .insert({
          nome: data.nome,
          cpf: data.cpf || null,
          data_nascimento: format(data.data_nascimento, "yyyy-MM-dd"),
          sexo: data.sexo,
          nome_mae: data.nome_mae || null,
          telefone: data.telefone || null,
          endereco: data.endereco || null,
          cidade: data.cidade || null,
          estado: data.estado || null,
          convenio: data.convenio || null,
          numero_convenio: data.numero_convenio || null,
          contato_emergencia_nome: data.contato_emergencia_nome || null,
          contato_emergencia_telefone: data.contato_emergencia_telefone || null,
          contato_emergencia_parentesco: data.contato_emergencia_parentesco || null,
        })
        .select("id")
        .single();

      if (pacError) throw pacError;

      // 2. Criar internação
      const { error: intError } = await supabase
        .from("internacoes")
        .insert({
          paciente_id: paciente.id,
          hospital_id: currentHospital.hospital_id,
          leito: data.leito || null,
          setor: data.setor || null,
          diagnostico: data.diagnostico || null,
          risco: data.risco,
          status: data.status,
          observacoes: data.observacoes || null,
        });

      if (intError) throw intError;

      toast.success("Paciente admitido com sucesso");
      queryClient.invalidateQueries({ queryKey: ["internacoes-ativas"] });
      queryClient.invalidateQueries({ queryKey: ["setores"] });
      queryClient.invalidateQueries({ queryKey: ["medicos"] });
      form.reset();
      setStep(1);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao admitir paciente");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setStep(1);
    }
  };

  const goToStep2 = async () => {
    const valid = await form.trigger(["nome", "data_nascimento", "sexo"]);
    if (valid) setStep(2);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="w-4 h-4" />
          Nova Admissão
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-base">Nova Admissão de Paciente</SheetTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                step === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              1. Dados Pessoais
            </button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <button
              type="button"
              onClick={goToStep2}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                step === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              2. Internação
            </button>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Identificação</p>

                  <FormField control={form.control} name="nome" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nome completo *</FormLabel>
                      <FormControl><Input placeholder="Nome do paciente" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="data_nascimento" render={({ field }) => {
                      const [dateText, setDateText] = useState(field.value ? format(field.value, "dd/MM/yyyy") : "");
                      
                      const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 8) value = value.slice(0, 8);
                        if (value.length >= 5) {
                          value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
                        } else if (value.length >= 3) {
                          value = value.slice(0, 2) + "/" + value.slice(2);
                        }
                        setDateText(value);
                        
                        if (value.length === 10) {
                          const parsed = parse(value, "dd/MM/yyyy", new Date());
                          if (isValid(parsed) && parsed <= new Date() && parsed >= new Date("1900-01-01")) {
                            field.onChange(parsed);
                          }
                        }
                      };

                      const handleCalendarSelect = (date: Date | undefined) => {
                        field.onChange(date);
                        if (date) setDateText(format(date, "dd/MM/yyyy"));
                      };

                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs">Nascimento *</FormLabel>
                          <div className="flex gap-1">
                            <Input
                              placeholder="dd/mm/aaaa"
                              value={dateText}
                              onChange={handleDateTextChange}
                              className="text-xs h-9 flex-1"
                              maxLength={10}
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                                  <CalendarIcon className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={handleCalendarSelect}
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                  initialFocus
                                  locale={ptBR}
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }} />

                    <FormField control={form.control} name="sexo" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs">Sexo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="cpf" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">CPF</FormLabel>
                        <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="nome_mae" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Nome da Mãe</FormLabel>
                        <FormControl><Input placeholder="Nome da mãe" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold pt-2">Contato</p>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="telefone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Telefone</FormLabel>
                        <FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="convenio" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Convênio</FormLabel>
                        <FormControl><Input placeholder="Nome do convênio" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="endereco" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Endereço</FormLabel>
                      <FormControl><Input placeholder="Rua, número, bairro" {...field} /></FormControl>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="cidade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Cidade</FormLabel>
                        <FormControl><Input placeholder="Cidade" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="estado" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estadosBR.map(uf => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold pt-2">Contato de Emergência</p>

                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="contato_emergencia_nome" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Nome</FormLabel>
                        <FormControl><Input placeholder="Nome" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="contato_emergencia_telefone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Telefone</FormLabel>
                        <FormControl><Input placeholder="Telefone" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="contato_emergencia_parentesco" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Parentesco</FormLabel>
                        <FormControl><Input placeholder="Ex: Filho(a)" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <div className="pt-4">
                    <Button type="button" onClick={goToStep2} className="w-full gap-1.5">
                      Próximo: Dados da Internação
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Internação</p>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="setor" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Setor</FormLabel>
                        <Select
                          onValueChange={async (val) => {
                            field.onChange(val);
                            form.setValue("leito", "");
                            setAvailableBeds([]);
                            const setor = setoresHospital.find(s => s.nome === val);
                            if (setor && currentHospital) {
                              const abbrev = sectorAbbrev(val);
                              const allBeds = Array.from({ length: setor.numero_leitos }, (_, i) => bedLabel(abbrev, i));
                              const { data: occupied } = await supabase
                                .from("internacoes")
                                .select("leito")
                                .eq("hospital_id", currentHospital.hospital_id)
                                .eq("setor", val)
                                .in("status", ["internado", "uti"]);
                              const occupiedSet = new Set((occupied || []).map(r => r.leito));
                              setAvailableBeds(allBeds.filter(b => !occupiedSet.has(b)));
                            }
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue placeholder="Selecione o setor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {setoresHospital.map((s) => (
                              <SelectItem key={s.id} value={s.nome} className="text-xs">
                                {s.nome} ({s.numero_leitos} leitos)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="leito" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Leito</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={availableBeds.length === 0}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue placeholder={form.watch("setor") ? (availableBeds.length === 0 ? "Setor lotado" : "Selecione o leito") : "Selecione o setor"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableBeds.map((bed) => (
                              <SelectItem key={bed} value={bed} className="text-xs font-mono">
                                {bed}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="diagnostico" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Diagnóstico</FormLabel>
                      <FormControl><Input placeholder="Diagnóstico principal" {...field} /></FormControl>
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="risco" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Classificação de Risco</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="estavel">Estável</SelectItem>
                            <SelectItem value="moderado">Moderado</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="internado">Internado</SelectItem>
                            <SelectItem value="uti">UTI</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="observacoes" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observações adicionais sobre a internação..." className="min-h-[80px] text-xs" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1 gap-1.5">
                      {submitting ? "Salvando..." : "Admitir Paciente"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
