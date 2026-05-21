import { motion } from 'motion/react';
import React from 'react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({ id, title, value, subtext, icon, trend }: MetricCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 glass-panel rounded-2xl hover:bg-white/5 transition-all flex items-start justify-between shadow-lg"
    >
      <div className="space-y-1.5 col-span-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-sans">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
            {value}
          </span>
          {trend && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded font-mono ${
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-slate-400/80 font-sans font-light">
            {subtext}
          </p>
        )}
      </div>
      <div className="p-3 bg-white/5 rounded-xl text-indigo-400 border border-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
    </motion.div>
  );
}
