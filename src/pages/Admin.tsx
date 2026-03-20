import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Building2, Users, Shield, Search, LayoutGrid, Pencil, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "medico", label: "Médico" },
  { value: "enfermagem", label: "Enfermagem" },
  { value: "fisio", label: "Fisioterapia" },
  { value: "assistente_social", label: "Assistente Social" },
  { value: "recepcao", label: "Recepção" },
  { value: "farmacia", label: "Farmácia" },
];

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

type Profile = { id: string; nome: string; email: string; registro: string };
type Hospital = { id: string; nome: string; cidade: string; estado: string; ativo: boolean };
type Setor = { id: string; hospital_id: string; nome: string; numero_leitos: number; ativo: boolean };
type UserHospitalLink = {
  id: string; user_id: string; hospital_id: string; role: string; ativo: boolean;
  profile?: Profile; hospital?: Hospital;
};

async function invokeAdmin(action: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action, ...body },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function Admin() {
  const { currentHospital } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [links, setLinks] = useState<UserHospitalLink[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: h }, { data: l }, { data: p }, { data: s }] = await Promise.all([
      supabase.from("hospitals").select("*").order("nome"),
      supabase.from("user_hospitals").select("*"),
      supabase.from("profiles").select("*").order("nome"),
      supabase.from("setores").select("*").order("nome"),
    ]);
    setHospitals((h as Hospital[]) || []);
    setProfiles((p as Profile[]) || []);
    setSetores((s as Setor[]) || []);

    // Enrich links
    const enriched = (l || []).map((link: any) => ({
      ...link,
      profile: (p || []).find((pr: any) => pr.id === link.user_id),
      hospital: (h || []).find((ho: any) => ho.id === link.hospital_id),
    }));
    setLinks(enriched as UserHospitalLink[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredProfiles = profiles.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchUsers.toLowerCase()) ||
      p.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
      p.registro.toLowerCase().includes(searchUsers.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Administração</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Gerencie hospitais, usuários e permissões</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="w-3.5 h-3.5" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="hospitals" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Hospitais
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Vínculos
          </TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-end gap-3 justify-between">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label className="text-xs">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Nome, email ou registro..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <CreateUserDialog hospitals={hospitals} onCreated={fetchData} />
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nome</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Registro</TableHead>
                    <TableHead className="text-xs">Hospitais</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((p) => {
                    const userLinks = links.filter((l) => l.user_id === p.id && l.ativo);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs font-medium">{p.nome}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.email}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.registro}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {userLinks.map((l) => (
                              <Badge key={l.id} variant="secondary" className="text-[10px]">
                                {l.hospital?.nome?.split(" ").slice(0, 2).join(" ")} · {ROLES.find(r => r.value === l.role)?.label || l.role}
                              </Badge>
                            ))}
                            {userLinks.length === 0 && (
                              <span className="text-[10px] text-muted-foreground">Sem vínculo</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredProfiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HOSPITALS TAB */}
        <TabsContent value="hospitals" className="space-y-4">
          <div className="flex justify-end">
            <CreateHospitalDialog onCreated={fetchData} />
          </div>
          <div className="space-y-3">
            {hospitals.map((h) => {
              const count = links.filter((l) => l.hospital_id === h.id && l.ativo).length;
              const hospitalSetores = setores.filter(s => s.hospital_id === h.id);
              return (
                <HospitalCard
                  key={h.id}
                  hospital={h}
                  profissionaisCount={count}
                  setores={hospitalSetores}
                  hospitals={hospitals}
                  onUpdated={fetchData}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---- Hospital Card with Setores ---- */

function HospitalCard({ hospital: h, profissionaisCount, setores: hospitalSetores, hospitals, onUpdated }: {
  hospital: Hospital; profissionaisCount: number; setores: Setor[]; hospitals: Hospital[]; onUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className={!h.ativo ? "opacity-50" : ""}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{h.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {hospitalSetores.length} setor(es)
                </Badge>
                <Badge variant={h.ativo ? "default" : "secondary"} className="text-[10px]">
                  {h.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CardContent className="pb-2">
          <p className="text-xs text-muted-foreground">{h.cidade}, {h.estado}</p>
          <p className="text-xs text-muted-foreground mt-1">{profissionaisCount} profissional(is) vinculado(s)</p>
        </CardContent>
        <CollapsibleContent>
          <div className="border-t px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Setores</p>
              <CreateSetorDialog hospitals={[h]} onCreated={onUpdated} singleHospital />
            </div>
            {hospitalSetores.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Nenhum setor cadastrado neste hospital.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Setor</TableHead>
                    <TableHead className="text-xs">Leitos</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitalSetores.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs font-medium">{s.nome}</TableCell>
                      <TableCell className="text-xs">{s.numero_leitos}</TableCell>
                      <TableCell>
                        <Badge variant={s.ativo ? "default" : "secondary"} className="text-[10px]">
                          {s.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ToggleSetorButton setor={s} onUpdated={onUpdated} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/* ---- Dialogs ---- */

function CreateUserDialog({ hospitals, onCreated }: { hospitals: Hospital[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", registro: "", password: "", hospital_id: "", role: "medico" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await invokeAdmin("create_user", form);
      toast.success("Usuário criado com sucesso");
      setOpen(false);
      setForm({ nome: "", email: "", registro: "", password: "", hospital_id: "", role: "medico" });
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm">Cadastrar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome completo</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Registro</Label>
              <Input value={form.registro} onChange={(e) => setForm({ ...form, registro: e.target.value })} placeholder="CRM-12345" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Senha</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Hospital</Label>
              <Select value={form.hospital_id} onValueChange={(v) => setForm({ ...form, hospital_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {hospitals.filter(h => h.ativo).map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Papel</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !form.hospital_id}>
            {submitting ? "Criando..." : "Criar Usuário"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateHospitalDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome: "", cidade: "", estado: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await invokeAdmin("create_hospital", form);
      toast.success("Hospital criado com sucesso");
      setOpen(false);
      setForm({ nome: "", cidade: "", estado: "" });
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo Hospital
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm">Cadastrar Hospital</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !form.estado}>
            {submitting ? "Criando..." : "Criar Hospital"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LinkUserDialog({ hospitals, profiles, onCreated }: { hospitals: Hospital[]; profiles: Profile[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ user_id: "", hospital_id: "", role: "medico" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await invokeAdmin("link_user_hospital", form);
      toast.success("Vínculo criado com sucesso");
      setOpen(false);
      setForm({ user_id: "", hospital_id: "", role: "medico" });
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo Vínculo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm">Vincular Usuário a Hospital</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Profissional</Label>
            <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome} ({p.registro})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Hospital</Label>
              <Select value={form.hospital_id} onValueChange={(v) => setForm({ ...form, hospital_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {hospitals.filter(h => h.ativo).map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Papel</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !form.user_id || !form.hospital_id}>
            {submitting ? "Vinculando..." : "Criar Vínculo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UpdateLinkActions({ link, onUpdated }: { link: UserHospitalLink; onUpdated: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  const toggleStatus = async () => {
    setSubmitting(true);
    try {
      await invokeAdmin("update_link", { link_id: link.id, ativo: !link.ativo });
      toast.success(link.ativo ? "Vínculo desativado" : "Vínculo reativado");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  return (
    <Button
      variant={link.ativo ? "ghost" : "outline"}
      size="sm"
      className="text-[10px] h-7"
      onClick={toggleStatus}
      disabled={submitting}
    >
      {link.ativo ? "Desativar" : "Reativar"}
    </Button>
  );
}

function CreateSetorDialog({ hospitals, onCreated }: { hospitals: Hospital[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ hospital_id: "", nome: "", numero_leitos: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("setores").insert({
        hospital_id: form.hospital_id,
        nome: form.nome.trim(),
        numero_leitos: parseInt(form.numero_leitos) || 0,
      });
      if (error) throw error;
      toast.success("Setor criado com sucesso");
      setOpen(false);
      setForm({ hospital_id: "", nome: "", numero_leitos: "" });
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo Setor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm">Cadastrar Setor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Hospital</Label>
            <Select value={form.hospital_id} onValueChange={(v) => setForm({ ...form, hospital_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {hospitals.filter(h => h.ativo).map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome do Setor</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: UTI, Enfermaria" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nº de Leitos</Label>
              <Input type="number" min="0" value={form.numero_leitos} onChange={(e) => setForm({ ...form, numero_leitos: e.target.value })} placeholder="0" required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !form.hospital_id || !form.nome.trim()}>
            {submitting ? "Criando..." : "Criar Setor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ToggleSetorButton({ setor, onUpdated }: { setor: Setor; onUpdated: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  const toggle = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("setores").update({ ativo: !setor.ativo }).eq("id", setor.id);
      if (error) throw error;
      toast.success(setor.ativo ? "Setor desativado" : "Setor reativado");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  return (
    <Button variant={setor.ativo ? "ghost" : "outline"} size="sm" className="text-[10px] h-7" onClick={toggle} disabled={submitting}>
      {setor.ativo ? "Desativar" : "Reativar"}
    </Button>
  );
}
