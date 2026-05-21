import React, { useState } from 'react';
import { AttendanceLog } from '../types';
import { Calendar, Search, Filter, Trash2, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface AttendanceListProps {
  logs: AttendanceLog[];
  onDeleteLog: (id: string) => void;
}

export function AttendanceList({ logs, onDeleteLog }: AttendanceListProps) {
  // Filter states
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Calculates worked duration
  const calculateHours = (clockIn: string, clockOut?: string): string => {
    if (!clockOut) return 'Active';
    const [inH, inM] = clockIn.split(':').map(Number);
    const [outH, outM] = clockOut.split(':').map(Number);
    const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (isNaN(diffMinutes) || diffMinutes < 0) return '0h';
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const getStatusBadge = (status: AttendanceLog['status']) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/22';
      case 'Late':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/22';
      case 'Half Day':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/22';
      case 'Absent':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/22';
    }
  };

  // Filter logs logic
  const filteredLogs = [...logs]
    .filter(log => {
      const matchDate = !dateFilter || log.date === dateFilter;
      const matchSearch = !searchFilter || log.employeeName.toLowerCase().includes(searchFilter.toLowerCase());
      const matchStatus = statusFilter === 'All' || log.status === statusFilter;
      return matchDate && matchSearch && matchStatus;
    })
    // Sort recently logged first
    .sort((a, b) => b.id.localeCompare(a.id));

  const handleResetFilters = () => {
    setDateFilter('');
    setSearchFilter('');
    setStatusFilter('All');
  };

  return (
    <div id="attendance-list-container" className="glass-panel rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px]">
      {/* Search Header controls */}
      <div className="p-4 bg-white/[0.02] border-b border-white/10 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Attendance Registry Ledger</span>
          </h3>
          <button
            id="btn-reset-filters"
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3" />
            Reset Filters
          </button>
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Query search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-405" />
            <input
              id="filter-search"
              type="text"
              placeholder="Search employee..."
              className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-xl text-white outline-none"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {/* Date Picker */}
          <div className="relative">
            <input
              id="filter-date"
              type="date"
              className="w-full pl-3 pr-3 py-1.5 text-xs glass-input rounded-xl text-white font-mono focus:bg-slate-900"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* Status select */}
          <div className="relative">
            <select
              id="filter-status"
              className="w-full pl-3 pr-3 py-1.5 text-xs glass-input rounded-xl text-white focus:bg-slate-900 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All" className="bg-slate-900 text-slate-200">All Statuses</option>
              <option value="Present" className="bg-slate-900 text-slate-200">Present</option>
              <option value="Late" className="bg-slate-900 text-slate-200">Late</option>
              <option value="Half Day" className="bg-slate-900 text-slate-200">Half Day</option>
              <option value="Absent" className="bg-slate-900 text-slate-200">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Register List view */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 bg-transparent">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              id={`log-item-${log.id}`}
              className="p-3.5 hover:bg-white/5 transition-colors flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-bold text-slate-100 text-xs truncate max-w-[150px] font-sans">
                    {log.employeeName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {log.date}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border font-sans uppercase tracking-wide ${getStatusBadge(
                      log.status
                    )}`}
                  >
                    {log.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-350 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {log.clockIn} - {log.clockOut || 'present'}
                    </span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="font-semibold text-slate-300 font-sans flex items-center gap-1">
                    Duration: {log.clockOut ? (
                      <span className="font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 rounded">{calculateHours(log.clockIn, log.clockOut)}</span>
                    ) : (
                      <span className="text-amber-400 bg-amber-500/15 border border-amber-500/20 px-1.5 rounded font-bold animate-pulse">On duty</span>
                    )}
                  </span>
                </div>

                {log.notes && (
                  <p className="text-[11px] text-slate-400 italic font-sans max-w-sm truncate pt-0.5" title={log.notes}>
                    &ldquo;{log.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action */}
              <button
                id={`btn-del-log-${log.id}`}
                onClick={() => onDeleteLog(log.id)}
                className="p-1.5 text-slate-400 hover:text-rose-450 hover:bg-rose-500/15 rounded-xl shrink-0 cursor-pointer transition-colors"
                title="Remove log entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-24 px-4 flex flex-col items-center justify-center text-center space-y-3 text-slate-450">
            <AlertCircle className="w-8 h-8 text-slate-500" />
            <div className="space-y-1 max-w-xs">
              <h4 className="text-xs font-bold text-slate-200 font-sans">No matching clock logs</h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Try adjust or reset filters to view logged history for this query.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
