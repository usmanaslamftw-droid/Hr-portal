import React, { useState, useEffect } from 'react';
import { PayrollSlip, Employee } from '../types';
import { Coins, Search, Plus, Check, FileText, AlertCircle, DollarSign, Wallet, TrendingUp } from 'lucide-react';

interface PayrollTabProps {
  employees: Employee[];
  slips: PayrollSlip[];
  onAddSlip: (slip: Omit<PayrollSlip, 'id' | 'netSalary'>) => void;
  onPaySlipUpdate: (id: string) => void;
  onDeleteSlip: (id: string) => void;
}

export function PayrollTab({
  employees,
  slips,
  onAddSlip,
  onPaySlipUpdate,
  onDeleteSlip
}: PayrollTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriod: 'May 2026',
    baseSalary: '',
    bonus: '0',
    allowance: '200',
    deductions: '0'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto populate salary default suggestion on employee selection
  useEffect(() => {
    if (!formData.employeeId) return;
    const emp = employees.find(e => e.id === formData.employeeId);
    if (emp) {
      // rough salary base mapping
      let base = '5000';
      if (emp.role.includes('Senior') || emp.role.includes('Director') || emp.role.includes('Architect')) {
        base = '8000';
      } else if (emp.role.includes('Junior') || emp.role.includes('Assistant')) {
        base = '4500';
      } else if (emp.role.includes('Lead') || emp.role.includes('Manager')) {
        base = '6500';
      }
      setFormData(prev => ({
        ...prev,
        baseSalary: base
      }));
    }
  }, [formData.employeeId, employees]);

  // Calculations
  const totalOutlay = slips.reduce((sum, s) => sum + s.netSalary, 0);
  const totalPaidOutlay = slips.filter(s => s.status === 'Paid').reduce((sum, s) => sum + s.netSalary, 0);
  const pendingOutlayCount = slips.filter(s => s.status === 'Pending').length;

  const handleCreateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.employeeId) {
      setError('Please select an employee.');
      return;
    }

    const base = parseFloat(formData.baseSalary);
    const bns = parseFloat(formData.bonus || '0');
    const alw = parseFloat(formData.allowance || '0');
    const ded = parseFloat(formData.deductions || '0');

    if (isNaN(base) || base <= 0) {
      setError('Please provide a valid base salary.');
      return;
    }
    if (isNaN(bns) || bns < 0) {
      setError('Bonus cannot be negative.');
      return;
    }
    if (isNaN(alw) || alw < 0) {
      setError('Allowance cannot be negative.');
      return;
    }
    if (isNaN(ded) || ded < 0) {
      setError('Deductions cannot be negative.');
      return;
    }

    const matchedEmployee = employees.find(e => e.id === formData.employeeId);
    if (!matchedEmployee) return;

    onAddSlip({
      employeeId: formData.employeeId,
      employeeName: matchedEmployee.name,
      department: matchedEmployee.department,
      role: matchedEmployee.role,
      payPeriod: formData.payPeriod,
      baseSalary: base,
      bonus: bns,
      allowance: alw,
      deductions: ded,
      status: 'Pending'
    });

    setSuccess('Payroll slip ledger entry created successfully!');
    setFormData({
      employeeId: '',
      payPeriod: 'May 2026',
      baseSalary: '',
      bonus: '0',
      allowance: '200',
      deductions: '0'
    });

    setTimeout(() => {
      setSuccess('');
      setShowForm(false);
    }, 1500);
  };

  const filteredSlips = slips.filter(slip => {
    const matchesSearch = slip.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          slip.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          slip.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || slip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="payroll-workspace" className="space-y-6">
      
      {/* Outlay summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 glass-panel rounded-2xl flex items-center justify-between shadow-md border border-white/8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Total Budget Outlay
            </span>
            <div className="text-2xl font-black text-indigo-400 tracking-tight font-sans">
              ${totalOutlay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 glass-panel rounded-2xl flex items-center justify-between shadow-md border border-white/8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Paid Outlay
            </span>
            <div className="text-2xl font-black text-emerald-400 tracking-tight font-sans">
              ${totalPaidOutlay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 glass-panel rounded-2xl flex items-center justify-between shadow-md border border-white/8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Awaiting Processing
            </span>
            <div className="text-2xl font-black text-amber-400 tracking-tight font-sans">
              {pendingOutlayCount} Slips
            </div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Ledger column (Left - 7/12) */}
        <div className="lg:col-span-12 xl:col-span-7 glass-panel rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/5 text-indigo-300 rounded-lg border border-white/10">
                <Coins className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-white text-sm">Corporate Payout Records Ledger</h3>
            </div>
            <button
              id="btn-trigger-payroll-form"
              onClick={() => setShowForm(!showForm)}
              className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-550 border border-indigo-500/25 rounded-xl text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define Pay Run</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-1 font-sans">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="search-slips"
                type="text"
                placeholder="Search name, role, department..."
                className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-xl text-white outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-1.5 text-xs glass-input rounded-xl text-white cursor-pointer focus:bg-slate-900 font-sans"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Slips</option>
              <option value="Pending" className="bg-slate-900 text-slate-200">Pending Run</option>
              <option value="Paid" className="bg-slate-900 text-slate-200">Processed / Paid</option>
            </select>
          </div>

          {/* List mapping */}
          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredSlips.length > 0 ? (
              filteredSlips.map((slp) => (
                <div
                  key={slp.id}
                  id={`payroll-row-${slp.id}`}
                  className="p-4 glass-card hover:bg-white/10 rounded-2xl transition-all shadow-md border border-white/8 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-tight">{slp.employeeName}</h4>
                      <p className="text-[11px] text-slate-350">
                        {slp.role} <span className="text-slate-600">•</span> <span className="text-indigo-300">{slp.department}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 font-mono block">Period: {slp.payPeriod}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase tracking-wider inline-block mt-0.5 ${
                        slp.status === 'Paid' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      }`}>
                        {slp.status}
                      </span>
                    </div>
                  </div>

                  {/* Financial itemization breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono p-2 bg-black/15 border border-white/5 rounded-xl text-slate-300">
                    <div>
                      <span className="text-slate-450 uppercase text-[8px] block tracking-wider">Base Salary</span>
                      <span className="text-white">${slp.baseSalary.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 uppercase text-[8px] block tracking-wider">Bonus</span>
                      <span className="text-emerald-400">+${slp.bonus.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 uppercase text-[8px] block tracking-wider">Allowance</span>
                      <span className="text-indigo-300">+${slp.allowance.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 uppercase text-[8px] block tracking-wider">Deductions</span>
                      <span className="text-rose-400">-${slp.deductions.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2.5 pt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">Net Outflow:</span>
                      <span className="text-sm font-black text-indigo-400 font-mono">${slp.netSalary.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {slp.status === 'Pending' ? (
                        <button
                          onClick={() => onPaySlipUpdate(slp.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-550 border border-emerald-550 shadow-md rounded-xl text-[10px] font-extrabold text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Wallet className="w-3 h-3" />
                          <span>Process Payout</span>
                        </button>
                      ) : (
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Paid: <span className="font-semibold text-emerald-400">{slp.paymentDate || 'Paid'}</span>
                        </div>
                      )}
                      <button
                        onClick={() => onDeleteSlip(slp.id)}
                        className="text-[11px] text-rose-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/[0.01] space-y-2">
                <Coins className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-200">No payroll slip registers located</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Try adding a custom compensation profile to generate new slides.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Claim Addition form (Right - 5/12) */}
        <div className="lg:col-span-12 xl:col-span-5 glass-panel rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10 font-sans">
            <div className="p-2 bg-white/5 text-indigo-400 border border-white/10 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">Generate Salary Slip</h3>
              <p className="text-xs text-slate-400 font-sans font-light">Structure real-time monthly payroll and gross deductions</p>
            </div>
          </div>

          <form onSubmit={handleCreateSlip} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 font-sans">Target Employee *</label>
              <select
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 font-sans cursor-pointer focus:bg-slate-900"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              >
                <option value="" className="bg-slate-900 text-slate-400">--- Select Employee ---</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-200">
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-350 font-sans">Payment Period</label>
                <select
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-sans cursor-pointer"
                  value={formData.payPeriod}
                  onChange={(e) => setFormData({ ...formData, payPeriod: e.target.value })}
                >
                  <option value="May 2026" className="bg-slate-900 text-white">May 2026</option>
                  <option value="June 2026" className="bg-slate-900 text-white">June 2026</option>
                  <option value="July 2026" className="bg-slate-900 text-white">July 2026</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-350 font-sans">Base Month Salary ($) *</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-350 font-sans">Bonus ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-2 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-350 font-sans">Allowance ($)</label>
                <input
                  type="number"
                  placeholder="200"
                  className="w-full px-2 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono"
                  value={formData.allowance}
                  onChange={(e) => setFormData({ ...formData, allowance: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-350 font-sans">Deductions ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-2 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                />
              </div>
            </div>

            {/* Calculations Preview live */}
            {formData.employeeId && formData.baseSalary && (
              <div className="p-3 bg-indigo-505/10 border border-indigo-500/20 text-xs text-indigo-200 rounded-xl space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Gross Salary:</span>
                  <span>${(parseFloat(formData.baseSalary || '0') + parseFloat(formData.bonus || '0') + parseFloat(formData.allowance || '0')).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-indigo-500/10 pb-1">
                  <span>Deductions:</span>
                  <span className="text-rose-400">-${parseFloat(formData.deductions || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white text-sm">
                  <span>Net Take-home:</span>
                  <span className="text-emerald-400">
                    ${(
                      parseFloat(formData.baseSalary || '0') + 
                      parseFloat(formData.bonus || '0') + 
                      parseFloat(formData.allowance || '0') - 
                      parseFloat(formData.deductions || '0')
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 shadow-md rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.01] border border-indigo-500/30 cursor-pointer"
            >
              Generate Slip & Finalize
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
