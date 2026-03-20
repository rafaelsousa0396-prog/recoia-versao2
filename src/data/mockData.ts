export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  birthDate: string;
  motherName: string;
  bed: string;
  sector: string;
  diagnosis: string;
  doctor: string;
  admissionDate: string;
  risk: "high" | "medium" | "stable";
  status: "internado" | "alta" | "uti";
  vitals: {
    fc: number[];
    satO2: number[];
    pa: string[];
    temp: number[];
  };
  alerts: string[];
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: "critical" | "warning" | "info";
  message: string;
  time: string;
  sector: string;
}

export interface Bed {
  id: string;
  number: string;
  sector: string;
  status: "occupied" | "available" | "cleaning" | "reserved";
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  diagnosis?: string;
}

export interface Evolution {
  id: string;
  date: string;
  time: string;
  professional: string;
  role: string;
  content: string;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  value: string;
  unit: string;
  reference: string;
  status: "normal" | "altered" | "critical";
}

export const patients: Patient[] = [
  {
    id: "1",
    name: "João Silva",
    age: 68,
    gender: "M",
    birthDate: "1958-05-12",
    motherName: "Conceição Silva",
    bed: "UTI-01",
    sector: "UTI",
    diagnosis: "Pneumonia + Sepse",
    doctor: "Dra. Ana Costa",
    admissionDate: "2026-03-15",
    risk: "high",
    status: "uti",
    vitals: { fc: [98, 102, 110, 105, 112, 108], satO2: [91, 89, 88, 90, 87, 89], pa: ["90/60", "88/58", "92/62", "90/60", "95/65", "90/60"], temp: [38.7, 38.5, 38.9, 39.0, 38.6, 38.7] },
    alerts: ["NEWS 2: 7 pontos - Risco de deterioração", "Lactato elevado: 4.2 mmol/L"],
  },
  {
    id: "2",
    name: "Maria Oliveira",
    age: 45,
    gender: "F",
    birthDate: "1981-02-20",
    motherName: "Tereza Oliveira",
    bed: "4A-12",
    sector: "4º Andar",
    diagnosis: "Pós-op colecistectomia",
    doctor: "Dr. Carlos Mendes",
    admissionDate: "2026-03-16",
    risk: "stable",
    status: "internado",
    vitals: { fc: [72, 75, 70, 74, 71, 73], satO2: [97, 98, 97, 98, 97, 98], pa: ["120/80", "118/78", "122/82", "120/80", "119/79", "120/80"], temp: [36.5, 36.4, 36.6, 36.5, 36.5, 36.4] },
    alerts: [],
  },
  {
    id: "3",
    name: "Pedro Santos",
    age: 72,
    gender: "M",
    birthDate: "1954-08-03",
    motherName: "Aparecida Santos",
    bed: "UTI-03",
    sector: "UTI",
    diagnosis: "IAM + ICC descompensada",
    doctor: "Dra. Ana Costa",
    admissionDate: "2026-03-14",
    risk: "high",
    status: "uti",
    vitals: { fc: [88, 95, 92, 100, 96, 94], satO2: [92, 90, 91, 89, 90, 91], pa: ["100/65", "98/60", "105/68", "100/65", "102/66", "100/65"], temp: [36.8, 36.7, 36.9, 36.8, 36.8, 36.7] },
    alerts: ["Troponina em elevação", "BNP > 2000 pg/mL"],
  },
  {
    id: "4",
    name: "Ana Beatriz Lima",
    age: 34,
    gender: "F",
    birthDate: "1992-11-15",
    motherName: "Márcia Lima",
    bed: "4A-05",
    sector: "4º Andar",
    diagnosis: "Apendicectomia - POI",
    doctor: "Dr. Rafael Souza",
    admissionDate: "2026-03-17",
    risk: "stable",
    status: "internado",
    vitals: { fc: [80, 78, 82, 79, 81, 80], satO2: [98, 99, 98, 99, 98, 99], pa: ["115/75", "114/74", "116/76", "115/75", "115/75", "114/74"], temp: [36.4, 36.3, 36.5, 36.4, 36.4, 36.3] },
    alerts: [],
  },
  {
    id: "5",
    name: "Roberto Almeida",
    age: 55,
    gender: "M",
    birthDate: "1971-07-28",
    motherName: "Dona Fátima Almeida",
    bed: "EMG-02",
    sector: "Emergência",
    diagnosis: "AVC isquêmico",
    doctor: "Dra. Juliana Pires",
    admissionDate: "2026-03-18",
    risk: "high",
    status: "internado",
    vitals: { fc: [65, 68, 70, 66, 72, 69], satO2: [95, 94, 93, 94, 93, 94], pa: ["180/100", "175/98", "185/105", "180/100", "178/99", "180/100"], temp: [36.9, 36.8, 37.0, 36.9, 36.9, 36.8] },
    alerts: ["PA elevada persistente", "Janela terapêutica trombolítico: 2h restantes"],
  },
  {
    id: "6",
    name: "Francisca Rodrigues",
    age: 82,
    gender: "F",
    birthDate: "1944-01-10",
    motherName: "Rosa Rodrigues",
    bed: "4A-08",
    sector: "4º Andar",
    diagnosis: "Fratura de fêmur",
    doctor: "Dr. Carlos Mendes",
    admissionDate: "2026-03-13",
    risk: "medium",
    status: "internado",
    vitals: { fc: [85, 88, 84, 86, 87, 85], satO2: [95, 96, 95, 96, 95, 96], pa: ["135/85", "132/83", "138/88", "135/85", "134/84", "135/85"], temp: [37.1, 37.0, 37.2, 37.1, 37.1, 37.0] },
    alerts: ["Risco de TEP - profilaxia em andamento"],
  },
];

export const alerts: Alert[] = [
  { id: "a1", patientId: "1", patientName: "João Silva", type: "critical", message: "NEWS 2: 7 pontos — Risco de deterioração clínica detectado", time: "08:15", sector: "UTI" },
  { id: "a2", patientId: "5", patientName: "Roberto Almeida", type: "critical", message: "Janela terapêutica para trombolítico: 2h restantes", time: "07:45", sector: "Emergência" },
  { id: "a3", patientId: "3", patientName: "Pedro Santos", type: "warning", message: "Troponina em elevação progressiva nas últimas 6h", time: "07:30", sector: "UTI" },
  { id: "a4", patientId: "6", patientName: "Francisca Rodrigues", type: "warning", message: "Risco de TEP — verificar profilaxia", time: "06:50", sector: "4º Andar" },
];

export const beds: Bed[] = [
  { id: "b1", number: "UTI-01", sector: "UTI", status: "occupied", patientId: "1", patientName: "João Silva", patientAge: 68, diagnosis: "Pneumonia + Sepse" },
  { id: "b2", number: "UTI-02", sector: "UTI", status: "available" },
  { id: "b3", number: "UTI-03", sector: "UTI", status: "occupied", patientId: "3", patientName: "Pedro Santos", patientAge: 72, diagnosis: "IAM + ICC" },
  { id: "b4", number: "UTI-04", sector: "UTI", status: "cleaning" },
  { id: "b5", number: "UTI-05", sector: "UTI", status: "reserved" },
  { id: "b6", number: "UTI-06", sector: "UTI", status: "available" },
  { id: "b7", number: "4A-01", sector: "4º Andar", status: "available" },
  { id: "b8", number: "4A-02", sector: "4º Andar", status: "occupied", patientName: "Carla Dias", patientAge: 50, diagnosis: "Celulite" },
  { id: "b9", number: "4A-03", sector: "4º Andar", status: "available" },
  { id: "b10", number: "4A-04", sector: "4º Andar", status: "cleaning" },
  { id: "b11", number: "4A-05", sector: "4º Andar", status: "occupied", patientId: "4", patientName: "Ana Beatriz Lima", patientAge: 34, diagnosis: "Apendicectomia" },
  { id: "b12", number: "4A-06", sector: "4º Andar", status: "available" },
  { id: "b13", number: "4A-07", sector: "4º Andar", status: "reserved" },
  { id: "b14", number: "4A-08", sector: "4º Andar", status: "occupied", patientId: "6", patientName: "Francisca Rodrigues", patientAge: 82, diagnosis: "Fratura de fêmur" },
  { id: "b15", number: "4A-09", sector: "4º Andar", status: "available" },
  { id: "b16", number: "4A-10", sector: "4º Andar", status: "available" },
  { id: "b17", number: "4A-11", sector: "4º Andar", status: "occupied", patientName: "Luís Ferreira", patientAge: 60, diagnosis: "DPOC exacerbada" },
  { id: "b18", number: "4A-12", sector: "4º Andar", status: "occupied", patientId: "2", patientName: "Maria Oliveira", patientAge: 45, diagnosis: "Pós-op colecistectomia" },
  { id: "b19", number: "EMG-01", sector: "Emergência", status: "available" },
  { id: "b20", number: "EMG-02", sector: "Emergência", status: "occupied", patientId: "5", patientName: "Roberto Almeida", patientAge: 55, diagnosis: "AVC isquêmico" },
  { id: "b21", number: "EMG-03", sector: "Emergência", status: "occupied", patientName: "Teresa Nunes", patientAge: 40, diagnosis: "Dor torácica" },
  { id: "b22", number: "EMG-04", sector: "Emergência", status: "cleaning" },
  { id: "b23", number: "EMG-05", sector: "Emergência", status: "available" },
  { id: "b24", number: "EMG-06", sector: "Emergência", status: "available" },
];

export const evolutions: Evolution[] = [
  { id: "e1", date: "2026-03-18", time: "08:00", professional: "Dra. Ana Costa", role: "Médica", content: "Paciente mantém quadro séptico. Iniciado Meropenem após resultado de hemocultura. Lactato 4.2 → solicito controle em 6h. Manter drogas vasoativas. Sem melhora do padrão ventilatório, mantenho VMI com FiO2 60%. NEWS 2: 7 pontos." },
  { id: "e2", date: "2026-03-18", time: "06:00", professional: "Enf. Paula Martins", role: "Enfermagem", content: "Paciente sonolento, responsivo a estímulos verbais. Mantendo DVA em BIC. Diurese presente por SVD: 150ml nas últimas 6h (oligúria). Realizado banho no leito. Curativos de acesso central sem sinais flogísticos." },
  { id: "e3", date: "2026-03-17", time: "18:00", professional: "Dra. Ana Costa", role: "Médica", content: "Paciente evoluindo com piora hemodinâmica. Noradrenalina aumentada para 0.3mcg/kg/min. Solicitado hemocultura, PCR, lactato. Iniciado antibioticoterapia empírica com Piperacilina-Tazobactam." },
  { id: "e4", date: "2026-03-17", time: "14:00", professional: "Ft. Ricardo Lima", role: "Fisioterapia", content: "Paciente em VMI, modo PCV. Parâmetros: FiO2 50%, PEEP 10, FR 18. Relação P/F 180. Realizada aspiração traqueal com secreção purulenta em moderada quantidade. Mantido posicionamento em decúbito elevado 30°." },
];

export const exams: Exam[] = [
  { id: "x1", name: "Hemoglobina", date: "2026-03-18", value: "9.2", unit: "g/dL", reference: "12-16", status: "altered" },
  { id: "x2", name: "Leucócitos", date: "2026-03-18", value: "18.500", unit: "/mm³", reference: "4.000-11.000", status: "critical" },
  { id: "x3", name: "PCR", date: "2026-03-18", value: "185", unit: "mg/L", reference: "<5", status: "critical" },
  { id: "x4", name: "Lactato", date: "2026-03-18", value: "4.2", unit: "mmol/L", reference: "<2", status: "critical" },
  { id: "x5", name: "Creatinina", date: "2026-03-18", value: "2.1", unit: "mg/dL", reference: "0.7-1.3", status: "altered" },
  { id: "x6", name: "Potássio", date: "2026-03-18", value: "4.5", unit: "mEq/L", reference: "3.5-5.0", status: "normal" },
  { id: "x7", name: "Sódio", date: "2026-03-18", value: "138", unit: "mEq/L", reference: "135-145", status: "normal" },
  { id: "x8", name: "Plaquetas", date: "2026-03-18", value: "95.000", unit: "/mm³", reference: "150.000-400.000", status: "altered" },
  { id: "x9", name: "Troponina", date: "2026-03-18", value: "0.02", unit: "ng/mL", reference: "<0.04", status: "normal" },
  { id: "x10", name: "Glicemia", date: "2026-03-18", value: "165", unit: "mg/dL", reference: "70-100", status: "altered" },
];

export interface Prescription {
  id: string;
  patientId: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  schedule: string[];
  startDate: string;
  endDate?: string;
  status: "active" | "suspended" | "completed";
  prescribedBy: string;
  notes?: string;
  category: "antibiotic" | "analgesic" | "cardiovascular" | "fluid" | "other";
}

export const prescriptions: Prescription[] = [
  { id: "p1", patientId: "1", medication: "Meropenem", dose: "1g", route: "EV", frequency: "8/8h", schedule: ["06:00", "14:00", "22:00"], startDate: "2026-03-18", status: "active", prescribedBy: "Dra. Ana Costa", category: "antibiotic", notes: "Escalonado após antibiograma" },
  { id: "p2", patientId: "1", medication: "Noradrenalina", dose: "0.3 mcg/kg/min", route: "EV BIC", frequency: "Contínuo", schedule: [], startDate: "2026-03-16", status: "active", prescribedBy: "Dra. Ana Costa", category: "cardiovascular", notes: "Meta PAM > 65 mmHg" },
  { id: "p3", patientId: "1", medication: "Dipirona", dose: "1g", route: "EV", frequency: "6/6h se Tax ≥ 37.8°C", schedule: ["06:00", "12:00", "18:00", "00:00"], startDate: "2026-03-15", status: "active", prescribedBy: "Dra. Ana Costa", category: "analgesic" },
  { id: "p4", patientId: "1", medication: "SF 0.9%", dose: "500ml", route: "EV", frequency: "12/12h", schedule: ["08:00", "20:00"], startDate: "2026-03-15", status: "active", prescribedBy: "Dra. Ana Costa", category: "fluid" },
  { id: "p5", patientId: "1", medication: "Omeprazol", dose: "40mg", route: "EV", frequency: "1x/dia", schedule: ["06:00"], startDate: "2026-03-15", status: "active", prescribedBy: "Dra. Ana Costa", category: "other" },
  { id: "p6", patientId: "1", medication: "Piperacilina-Tazobactam", dose: "4.5g", route: "EV", frequency: "6/6h", schedule: ["06:00", "12:00", "18:00", "00:00"], startDate: "2026-03-15", endDate: "2026-03-17", status: "completed", prescribedBy: "Dra. Ana Costa", category: "antibiotic", notes: "Substituído por Meropenem" },
  { id: "p7", patientId: "2", medication: "Cetoprofeno", dose: "100mg", route: "EV", frequency: "12/12h", schedule: ["08:00", "20:00"], startDate: "2026-03-16", status: "active", prescribedBy: "Dr. Carlos Mendes", category: "analgesic" },
  { id: "p8", patientId: "2", medication: "Ondansetrona", dose: "4mg", route: "EV", frequency: "8/8h se náusea", schedule: ["08:00", "16:00", "00:00"], startDate: "2026-03-16", status: "active", prescribedBy: "Dr. Carlos Mendes", category: "other" },
  { id: "p9", patientId: "3", medication: "Furosemida", dose: "40mg", route: "EV", frequency: "12/12h", schedule: ["08:00", "20:00"], startDate: "2026-03-14", status: "active", prescribedBy: "Dra. Ana Costa", category: "cardiovascular" },
  { id: "p10", patientId: "3", medication: "Enoxaparina", dose: "60mg", route: "SC", frequency: "12/12h", schedule: ["08:00", "20:00"], startDate: "2026-03-14", status: "active", prescribedBy: "Dra. Ana Costa", category: "cardiovascular" },
  { id: "p11", patientId: "5", medication: "Alteplase (rt-PA)", dose: "0.9 mg/kg", route: "EV", frequency: "Dose única", schedule: ["08:00"], startDate: "2026-03-18", status: "active", prescribedBy: "Dra. Juliana Pires", category: "cardiovascular", notes: "Trombolítico - janela terapêutica" },
  { id: "p12", patientId: "6", medication: "Enoxaparina", dose: "40mg", route: "SC", frequency: "1x/dia", schedule: ["20:00"], startDate: "2026-03-13", status: "active", prescribedBy: "Dr. Carlos Mendes", category: "cardiovascular", notes: "Profilaxia TEP" },
];

export const sectors = ["Todos", "UTI", "4º Andar", "Emergência"];
export const riskLevels = ["Todos", "high", "medium", "stable"];
export const doctors = ["Todos", "Dra. Ana Costa", "Dr. Carlos Mendes", "Dr. Rafael Souza", "Dra. Juliana Pires"];
