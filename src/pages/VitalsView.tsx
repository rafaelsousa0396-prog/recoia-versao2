import { useState } from "react";
import { Activity, Heart, Droplets, Thermometer } from "lucide-react";
import { motion } from "framer-motion";
import { patients } from "@/data/mockData";
import { SparkLine } from "@/components/SparkLine";

export default function VitalsView() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0].id);
  const patient = patients.find((p) => p.id === selectedPatient)!;

  const vitalsData = [
    { icon: Heart, label: "Frequência Cardíaca", value: patient.vitals.fc[patient.vitals.fc.length - 1], unit: "bpm", data: patient.vitals.fc, danger: patient.vitals.fc[patient.vitals.fc.length - 1] > 100, history: patient.vitals.fc.map((v, i) => ({ time: `${i * 1}h`, value: v })) },
    { icon: Droplets, label: "Saturação O₂", value: patient.vitals.satO2[patient.vitals.satO2.length - 1], unit: "%", data: patient.vitals.satO2, danger: patient.vitals.satO2[patient.vitals.satO2.length - 1] < 92, history: patient.vitals.satO2.map((v, i) => ({ time: `${i * 1}h`, value: v })) },
    { icon: Activity, label: "Pressão Arterial", value: patient.vitals.pa, unit: "mmHg", data: undefined, danger: false, history: [] },
    { icon: Thermometer, label: "Temperatura", value: patient.vitals.temp, unit: "°C", data: undefined, danger: patient.vitals.temp > 37.5, history: [] },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Sinais Vitais</h1>
            <p className="text-xs text-muted-foreground">Monitoramento contínuo com tendências</p>
          </div>
        </div>
        <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="clinical-input !w-auto !py-1 text-xs">
          {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vitalsData.map((v, i) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card border rounded-xl p-5 clinical-shadow ${v.danger ? "border-risk-high/30" : ""}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <v.icon className={`w-4 h-4 ${v.danger ? "text-risk-high" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{v.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <p className={`vital-value text-3xl ${v.danger ? "text-risk-high" : "text-foreground"}`}>
                {v.value} <span className="text-sm text-muted-foreground font-sans">{v.unit}</span>
              </p>
              {v.data && <SparkLine data={v.data} color={v.danger ? "hsl(0, 72%, 51%)" : "hsl(200, 80%, 45%)"} width={120} height={40} />}
            </div>
            {v.data && (
              <div className="mt-3 flex gap-2 text-[10px] text-muted-foreground">
                {v.data.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="font-mono">{val}</span>
                    <span>{idx}h</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
