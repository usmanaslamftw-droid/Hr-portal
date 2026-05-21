import React from 'react';
import { Employee } from '../types';
import { Mail, Phone, Calendar, Briefcase, Edit2, BadgeAlert, BadgeCheck, Loader2 } from 'lucide-react';

interface EmployeeRowProps {
  key?: React.Key;
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onSelectPunch: (employee: Employee) => void;
}

export function EmployeeRow({ employee, onEdit, onSelectPunch }: EmployeeRowProps) {
  // Color palette for status badges
  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'On Leave':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Suspended':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Terminated':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const initialLetter = employee.name.charAt(0).toUpperCase();

  return (
    <div
      id={`emp-row-${employee.id}`}
      className="p-4 glass-card hover:bg-white/10 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
    >
      {/* Employee Identity & Info */}
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 font-bold border border-indigo-500/30 text-lg flex items-center justify-center shrink-0 font-sans shadow-inner">
          {initialLetter}
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-white text-sm font-sans tracking-tight">
              {employee.name}
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-sans uppercase tracking-wider ${getStatusColor(
                employee.status
              )}`}
            >
              {employee.status}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>{employee.role}</span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px] uppercase border border-indigo-500/25">
              {employee.department}
            </span>
          </p>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 pt-1">
            <a
              href={`mailto:${employee.email}`}
              className="text-[11px] text-slate-400 hover:text-indigo-400 font-mono transition-colors flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-slate-400" />
              {employee.email}
            </a>
            <a
              href={`tel:${employee.phone}`}
              className="text-[11px] text-slate-400 hover:text-indigo-400 font-mono transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-slate-400" />
              {employee.phone}
            </a>
            <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Joined {employee.joinDate}
            </span>
          </div>
        </div>
      </div>

      {/* Row Quick Actions */}
      <div className="flex items-center gap-2 sm:self-center self-end shrink-0">
        {employee.status === 'Active' && (
          <button
            id={`btn-punch-${employee.id}`}
            onClick={() => onSelectPunch(employee)}
            className="px-3 py-1.5 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/22 text-indigo-300 rounded-xl transition-all border border-indigo-500/30 hover:border-indigo-400/50 flex items-center gap-1.5 font-sans cursor-pointer"
            title="Select employee for quick clock-in/out"
          >
            <Loader2 className="w-3.5 h-3.5 shrink-0" />
            <span>Punch Card</span>
          </button>
        )}
        <button
          id={`btn-edit-${employee.id}`}
          onClick={() => onEdit(employee)}
          className="p-1.5 text-slate-300 hover:text-indigo-450 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
          title="Edit Profile"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
