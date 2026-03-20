import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Patient } from "@/data/mockData";

const riskLabels = { high: "Alto", medium: "Moderado", stable: "Estável" };
const riskClasses = { high: "risk-badge-high", medium: "risk-badge-medium", stable: "risk-badge-stable" };

export function PatientRow({ patient, index }: { patient: Patient; index: number }) {
  const navigate = useNavigate();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group cursor-pointer hover:bg-clinical-muted/50 transition-colors"
      onClick={() => navigate(`/paciente/${patient.id}`)}
    >
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{patient.name}</p>
          <p className="text-xs text-muted-foreground">{patient.age}a · {patient.gender}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{patient.bed}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{patient.sector}</td>
      <td className="px-4 py-3 text-xs text-foreground max-w-[200px] truncate">{patient.diagnosis}</td>
      <td className="px-4 py-3">
        <span className={riskClasses[patient.risk]}>{riskLabels[patient.risk]}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">FC</span>
            <SparkLine data={patient.vitals.fc} color={patient.risk === "high" ? "hsl(0, 72%, 51%)" : "hsl(200, 80%, 45%)"} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">SpO₂</span>
            <SparkLine data={patient.vitals.satO2} color={patient.vitals.satO2[patient.vitals.satO2.length - 1] < 92 ? "hsl(0, 72%, 51%)" : "hsl(150, 50%, 50%)"} />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{patient.doctor}</td>
    </motion.tr>
  );
}
