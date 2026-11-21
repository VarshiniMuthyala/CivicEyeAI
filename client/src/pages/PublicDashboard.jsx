import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Flame,
  Droplets,
  Trash2,
  Lightbulb,
  Building2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { complaintService } from '../services/api';
import CivicMap from '../components/CivicMap';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';

export const PublicDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        complaintService.getPublicStats(),
        complaintService.getComplaints()
      ]);
      if (statsRes) setStats(statsRes);
      if (complaintsRes?.complaints) setComplaints(complaintsRes.complaints);
    } catch (err) {
      console.error('Failed to load public dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = stats?.total || 0;
  const resolved = stats?.resolved || 0;
  const inProgress = stats?.inProgress || 0;
  const resolutionRate = stats?.resolutionRate || 0;
  const critical = stats?.critical || 0;

  const categories = stats?.byCategory || {};
  const severities = stats?.bySeverity || { Critical: 0, High: 0, Medium: 0, Low: 0 };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/70 border border-blue-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 size={13} />
            <span>Open Civic Pulse & Transparency</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
            Public Municipal Infrastructure Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Real-time urban infrastructure metrics, geospatial defect maps, and civic resolution analytics.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="btn btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
        <div className="card p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Total Issues Logged</span>
          <div className="text-3xl font-extrabold text-white font-['Outfit']">{total}</div>
        </div>
        <div className="card p-4 border-emerald-900/40 bg-emerald-950/10">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase block mb-1">Resolved Defects</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-['Outfit']">{resolved}</div>
        </div>
        <div className="card p-4 border-blue-900/40 bg-blue-950/10">
          <span className="text-[11px] font-semibold text-cyan-300 uppercase block mb-1">Resolution Rate</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-['Outfit']">{resolutionRate}%</div>
        </div>
        <div className="card p-4 border-amber-900/40 bg-amber-950/10">
          <span className="text-[11px] font-semibold text-amber-300 uppercase block mb-1">Active Triage</span>
          <div className="text-3xl font-extrabold text-amber-400 font-['Outfit']">{inProgress}</div>
        </div>
        <div className="card p-4 border-red-900/40 bg-red-950/10 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-red-300 uppercase block mb-1">Critical Hazards</span>
          <div className="text-3xl font-extrabold text-red-400 font-['Outfit']">{critical}</div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin size={16} className="text-cyan-400" />
            <span>Geospatial Issue Distribution (Live Map)</span>
          </h2>
          <span className="text-xs text-slate-400">Click pins for details & photo preview</span>
        </div>
        <CivicMap complaints={complaints} height="520px" />
      </div>

      {/* Analytics Breakdown: Category & Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Categories Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Issues by Category
          </h3>
          <div className="space-y-3">
            {Object.keys(categories).length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No category data available</div>
            ) : (
              Object.entries(categories).map(([cat, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <span className="font-mono text-cyan-400 font-bold">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Issues by Severity Classification
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/50">
              <span className="text-xs font-bold text-red-300 uppercase block mb-1">Critical</span>
              <div className="text-3xl font-extrabold text-red-400 font-['Outfit']">{severities.Critical || 0}</div>
              <span className="text-[11px] text-slate-400">Immediate public danger</span>
            </div>
            <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-900/50">
              <span className="text-xs font-bold text-orange-300 uppercase block mb-1">High</span>
              <div className="text-3xl font-extrabold text-orange-400 font-['Outfit']">{severities.High || 0}</div>
              <span className="text-[11px] text-slate-400">Priority triage needed</span>
            </div>
            <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-900/50">
              <span className="text-xs font-bold text-yellow-300 uppercase block mb-1">Medium</span>
              <div className="text-3xl font-extrabold text-yellow-400 font-['Outfit']">{severities.Medium || 0}</div>
              <span className="text-[11px] text-slate-400">Standard maintenance</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50">
              <span className="text-xs font-bold text-emerald-300 uppercase block mb-1">Low</span>
              <div className="text-3xl font-extrabold text-emerald-400 font-['Outfit']">{severities.Low || 0}</div>
              <span className="text-[11px] text-slate-400">Minor routine repair</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Public Complaints Activity Feed (Anonymized) */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Recent Public Grievance Feed (Privacy Protected)</span>
          <span className="text-[11px] text-slate-500 font-normal">Identities anonymized</span>
        </h3>

        <div className="divide-y divide-slate-800">
          {(stats?.recentPublicFeed || complaints.slice(0, 8)).map((feedItem) => (
            <div key={feedItem.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                  {feedItem.image_url ? (
                    <img
                      src={feedItem.image_url.startsWith('http') ? feedItem.image_url : `http://localhost:5000${feedItem.image_url}`}
                      alt={feedItem.issue_type}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">IMG</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">{feedItem.id}</span>
                    <span className="text-xs font-bold text-white">{feedItem.issue_type}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">
                    {feedItem.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <SeverityBadge severity={feedItem.severity} size="small" />
                <StatusBadge status={feedItem.status} size="small" />
                <a
                  href={`/track?id=${feedItem.id}`}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg"
                  title="View Audit Trail"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
