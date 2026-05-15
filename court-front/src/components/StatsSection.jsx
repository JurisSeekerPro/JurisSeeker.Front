import React from "react";
import { motion } from "framer-motion";
import { Database, Clock, TrendingUp, Scale } from "lucide-react";

const stats = [
  { value: "10,000+", label: "Судебных дел", icon: <Database size={20} /> },
  { value: "2020-2024", label: "Период охвата", icon: <Clock size={20} /> },
  { value: "Ежедневно", label: "Обновление базы", icon: <TrendingUp size={20} /> },
  { value: "50+", label: "Судов", icon: <Scale size={20} /> }
];

export default function StatsSection() {
  return (
    <motion.section className="stats-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div key={index} className="stat-card" whileHover={{ scale: 1.05 }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
