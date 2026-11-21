import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  Play,
  PlusCircle,
  Search,
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';

export const CitizenDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/citizen');
      return;
    }

    const fetchMyComplaints = async () => {
      setLoading(true);
      try {
        const res = await complaintService.getComplaints();
        if (res?.complaints) {
          setComplaints(res.complaints);
        }
      } catch (err) {
        console.error('Failed to load citizen complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();
  }, [isAuthenticated, navigate]);

  // Metrics
  const total = complaints.length;
  const pending = complaints.filter(c => ['Submitted', 'Under Review'].includes(c.status)).length;
  const inProgress = complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  // Filter complaints
  const filtered = complaints.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.issue_type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Citizen Grievance Portal
          </h1>
          <p className="text-sm text-slate-400">
            Welcome, <span className="text-cyan-400 font-semibold">{user?.name}</span>. Monitor your reported municipal issues and tracking histories.
          </p>
        </div>

        <Link
          to="/report"
          className="btn btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
        >
          <PlusCircle size={15} />
          <span>Report New Grievance</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Reports</span>
            <FileText size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-['Outfit']">{total}</div>
        </div>

        <div className="card p-4 border-amber-900/40 bg-amber-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Under Review</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-['Outfit']">{pending}</div>
        </div>

        <div className="card p-4 border-blue-900/40 bg-blue-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">In Progress</span>
            <Play size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-['Outfit']">{inProgress}</div>
        </div>

        <div className="card p-4 border-emerald-900/40 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Resolved</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-['Outfit']">{resolved}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field text-xs pl-9 py-2"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs py-2 w-full sm:w-44"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">
          Loading your civic reports...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <AlertCircle size={32} className="text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No complaints found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'All'
              ? 'No reports match your current filters. Try resetting the filter.'
              : 'You have not submitted any civic grievances yet.'}
          </p>
          <Link to="/report" className="btn btn-primary text-xs py-2 px-4 rounded-lg inline-flex mt-2">
            Report an Issue Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider block mb-1">
                      {item.id}
                    </span>
                    <h3 className="text-base font-bold text-white line-clamp-1">{item.issue_type}</h3>
                  </div>
                  <SeverityBadge severity={item.severity} size="small" />
                </div>

                {item.image_url && (
                  <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                    <img
                      src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                      alt={item.issue_type}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span>Department:</span>
                    <span className="text-slate-200 font-semibold">{item.department}</span>
                  </div>
                  {item.address && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                      <MapPin size={12} className="shrink-0 text-cyan-400" />
                      <span className="truncate">{item.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar size={12} className="shrink-0" />
                    <span>Reported {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-4">
                <StatusBadge status={item.status} size="small" />
                <Link
                  to={`/track?id=${item.id}`}
                  className="btn btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 text-cyan-300 hover:text-white"
                >
                  <span>Track Full Audit</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
