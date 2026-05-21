import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LeaveRequest, Employee } from '../types';
import { CalendarRange, Search, Check, X, FileText, Plus, AlertCircle } from 'lucide-react';

interface LeaveRequestsTabProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  onAddLeave: (leave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status' | 'employeeName'>) => void;
  onUpdateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  onDeleteLeave: (id: string) => void;
}

export function LeaveRequestsTab({
  employees,
  leaves,
  onAddLeave,
  onUpdateLeaveStatus,
  onDeleteLeave
}: LeaveRequestsTabProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  
  // Create state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'Annual Leave' as LeaveRequest['leaveType'],
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // active employees can request leaves
  const activePersonnel = employees.filter(e => e.status === 'Active' || e.status === 'On Leave');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.employeeId) {
      setError('Please select an employee.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      setError('End date cannot precede start date.');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason.');
      return;
    }

    onAddLeave({
      employeeId: formData.employeeId,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason.trim()
    });

    setSuccess('Leave request lodged successfully!');
    setFormData({
      employeeId: '',
      leaveType: 'Annual Leave',
      startDate: '',
      endDate: '',
      reason: ''
    });
    
    setTimeout(() => {
      setSuccess('');
      setShowForm(false);
    }, 1500);
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Pending':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
    }
  };

  const filteredLeaves = leaves.filter(lve => {
    const matchesQuery = lve.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lve.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lve.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lve.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div id="leave-requests-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Leaves list Ledger (Left col - 7/12) */}
      <div className="lg:col-span-7 glass-panel rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/5 text-indigo-400 rounded-lg border border-white/10">
              <CalendarRange className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-white text-sm">Leave Request Registry</h3>
          </div>
          <button
            id="btn-trigger-leave-form"
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-550 border border-indigo-500/25 rounded-xl text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply Leave</span>
          </button>
        </div>

        {/* Filters and search queries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="search-leaves"
              type="text"
              placeholder="Search by name, reason..."
              className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-xl text-white outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            id="filter-leaves-status"
            className="px-3 py-1.5 text-xs glass-input rounded-xl text-white font-sans cursor-pointer focus:bg-slate-900"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All" className="bg-slate-900 text-slate-200">All Requests</option>
            <option value="Pending" className="bg-slate-900 text-slate-200">Pending Approval</option>
            <option value="Approved" className="bg-slate-900 text-slate-200">Approved</option>
            <option value="Rejected" className="bg-slate-900 text-slate-200">Rejected</option>
          </select>
        </div>

        {/* List mapping */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredLeaves.length > 0 ? (
            filteredLeaves.map((lve) => (
              <div
                key={lve.id}
                id={`leave-row-${lve.id}`}
                className="p-4 glass-card hover:bg-white/10 rounded-2xl transition-all shadow-md flex flex-col justify-between gap-3 border border-white/8"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-tight">{lve.employeeName}</h4>
                    <p className="text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px] uppercase border border-indigo-500/25 inline-block mt-0.5">
                      {lve.leaveType}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(lve.status)}`}>
                    {lve.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-indigo-200 font-semibold">
                    <span>Duration:</span>
                    <span className="font-mono text-white">{lve.startDate}</span>
                    <span className="text-slate-500">to</span>
                    <span className="font-mono text-white">{lve.endDate}</span>
                  </div>
                  <p className="font-sans font-light italic text-slate-300">
                    &ldquo;{lve.reason}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Applied: {lve.appliedDate}
                  </span>
                  
                  {lve.status === 'Pending' ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onUpdateLeaveStatus(lve.id, 'Approved')}
                        className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                        title="Approve leave"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => onUpdateLeaveStatus(lve.id, 'Rejected')}
                        className="p-1 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/35 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                        title="Reject leave"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onDeleteLeave(lve.id)}
                      className="text-[10px] text-rose-400 hover:text-rose-350 hover:underline transition-all cursor-pointer"
                    >
                      Delete record
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/[0.01] space-y-2">
              <CalendarRange className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-200">No leave requests found</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No request record fits this query, or all have been purged.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Leave Application Form (Right col - 5/12) */}
      <div className="lg:col-span-5 glass-panel rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
          <div className="p-2 bg-white/5 text-indigo-400 border border-white/10 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans">Apply Leave Entry</h3>
            <p className="text-xs text-slate-400 font-sans">Lodge a new official leave request for staff</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-xs font-semibold text-slate-300 font-sans">Select Employee *</label>
            <select
              className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 font-sans cursor-pointer focus:bg-slate-900"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            >
              <option value="" className="bg-slate-900 text-slate-400">-- Choose active employee --</option>
              {activePersonnel.map(emp => (
                <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-200">
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 font-sans">Leave Category *</label>
            <select
              className="w-full px-3 py-2 text-sm glass-input rounded-xl text-white font-sans focus:bg-slate-900 cursor-pointer"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
            >
              <option value="Annual Leave" className="bg-slate-900 text-slate-200">Annual Leave</option>
              <option value="Sick Leave" className="bg-slate-900 text-slate-200">Sick Leave</option>
              <option value="Maternity/Paternity" className="bg-slate-900 text-slate-200">Maternity/Paternity</option>
              <option value="Compassionate" className="bg-slate-900 text-slate-200">Compassionate</option>
              <option value="Unpaid" className="bg-slate-900 text-slate-200">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 font-sans">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 font-sans">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 font-sans">Reason / Justification *</label>
            <textarea
              className="w-full h-20 px-3 py-2 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-sans resize-none"
              placeholder="Provide medical certificate or family emergency remarks..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 shadow-md rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.01] border border-indigo-500/30 font-sans cursor-pointer"
          >
            Submit Leave Request
          </button>
        </form>
      </div>
    </div>
  );
}
