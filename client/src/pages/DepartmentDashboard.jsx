import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle,
  Play,
  Clock,
  MapPin,
  Camera,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';

export const DepartmentDashboard = () => {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [notes, setNotes] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || role !== 'department') {
      navigate('/login?redirect=/department');
      return;
    }

    loadComplaints();
  }, [isAuthenticated, role, navigate]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getComplaints();
      if (res?.complaints) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      console.error('Failed to load department complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status === 'Resolved' ? 'Resolved' : 'In Progress');
    setNotes(complaint.resolution_notes || '');
    setResolutionFile(null);
    setModalOpen(true);
  };

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (notes) formData.append('notes', notes);
      if (resolutionFile) formData.append('resolution_image', resolutionFile);

      await complaintService.updateStatus(selectedComplaint.id, formData);
      await loadComplaints();
      setModalOpen(false);
      setSelectedComplaint(null);
    } catch (err) {
      console.error('Failed to update resolution:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const filtered = complaints.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase size={13} />
            <span>Field Operations Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
            {user?.department || 'Department Task Board'}
          </h1>
          <p className="text-xs text-slate-400">
            Assigned squad tasks, photo proofs of repair, and incident resolution workflows.
          </p>
        </div>

        <button
          onClick={loadComplaints}
          disabled={loading}
          className="btn btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-3.5 mb-6 flex items-center justify-between">
        <span className="text-xs text-slate-300 font-semibold">
          Department Active Queue ({filtered.length} tasks)
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs py-1.5 w-36"
          >
            <option value="All">All Tasks</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">
          Loading assigned department tasks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center space-y-2">
          <CheckCircle size={32} className="text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No active tasks in queue</h3>
          <p className="text-xs text-slate-500">
            All complaints assigned to {user?.department} are currently up-to-date!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div key={item.id} className="card p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-400 block mb-0.5">
                      {item.id}
                    </span>
                    <h3 className="text-base font-bold text-white line-clamp-1">{item.issue_type}</h3>
                  </div>
                  <SeverityBadge severity={item.severity} size="small" />
                </div>

                {item.image_url && (
                  <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                    <img
                      src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                      alt={item.issue_type}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {item.description}
                </p>

                {/* AI Recommendation snippet */}
                {item.recommendation && (
                  <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/40 text-[11px] text-blue-300 mb-3">
                    <strong className="text-cyan-400">AI Suggested Action: </strong>
                    <span>{item.recommendation}</span>
                  </div>
                )}

                <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800 pt-3">
                  {item.address && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-300 truncate">
                      <MapPin size={12} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{item.address}</span>
                    </div>
                  )}
                  {item.resolution_notes && (
                    <div className="text-[11px] text-emerald-400">
                      <strong>Remarks: </strong> {item.resolution_notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-4">
                <StatusBadge status={item.status} size="small" />
                <button
                  onClick={() => openActionModal(item)}
                  className="btn btn-primary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                >
                  <FileCheck size={13} />
                  <span>Update Progress / Resolve</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress / Resolution Modal */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-lg w-full border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <span className="font-mono text-xs font-bold text-cyan-400 block mb-1">
              Task: {selectedComplaint.id}
            </span>
            <h2 className="text-lg font-bold text-white font-['Outfit'] mb-4">
              Update Field Status & Resolution Proof
            </h2>

            <form onSubmit={handleSubmitResolution} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Field Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field text-xs py-2"
                >
                  <option value="In Progress">In Progress (Crews Dispatched)</option>
                  <option value="Resolved">Resolved (Repairs Finished)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Upload Resolution Proof Photograph (Required when marking Resolved)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setResolutionFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Field Notes / Repair Confirmation</label>
                <textarea
                  rows={3}
                  placeholder="Detail the repair completed (e.g. 5m bitumen patched, pipeline leak welded, debris cleared)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field text-xs resize-none"
                  required={newStatus === 'Resolved'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary text-xs py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary text-xs py-2 px-5 rounded-lg font-bold flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDashboard;
