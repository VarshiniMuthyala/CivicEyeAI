import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

// Pre-hashed passwords for demo users:
// 'citizen123' -> $2a$10$w1QzH2JmR...
// 'admin123' -> $2a$10$w1QzH2JmR...
// 'staff123' -> $2a$10$w1QzH2JmR...
const salt = bcrypt.genSaltSync(10);
const citizenHash = bcrypt.hashSync('citizen123', salt);
const adminHash = bcrypt.hashSync('admin123', salt);
const staffHash = bcrypt.hashSync('staff123', salt);

// In-Memory / Local Seed Data Store
const localStore = {
  users: [
    {
      id: 'u-citizen-1',
      name: 'Priya Sharma',
      email: 'citizen@civiceye.org',
      password_hash: citizenHash,
      role: 'citizen',
      department: null,
      created_at: new Date('2026-01-10T09:00:00Z').toISOString()
    },
    {
      id: 'u-admin-1',
      name: 'Rajesh Varma (City Director)',
      email: 'admin@civiceye.org',
      password_hash: adminHash,
      role: 'admin',
      department: null,
      created_at: new Date('2026-01-01T08:00:00Z').toISOString()
    },
    {
      id: 'u-dept-roads',
      name: 'Vikram Reddy (Chief Engineer)',
      email: 'roads@civiceye.org',
      password_hash: staffHash,
      role: 'department',
      department: 'Roads and Infrastructure Department',
      created_at: new Date('2026-01-05T10:00:00Z').toISOString()
    },
    {
      id: 'u-dept-sanitation',
      name: 'Sunita Rao (Sanitation Lead)',
      email: 'sanitation@civiceye.org',
      password_hash: staffHash,
      role: 'department',
      department: 'Sanitation Department',
      created_at: new Date('2026-01-05T10:00:00Z').toISOString()
    }
  ],
  complaints: [
    {
      id: 'CE-2026-10482',
      user_id: 'u-citizen-1',
      citizen_name: 'Priya Sharma',
      citizen_email: 'citizen@civiceye.org',
      issue_type: 'Potholes and damaged roads',
      description: 'Massive deep pothole right in the middle of Main Street junction near clock tower, causing vehicles to swerve into oncoming traffic.',
      severity: 'Critical',
      confidence: 'High',
      department: 'Roads and Infrastructure Department',
      recommendation: 'Immediate cold-mix asphalt filling and placement of hazard warning cones.',
      reason: 'Deep crater on high-speed corridor presents an acute vehicular accident risk.',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      resolution_image_url: null,
      latitude: 17.385044,
      longitude: 78.486671,
      address: 'Main Street Clock Tower, Central Ward 4',
      status: 'In Progress',
      resolution_notes: 'Road crew dispatched with bitumen patching unit.',
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: 'CE-2026-10483',
      user_id: 'u-citizen-1',
      citizen_name: 'Priya Sharma',
      citizen_email: 'citizen@civiceye.org',
      issue_type: 'Garbage accumulation',
      description: 'Severe municipal waste pileup next to public school gate. Stagnant decay attracting stray animals.',
      severity: 'High',
      confidence: 'High',
      department: 'Sanitation Department',
      recommendation: 'Deploy compactor truck and sanitize perimeter with lime disinfectant.',
      reason: 'Hazardous bio-waste adjacent to primary school grounds posing health risks.',
      image_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
      resolution_image_url: null,
      latitude: 17.391211,
      longitude: 78.491322,
      address: 'School Road, Sector 7',
      status: 'Assigned',
      resolution_notes: 'Assigned to Ward 7 morning sweep squad.',
      created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    {
      id: 'CE-2026-10484',
      user_id: null,
      citizen_name: 'Anonymous Citizen',
      citizen_email: null,
      issue_type: 'Water leakage',
      description: 'High-pressure municipal potable pipeline rupture flooding pedestrian walkway and wasting drinking water.',
      severity: 'High',
      confidence: 'High',
      department: 'Water Supply Department',
      recommendation: 'Isolate upstream control valve and weld pipe fracture.',
      reason: 'Drinking water loss and pedestrian pathway erosion.',
      image_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
      resolution_image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
      latitude: 17.378945,
      longitude: 78.472891,
      address: 'Pipeline Road, Near Gandhi Park',
      status: 'Resolved',
      resolution_notes: 'Section isolated, 4-inch ductile iron sleeve installed, ground dried and tested clean.',
      created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
    },
    {
      id: 'CE-2026-10485',
      user_id: null,
      citizen_name: 'Anonymous Citizen',
      citizen_email: null,
      issue_type: 'Broken streetlights',
      description: 'Multiple streetlamp poles out of service along residential bypass creating a dark stretch for commuters.',
      severity: 'Medium',
      confidence: 'High',
      department: 'Electrical Department',
      recommendation: 'Replace faulty 70W LED luminaires and test circuit breaker box.',
      reason: 'Reduced nighttime visibility for pedestrians.',
      image_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
      resolution_image_url: null,
      latitude: 17.402133,
      longitude: 78.481234,
      address: 'Bypass Road, Cross 3',
      status: 'Submitted',
      resolution_notes: null,
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      id: 'CE-2026-10486',
      user_id: 'u-citizen-1',
      citizen_name: 'Priya Sharma',
      citizen_email: 'citizen@civiceye.org',
      issue_type: 'Drainage overflow',
      description: 'Stormwater drain silted up and backing water into market street.',
      severity: 'Medium',
      confidence: 'Medium',
      department: 'Drainage Department',
      recommendation: 'Desilt drain channel and clear grating debris.',
      reason: 'Minor street water stagnation during evening hours.',
      image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      resolution_image_url: null,
      latitude: 17.398412,
      longitude: 78.468921,
      address: 'Old Market Line 12',
      status: 'Under Review',
      resolution_notes: null,
      created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
    }
  ],
  assignments: [
    {
      id: 'a-1',
      complaint_id: 'CE-2026-10482',
      assigned_to: 'u-dept-roads',
      assigned_by: 'u-admin-1',
      department: 'Roads and Infrastructure Department',
      notes: 'Priority asphalt dispatch',
      assigned_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'a-2',
      complaint_id: 'CE-2026-10483',
      assigned_to: 'u-dept-sanitation',
      assigned_by: 'u-admin-1',
      department: 'Sanitation Department',
      notes: 'Clean waste near school',
      assigned_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    }
  ],
  complaint_history: [
    {
      id: 'h-1',
      complaint_id: 'CE-2026-10482',
      previous_status: 'Submitted',
      new_status: 'Under Review',
      updated_by: 'Rajesh Varma (Admin)',
      notes: 'Triage assessment verified',
      updated_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString()
    },
    {
      id: 'h-2',
      complaint_id: 'CE-2026-10482',
      previous_status: 'Under Review',
      new_status: 'Assigned',
      updated_by: 'Rajesh Varma (Admin)',
      notes: 'Assigned to Roads and Infrastructure Department',
      updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'h-3',
      complaint_id: 'CE-2026-10482',
      previous_status: 'Assigned',
      new_status: 'In Progress',
      updated_by: 'Vikram Reddy (Chief Engineer)',
      notes: 'Asphalt patching crew dispatched to Clock Tower',
      updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: 'h-4',
      complaint_id: 'CE-2026-10484',
      previous_status: 'In Progress',
      new_status: 'Resolved',
      updated_by: 'Water Supply Staff',
      notes: 'Pipeline fracture sleeved and leak halted.',
      updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
    }
  ]
};

export const dbService = {
  // === USER OPERATIONS ===
  async getUserByEmail(email) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      if (!error && data) return data;
    }
    return localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, department, created_at')
        .eq('id', id)
        .single();
      if (!error && data) return data;
    }
    const user = localStore.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async createUser({ name, email, password, role = 'citizen', department = null }) {
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password_hash,
      role,
      department: role === 'department' ? department : null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      if (!error && data) {
        const { password_hash, ...safe } = data;
        return safe;
      }
      console.warn('Supabase createUser failed, saving to local store:', error?.message);
    }

    localStore.users.push(newUser);
    const { password_hash: _, ...safe } = newUser;
    return safe;
  },

  // === COMPLAINT OPERATIONS ===
  generateComplaintId() {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `CE-${year}-${random}`;
  },

  async createComplaint(complaintData) {
    const id = this.generateComplaintId();
    const newComplaint = {
      id,
      user_id: complaintData.user_id || null,
      citizen_name: complaintData.citizen_name || 'Anonymous Citizen',
      citizen_email: complaintData.citizen_email || null,
      issue_type: complaintData.issue_type,
      description: complaintData.description,
      severity: complaintData.severity || 'Medium',
      confidence: complaintData.confidence || 'High',
      department: complaintData.department,
      recommendation: complaintData.recommendation || null,
      reason: complaintData.reason || null,
      image_url: complaintData.image_url,
      resolution_image_url: null,
      latitude: parseFloat(complaintData.latitude),
      longitude: parseFloat(complaintData.longitude),
      address: complaintData.address || '',
      status: 'Submitted',
      resolution_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .insert([newComplaint])
        .select()
        .single();
      if (!error && data) {
        await this.logHistory({
          complaint_id: id,
          previous_status: null,
          new_status: 'Submitted',
          updated_by: newComplaint.citizen_name,
          notes: 'Civic complaint submitted by citizen'
        });
        return data;
      }
      console.warn('Supabase createComplaint failed, saving to local store:', error?.message);
    }

    localStore.complaints.unshift(newComplaint);

    await this.logHistory({
      complaint_id: id,
      previous_status: null,
      new_status: 'Submitted',
      updated_by: newComplaint.citizen_name,
      notes: 'Civic complaint submitted by citizen'
    });

    return newComplaint;
  },

  async getAllComplaints(filters = {}) {
    let complaints = [];

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.severity) query = query.eq('severity', filters.severity);
      if (filters.department) query = query.eq('department', filters.department);
      if (filters.issue_type) query = query.eq('issue_type', filters.issue_type);
      if (filters.user_id) query = query.eq('user_id', filters.user_id);

      const { data, error } = await query;
      if (!error && data) {
        complaints = data;
      } else {
        console.warn('Supabase getAllComplaints failed, reading from local store:', error?.message);
        complaints = [...localStore.complaints];
      }
    } else {
      complaints = [...localStore.complaints];
    }

    // Apply filters locally (handles in-memory and search queries)
    let filtered = complaints;

    if (filters.user_id) {
      filtered = filtered.filter(c => c.user_id === filters.user_id);
    }
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(c => c.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.severity && filters.severity !== 'All') {
      filtered = filtered.filter(c => c.severity.toLowerCase() === filters.severity.toLowerCase());
    }
    if (filters.department && filters.department !== 'All') {
      filtered = filtered.filter(c => c.department.toLowerCase() === filters.department.toLowerCase());
    }
    if (filters.issue_type && filters.issue_type !== 'All') {
      filtered = filtered.filter(c => c.issue_type.toLowerCase() === filters.issue_type.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.issue_type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    }

    return filtered;
  },

  async getComplaintById(id) {
    let complaint = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) complaint = data;
    }

    if (!complaint) {
      complaint = localStore.complaints.find(c => c.id.toUpperCase() === id.toUpperCase()) || null;
    }

    if (!complaint) return null;

    // Fetch history and assignment details
    const history = await this.getComplaintHistory(complaint.id);
    const assignment = await this.getComplaintAssignment(complaint.id);

    return {
      ...complaint,
      history,
      assignment
    };
  },

  async updateComplaintStatus(id, newStatus, updatedBy = 'Admin', notes = '', resolutionImageUrl = null) {
    const existing = await this.getComplaintById(id);
    if (!existing) throw new Error('Complaint not found');

    const previousStatus = existing.status;
    const now = new Date().toISOString();

    const updates = {
      status: newStatus,
      updated_at: now
    };

    if (notes) updates.resolution_notes = notes;
    if (resolutionImageUrl) updates.resolution_image_url = resolutionImageUrl;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        await this.logHistory({
          complaint_id: id,
          previous_status: previousStatus,
          new_status: newStatus,
          updated_by: updatedBy,
          notes: notes || `Status changed from ${previousStatus} to ${newStatus}`
        });
        return data;
      }
    }

    // Local fallback update
    const idx = localStore.complaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      localStore.complaints[idx] = {
        ...localStore.complaints[idx],
        ...updates
      };
    }

    await this.logHistory({
      complaint_id: id,
      previous_status: previousStatus,
      new_status: newStatus,
      updated_by: updatedBy,
      notes: notes || `Status changed from ${previousStatus} to ${newStatus}`
    });

    return localStore.complaints[idx];
  },

  async assignComplaint(id, { department, assignedTo = null, assignedBy = 'Admin', notes = '' }) {
    const existing = await this.getComplaintById(id);
    if (!existing) throw new Error('Complaint not found');

    const previousStatus = existing.status;
    const newStatus = 'Assigned';
    const now = new Date().toISOString();

    const updates = {
      department,
      status: newStatus,
      updated_at: now
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('complaints').update(updates).eq('id', id);
      await supabase.from('assignments').insert([{
        complaint_id: id,
        assigned_to: assignedTo,
        assigned_by: assignedBy,
        department,
        notes,
        assigned_at: now
      }]);
    }

    // Local store update
    const idx = localStore.complaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      localStore.complaints[idx] = {
        ...localStore.complaints[idx],
        ...updates
      };
    }

    localStore.assignments.push({
      id: uuidv4(),
      complaint_id: id,
      assigned_to: assignedTo,
      assigned_by: assignedBy,
      department,
      notes,
      assigned_at: now
    });

    await this.logHistory({
      complaint_id: id,
      previous_status: previousStatus,
      new_status: newStatus,
      updated_by: assignedBy,
      notes: `Assigned to ${department}. Notes: ${notes || 'Assigned by authority'}`
    });

    return await this.getComplaintById(id);
  },

  // === HISTORY & AUDIT TRAIL ===
  async logHistory({ complaint_id, previous_status, new_status, updated_by, notes }) {
    const historyEntry = {
      id: uuidv4(),
      complaint_id,
      previous_status,
      new_status,
      updated_by,
      notes,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('complaint_history').insert([historyEntry]);
        return;
      } catch (e) {
        // Fall back to local
      }
    }

    localStore.complaint_history.push(historyEntry);
  },

  async getComplaintHistory(complaint_id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('complaint_history')
        .select('*')
        .eq('complaint_id', complaint_id)
        .order('updated_at', { ascending: false });
      if (!error && data) return data;
    }

    return localStore.complaint_history
      .filter(h => h.complaint_id === complaint_id)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  },

  async getComplaintAssignment(complaint_id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('complaint_id', complaint_id)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) return data;
    }

    const matches = localStore.assignments
      .filter(a => a.complaint_id === complaint_id)
      .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at));

    return matches.length > 0 ? matches[0] : null;
  },

  // === PUBLIC DASHBOARD AGGREGATED STATS ===
  async getPublicStats() {
    const complaints = await this.getAllComplaints();

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const inProgress = complaints.filter(c => ['In Progress', 'Assigned', 'Under Review'].includes(c.status)).length;
    const submitted = complaints.filter(c => c.status === 'Submitted').length;
    const critical = complaints.filter(c => c.severity === 'Critical').length;
    const high = complaints.filter(c => c.severity === 'High').length;

    // Category breakdown
    const byCategory = {};
    complaints.forEach(c => {
      byCategory[c.issue_type] = (byCategory[c.issue_type] || 0) + 1;
    });

    // Severity breakdown
    const bySeverity = {
      Critical: complaints.filter(c => c.severity === 'Critical').length,
      High: complaints.filter(c => c.severity === 'High').length,
      Medium: complaints.filter(c => c.severity === 'Medium').length,
      Low: complaints.filter(c => c.severity === 'Low').length
    };

    // Department breakdown
    const byDepartment = {};
    complaints.forEach(c => {
      byDepartment[c.department] = (byDepartment[c.department] || 0) + 1;
    });

    // Anonymized recent complaints for the public feed (NO personal info)
    const recentPublicFeed = complaints.slice(0, 10).map(c => ({
      id: c.id,
      issue_type: c.issue_type,
      description: c.description,
      severity: c.severity,
      department: c.department,
      status: c.status,
      address: c.address ? c.address.split(',')[0] : 'Urban Area',
      latitude: c.latitude,
      longitude: c.longitude,
      image_url: c.image_url,
      resolution_image_url: c.resolution_image_url,
      created_at: c.created_at
    }));

    return {
      total,
      resolved,
      inProgress,
      submitted,
      critical,
      high,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      byCategory,
      bySeverity,
      byDepartment,
      recentPublicFeed
    };
  }
};
