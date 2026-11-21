import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  MapPin,
  Calendar,
  AlertCircle,
  FileCheck,
  UserCheck,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { complaintService } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';

export const TrackComplaintPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [complaintId, setComplaintId] = useState(initialId);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (idToSearch) => {
    const id = (idToSearch || complaintId).trim();
    if (!id) return;

    setLoading(true);
    setError(null);
    setSearchParams({ id });

    try {
      const res = await complaintService.getComplaintById(id);
      if (res?.complaint) {
        setComplaint(res.complaint);
      } else {
        setError(`No complaint found with ID: ${id}`);
        setComplaint(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || `Complaint "${id}" not found. Verify the ID.`);
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Submitted', desc: 'Received & queued' },
    { title: 'Under Review', desc: 'AI triage verified' },
    { title: 'Assigned', desc: 'Allocated to department' },
    { title: 'In Progress', desc: 'Repair crew active' },
    { title: 'Resolved', desc: 'Verified & completed' }
  ];

  const getStepStatus = (stepName) => {
    if (!complaint) return 'upcoming';
    if (complaint.status === 'Rejected') {
      return stepName === 'Submitted' ? 'completed' : 'rejected';
    }

    const order = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
    const currentIndex = order.indexOf(complaint.status);
    const stepIndex = order.indexOf(stepName);

    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] mb-2">
          Public Complaint Audit Tracker
        </h1>
        <p className="text-xs text-slate-400">
          Enter your unique Tracking ID to inspect real-time triage status, municipal assignments, and resolution proof.
        </p>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        className="card p-3 max-w-xl mx-auto mb-10 flex gap-2 shadow-xl"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="e.g. CE-2026-10482"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            className="input-field text-sm pl-10 py-2.5 font-mono"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary px-6 text-xs rounded-xl font-bold">
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="card p-5 max-w-xl mx-auto border-red-900/60 bg-red-950/20 text-red-200 text-xs flex items-start gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Record Not Found: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Complaint Details Card */}
      {complaint && (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className="card p-6 border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">
                  ID: {complaint.id}
                </span>
                <h2 className="text-xl font-extrabold text-white font-['Outfit']">
                  {complaint.issue_type}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={complaint.severity} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {/* Lifecycle Stepper */}
            <div className="py-8">
              <div className="grid grid-cols-5 gap-2 relative">
                {steps.map((st, idx) => {
                  const state = getStepStatus(st.title);
                  const isDone = state === 'completed';
                  return (
                    <div key={idx} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                        {st.title}
                      </span>
                      <span className="text-[10px] text-slate-500 hidden sm:block">
                        {st.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Responsible Department</span>
                <span className="font-semibold text-blue-400 flex items-center gap-1 mt-0.5">
                  <Building2 size={13} /> {complaint.department}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reported Location</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin size={13} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{complaint.address || `${complaint.latitude}, ${complaint.longitude}`}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submission Date</span>
                <span className="font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                  <Calendar size={13} /> {new Date(complaint.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Photographs Comparison: Before vs After Resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-blue-400" />
                <span>Original Incident Photograph</span>
              </h3>
              <div className="w-full h-52 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={complaint.image_url?.startsWith('http') ? complaint.image_url : `http://localhost:5000${complaint.image_url}`}
                  alt="Incident reported"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileCheck size={14} className="text-emerald-400" />
                <span>Resolution Proof Photograph</span>
              </h3>
              {complaint.resolution_image_url ? (
                <div className="w-full h-52 rounded-xl overflow-hidden bg-slate-950 border border-emerald-900/60">
                  <img
                    src={complaint.resolution_image_url.startsWith('http') ? complaint.resolution_image_url : `http://localhost:5000${complaint.resolution_image_url}`}
                    alt="Resolution proof"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-52 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  <Clock size={28} className="mb-2 text-slate-600" />
                  <span className="text-xs font-semibold">Resolution Proof Pending</span>
                  <span className="text-[11px] text-slate-600 mt-1">
                    Department staff will upload photo proof upon issue resolution.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description & AI Triage Context */}
          <div className="card p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Grievance Description
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                {complaint.description}
              </p>
            </div>

            {complaint.recommendation && (
              <div>
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                  AI Triage Recommendation
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-blue-950/20 p-3 rounded-lg border border-blue-900/40">
                  {complaint.recommendation}
                </p>
              </div>
            )}

            {complaint.resolution_notes && (
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Official Municipal Resolution Remarks
                </h3>
                <p className="text-xs text-emerald-200 leading-relaxed bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40">
                  {complaint.resolution_notes}
                </p>
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          {complaint.history && complaint.history.length > 0 && (
            <div className="card p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={15} className="text-cyan-400" />
                <span>Transparent Audit Trail ({complaint.history.length} events)</span>
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {complaint.history.map((h, i) => (
                  <div key={h.id || i} className="flex items-start gap-4 pl-8 relative">
                    <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-slate-950"></div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{h.new_status}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.updated_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-400">{h.notes}</p>
                      <span className="text-[11px] text-slate-500 block">Logged by: {h.updated_by}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackComplaintPage;
