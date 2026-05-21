import React, { useState } from 'react';
import { ReimbursementClaim, Employee } from '../types';
import { Receipt, Search, Plus, Check, X, CreditCard, DollarSign, AlertCircle } from 'lucide-react';

interface ReimbursementsTabProps {
  employees: Employee[];
  claims: ReimbursementClaim[];
  onAddClaim: (claim: Omit<ReimbursementClaim, 'id' | 'status' | 'employeeName'>) => void;
  onUpdateClaimStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  onDeleteClaim: (id: string) => void;
}

export function ReimbursementsTab({
  employees,
  claims,
  onAddClaim,
  onUpdateClaimStatus,
  onDeleteClaim
}: ReimbursementsTabProps) {
  // Query Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Claim Addition Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    claimType: 'Prescription' as ReimbursementClaim['claimType'],
    amount: '',
    claimDate: new Date().toISOString().split('T')[0],
    description: '',
    receiptNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats calculation
  const totalClaimsCount = claims.length;
  const pendingAmount = claims.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);
  const approvedAmount = claims.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.employeeId) {
      setError('Please select an employee.');
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!formData.claimDate) {
      setError('Please select the claim date.');
      return;
    }
    if (!formData.receiptNumber.trim()) {
      setError('Please enter the receipt/invoice number.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter description detail.');
      return;
    }

    onAddClaim({
      employeeId: formData.employeeId,
      claimType: formData.claimType,
      amount: amt,
      claimDate: formData.claimDate,
      description: formData.description.trim(),
      receiptNumber: formData.receiptNumber.trim().toUpperCase()
    });

    setSuccess('Medical reimbursement claim filed!');
    // Reset form
    setFormData({
      employeeId: '',
      claimType: 'Prescription',
      amount: '',
      claimDate: new Date().toISOString().split('T')[0],
      description: '',
      receiptNumber: ''
    });

    setTimeout(() => {
      setSuccess('');
      setShowForm(false);
    }, 1500);
  };

  const filteredClaims = claims.filter(clm => {
    const matchesSearch = clm.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          clm.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          clm.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || clm.claimType === typeFilter;
    const matchesStatus = statusFilter === 'All' || clm.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: ReimbursementClaim['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
    }
  };

  return (
    <div id="reimbursements-workspace" className="space-y-6">
      
      {/* Quick Claims Dashboard Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 glass-panel rounded-2xl flex items-center justify-between shadow-md border border-white/8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Pending Validation
            </span>
            <div className="text-2xl font-black text-amber-400 tracking-tight font-sans">
              ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 glass-panel rounded-2xl flex items-center justify-between shadow-md border border-white/8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Approved Reimbursement
            </span>
            <div className="text-2xl font-black text-emerald-400 tracking-tight font-sans">
              ${approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 glass-panel rounded-2xl flex items-center justify-between shadow-md border border-white/8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Total Claims Filed
            </span>
            <div className="text-2xl font-black text-white tracking-tight font-sans">
              {totalClaimsCount} Claims
            </div>
          </div>
          <div className="p-2.5 bg-indigo-505/10 text-indigo-400 rounded-xl border border-white/10">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Ledger column (Left - 7/12) */}
        <div className="lg:col-span-12 xl:col-span-7 glass-panel rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/5 text-indigo-400 rounded-lg border border-white/10">
                <Receipt className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-white text-sm">Medical Reimbursement Audit Ledger</h3>
            </div>
            <button
              id="btn-trigger-claim-form"
              onClick={() => setShowForm(!showForm)}
              className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-550 border border-indigo-500/25 rounded-xl text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>File Claim Invoice</span>
            </button>
          </div>

          {/* Claim Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="search-claims"
                type="text"
                placeholder="Search recipe ID, name, desc..."
                className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-xl text-white outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-1.5 text-xs glass-input rounded-xl text-white font-sans cursor-pointer focus:bg-slate-900"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Expense Channels</option>
              <option value="Medical Checkup" className="bg-slate-900 text-slate-200">Medical Checkup</option>
              <option value="Prescription" className="bg-slate-900 text-slate-200">Prescription</option>
              <option value="Dental Care" className="bg-slate-900 text-slate-200">Dental Care</option>
              <option value="Vision Care" className="bg-slate-900 text-slate-200">Vision Care</option>
              <option value="Hospitalization" className="bg-slate-900 text-slate-200">Hospitalization</option>
            </select>

            <select
              className="px-3 py-1.5 text-xs glass-input rounded-xl text-white font-sans cursor-pointer focus:bg-slate-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Claim Statuses</option>
              <option value="Pending" className="bg-slate-900 text-slate-200">Pending Validation</option>
              <option value="Approved" className="bg-slate-900 text-slate-200">Approved</option>
              <option value="Rejected" className="bg-slate-900 text-slate-200">Rejected</option>
            </select>
          </div>

          {/* List mapping */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredClaims.length > 0 ? (
              filteredClaims.map((clm) => (
                <div
                  key={clm.id}
                  id={`claim-row-${clm.id}`}
                  className="p-3.5 glass-card hover:bg-white/10 rounded-2xl transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/8"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">{clm.employeeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wide bg-white/5 border border-white/10 px-1.5 rounded">
                        {clm.receiptNumber}
                      </span>
                      <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/22 px-1.5 py-0.2 rounded uppercase">
                        {clm.claimType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-light truncate">
                      {clm.description}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                      <span>Lodge Date: {clm.claimDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between md:justify-end shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-indigo-300 font-mono">
                        ${clm.amount.toFixed(2)}
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase tracking-wider inline-block mt-0.5 ${getStatusBadge(clm.status)}`}>
                        {clm.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {clm.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => onUpdateClaimStatus(clm.id, 'Approved')}
                            className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            title="Approve Claims"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onUpdateClaimStatus(clm.id, 'Rejected')}
                            className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/35 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            title="Reject Claims"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onDeleteClaim(clm.id)}
                          className="p-1 px-1.5 text-rose-400 hover:text-white hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 rounded-lg text-[9px] cursor-pointer font-semibold transition-all"
                          title="Purge"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/[0.01] space-y-2">
                <Receipt className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-bold text-slate-200">No medical reimbursement claims found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Try adjusting filters or searching a different receipt ledger.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Claim Addition form (Right - 5/12) */}
        <div className="lg:col-span-12 xl:col-span-5 glass-panel rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
            <div className="p-2 bg-white/5 text-indigo-400 border border-white/10 rounded-xl">
              <Plus className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">Lodge Medical Claim</h3>
              <p className="text-xs text-slate-400 font-sans font-light">Claim outpatient bill or generic prescription cover</p>
            </div>
          </div>

          <form onSubmit={handleSubmitClaim} className="space-y-4">
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
              <label className="text-xs font-semibold text-slate-300 font-sans">Claimed Member *</label>
              <select
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 font-sans cursor-pointer focus:bg-slate-900"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              >
                <option value="" className="bg-slate-900 text-slate-400">-- Choose employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-200">
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 font-sans">Hospital / Medical Area *</label>
              <select
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-white font-sans focus:bg-slate-900 cursor-pointer"
                value={formData.claimType}
                onChange={(e) => setFormData({ ...formData, claimType: e.target.value as any })}
              >
                <option value="Medical Checkup" className="bg-slate-900 text-slate-200">Medical Checkup</option>
                <option value="Prescription" className="bg-slate-900 text-slate-200">Prescription Cover</option>
                <option value="Dental Care" className="bg-slate-900 text-slate-200">Dental Care Invoice</option>
                <option value="Vision Care" className="bg-slate-900 text-slate-200">Vision Care / Lenses</option>
                <option value="Hospitalization" className="bg-slate-900 text-slate-200">Hospitalization Treatment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 font-sans">Claim Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 font-sans">Invoice/Receipt ID *</label>
                <input
                  type="text"
                  placeholder="REC-XXXXX"
                  className="w-full px-3 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono uppercase"
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 font-sans">Treatment Details *</label>
              <textarea
                className="w-full h-18 px-3 py-2 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-sans resize-none"
                placeholder="Specific clinical purpose, drugs prescribed or clinic name..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 shadow-md rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.01] border border-indigo-500/30 cursor-pointer"
            >
              Submit Reimbursement Invoice
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
