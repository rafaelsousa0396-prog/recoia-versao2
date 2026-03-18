import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { Alert } from "@/data/mockData";

const typeConfig = {
  critical: {
    icon: AlertTriangle,
    borderClass: "border-l-4 border-l-risk-high",
    iconClass: "text-risk-high",
    bgClass: "bg-risk-high/5",
  },
  warning: {
    icon: AlertCircle,
    borderClass: "border-l-4 border-l-risk-medium",
    iconClass: "text-risk-medium",
    bgClass: "bg-risk-medium/5",
  },
  info: {
    icon: Info,
    borderClass: "border-l-4 border-l-primary",
    iconClass: "text-primary",
    bgClass: "bg-primary/5",
  },
};

export function AlertCard({ alert, index }: { alert: Alert; index: number }) {
  const config = typeConfig[alert.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 25 }}
      className={`rounded-lg border ${config.borderClass} ${config.bgClass} p-3 clinical-shadow`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground truncate">{alert.patientName}</span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">{alert.time}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
          <span className="text-[10px] text-muted-foreground/70 mt-1 inline-block">{alert.sector}</span>
        </div>
      </div>
    </motion.div>
  );
}
