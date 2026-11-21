import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  ExternalLink,
  Upload,
  RefreshCw,
  Eye,
  FileCheck,
  X
} from 'lucide-react';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import { DEPARTMENTS, CIVIC_CATEGORIES, COMPLAINT_STATUSES } from '../utils/constants';

export const AdminDashboard = () => {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Management Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editDept, setEditDept] = useState('');
  const [notes, setNotes] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/login?redirect=/admin');
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
      console.error('Failed to load admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const total = complaints.length;
  const pending = complaints.filter(c => ['Submitted', 'Under Review'].includes(c.status)).length;
  const critical = complaints.filter(c => c.severity === 'Critical').length;
  const high = complaints.filter(c => c.severity === 'High').length;
  const assigned = complaints.filter(c => c.status === 'Assigned').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  // Filtered complaints
  const filtered = complaints.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (severityFilter !== 'All' && c.severity !== severityFilter) return false;
    if (deptFilter !== 'All' && c.department !== deptFilter) return false;
    if (categoryFilter !== 'All' && c.issue_type !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.issue_type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const openManageModal = (complaint) => {
    setSelectedComplaint(complaint);
    setEditStatus(complaint.status);
    setEditDept(complaint.department);
    setNotes(complaint.resolution_notes || '');
    setResolutionFile(null);
    setModalOpen(true);
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      // 1. If department changed, call assign
      if (editDept !== selectedComplaint.department) {
        await complaintService.assignComplaint(selectedComplaint.id, {
          department: editDept,
          notes: notes || `Reassigned to ${editDept}`
        });
      }

      // 2. If status or resolution proof changed, update status
      const formData = new FormData();
      formData.append('status', editStatus);
      if (notes) formData.append('notes', notes);
      if (resolutionFile) formData.append('resolution_image', resolutionFile);

      await complaintService.updateStatus(selectedComplaint.id, formData);

      // Refresh list
      await loadComplaints();
      setModalOpen(false);
      setSelectedComplaint(null);
    } catch (err) {
      console.error('Failed to update complaint:', err);
      alert('Error updating complaint: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield size={13} />
            <span>Municipal Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
            Admin Triage & Governance Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Review Google Gemini AI assessments, verify infrastructure grievances, and dispatch municipal repair squads.
          </p>
        </div>

        <button
          onClick={loadComplaints}
          disabled={loading}
          className="btn btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="card p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Total Reports</span>
          <div className="text-2xl font-extrabold text-white font-['Outfit']">{total}</div>
        </div>
        <div className="card p-4 border-amber-900/40 bg-amber-950/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Under Review</span>
          <div className="text-2xl font-extrabold text-amber-400 font-['Outfit']">{pending}</div>
        </div>
        <div className="card p-4 border-red-900/50 bg-red-950/15">
          <span className="text-[11px] font-semibold text-red-300 uppercase block mb-1">Critical</span>
          <div className="text-2xl font-extrabold text-red-400 font-['Outfit']">{critical}</div>
        </div>
        <div className="card p-4 border-orange-900/40 bg-orange-950/10">
          <span className="text-[11px] font-semibold text-orange-300 uppercase block mb-1">High Priority</span>
          <div className="text-2xl font-extrabold text-orange-400 font-['Outfit']">{high}</div>
        </div>
        <div className="card p-4 border-purple-900/40 bg-purple-950/10">
          <span className="text-[11px] font-semibold text-purple-300 uppercase block mb-1">Assigned</span>
          <div className="text-2xl font-extrabold text-purple-400 font-['Outfit']">{assigned}</div>
        </div>
        <div className="card p-4 border-emerald-900/40 bg-emerald-950/10">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase block mb-1">Resolved</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-['Outfit']">{resolved}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <Search size={15} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, issue, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field text-xs pl-9 py-2"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-xs py-1.5"
            >
              <option value="All">All Statuses</option>
              {COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="input-field text-xs py-1.5"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="input-field text-xs py-1.5"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field text-xs py-1.5"
            >
              <option value="All">All Categories</option>
              {CIVIC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Category & Description</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Loading municipal complaints...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No complaints match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.image_url ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                          <img
                            src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                            alt={item.issue_type}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-900 text-slate-600 flex items-center justify-center">
                          <Eye size={16} />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-white mb-0.5">{item.issue_type}</div>
                      <div className="text-slate-400 truncate text-[11px]">{item.description}</div>
                      {item.address && (
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">📍 {item.address}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SeverityBadge severity={item.severity} size="small" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {item.department}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} size="small" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openManageModal(item)}
                        className="btn btn-primary text-xs py-1.5 px-3 rounded-lg"
                      >
                        Triage & Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Triage & Assignment Modal */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card p-6 max-w-2xl w-full border-slate-700 shadow-2xl relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs font-bold text-cyan-400">{selectedComplaint.id}</span>
              <SeverityBadge severity={selectedComplaint.severity} size="small" />
              <StatusBadge status={selectedComplaint.status} size="small" />
            </div>

            <h2 className="text-xl font-bold text-white font-['Outfit'] mb-2">
              {selectedComplaint.issue_type}
            </h2>

            {/* AI Review Box */}
            <div className="p-3.5 bg-blue-950/30 border border-blue-900/50 rounded-xl text-xs space-y-2 mb-5">
              <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span>🤖 Google Gemini AI Triage Insight</span>
              </div>
              <p className="text-slate-300"><strong className="text-white">Reasoning:</strong> {selectedComplaint.reason || 'AI triage based on image evaluation.'}</p>
              <p className="text-slate-300"><strong className="text-white">Suggested Action:</strong> {selectedComplaint.recommendation || 'Inspect site and dispatch repairs.'}</p>
            </div>

            {/* Photos */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Issue Photo</span>
                <div className="h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={selectedComplaint.image_url?.startsWith('http') ? selectedComplaint.image_url : `http://localhost:5000${selectedComplaint.image_url}`}
                    alt="Issue"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Resolution Proof</span>
                {selectedComplaint.resolution_image_url ? (
                  <div className="h-36 rounded-lg overflow-hidden bg-slate-950 border border-emerald-900/60">
                    <img
                      src={selectedComplaint.resolution_image_url.startsWith('http') ? selectedComplaint.resolution_image_url : `http://localhost:5000${selectedComplaint.resolution_image_url}`}
                      alt="Resolution"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-36 rounded-lg bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                    Not resolved yet
                  </div>
                )}
              </div>
            </div>

            {/* Management Form */}
            <form onSubmit={handleUpdateComplaint} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Assign Responsible Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="input-field text-xs py-2"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Update Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="input-field text-xs py-2"
                  >
                    {COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Resolution Notes / Action Taken</label>
                <textarea
                  rows={2}
                  placeholder="Enter dispatch notes, repair confirmation, or triage rationale..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field text-xs resize-none"
                />
              </div>

              {/* Upload resolution proof photograph */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Upload Resolution Proof Photograph (Optional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setResolutionFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
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
                  disabled={updating}
                  className="btn btn-primary text-xs py-2 px-5 rounded-lg font-bold flex items-center gap-1.5"
                >
                  {updating ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  <span>Save Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
