import { dbService } from '../services/dbService.js';
import { uploadImageToStorage } from '../services/storageService.js';
import { findDuplicateComplaints } from '../services/duplicateService.js';
import { getDepartmentForCategory } from '../utils/constants.js';

export const createComplaint = async (req, res) => {
  try {
    const {
      issue_type,
      description,
      severity = 'Medium',
      confidence = 'High',
      department,
      recommendation,
      reason,
      latitude,
      longitude,
      address = '',
      image_url: providedImageUrl
    } = req.body;

    if (!issue_type || !description) {
      return res.status(400).json({ error: 'Issue type and description are required.' });
    }

    if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Valid geographic latitude and longitude coordinates are required.' });
    }

    // Determine image URL: either uploaded via multer in this request or previous staged URL
    let finalImageUrl = providedImageUrl;
    if (req.file) {
      finalImageUrl = await uploadImageToStorage(req.file);
    }

    if (!finalImageUrl) {
      return res.status(400).json({ error: 'A photograph of the civic issue is required.' });
    }

    // Determine responsible department
    const targetDepartment = department || getDepartmentForCategory(issue_type);

    const complaintData = {
      user_id: req.user ? req.user.id : null,
      citizen_name: req.user ? req.user.name : (req.body.citizen_name || 'Anonymous Citizen'),
      citizen_email: req.user ? req.user.email : (req.body.citizen_email || null),
      issue_type,
      description,
      severity,
      confidence,
      department: targetDepartment,
      recommendation,
      reason,
      image_url: finalImageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address
    };

    const newComplaint = await dbService.createComplaint(complaintData);

    return res.status(201).json({
      message: 'Civic complaint submitted successfully',
      complaint: newComplaint
    });
  } catch (error) {
    console.error('Create Complaint Error:', error);
    return res.status(500).json({ error: 'Failed to submit complaint: ' + error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      severity: req.query.severity,
      department: req.query.department,
      issue_type: req.query.issue_type,
      search: req.query.search
    };

    // Role-based authorization scoping
    if (req.user) {
      if (req.user.role === 'citizen') {
        // Citizens can ONLY view their own private complaints
        filters.user_id = req.user.id;
      } else if (req.user.role === 'department') {
        // Department staff can ONLY view complaints belonging to their assigned department
        filters.department = req.user.department;
      }
      // Admins can view all complaints
    }

    const complaints = await dbService.getAllComplaints(filters);

    return res.json({
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Get Complaints Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve complaints: ' + error.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await dbService.getComplaintById(id);

    if (!complaint) {
      return res.status(404).json({ error: `Complaint with ID ${id} not found.` });
    }

    // Role-based privacy check
    if (req.user) {
      if (req.user.role === 'citizen' && complaint.user_id && complaint.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only view your own complaints.' });
      }
      if (req.user.role === 'department' && complaint.department !== req.user.department) {
        return res.status(403).json({ error: `Access denied. Complaint belongs to ${complaint.department}.` });
      }
    } else {
      // For unauthenticated tracking by ID, strip private citizen details for privacy
      const sanitized = {
        ...complaint,
        citizen_name: 'Registered Citizen',
        citizen_email: null,
        user_id: null
      };
      return res.json({ complaint: sanitized });
    }

    return res.json({ complaint });
  } catch (error) {
    console.error('Get Complaint By ID Error:', error);
    return res.status(500).json({ error: 'Failed to load complaint: ' + error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const complaint = await dbService.getComplaintById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // Department staff authorization: can only update complaints of their own department
    if (req.user.role === 'department' && complaint.department !== req.user.department) {
      return res.status(403).json({ error: 'You are not authorized to modify complaints from other departments.' });
    }

    // Optional resolution proof image upload
    let resolutionImageUrl = null;
    if (req.file) {
      resolutionImageUrl = await uploadImageToStorage(req.file);
    } else if (req.body.resolution_image_url) {
      resolutionImageUrl = req.body.resolution_image_url;
    }

    const updated = await dbService.updateComplaintStatus(
      id,
      status,
      req.user.name || req.user.role,
      notes,
      resolutionImageUrl
    );

    return res.json({
      message: `Complaint status updated to ${status}`,
      complaint: updated
    });
  } catch (error) {
    console.error('Update Complaint Status Error:', error);
    return res.status(500).json({ error: 'Failed to update complaint status: ' + error.message });
  }
};

export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, assignedTo, notes } = req.body;

    if (!department) {
      return res.status(400).json({ error: 'Department is required for assignment.' });
    }

    const updated = await dbService.assignComplaint(id, {
      department,
      assignedTo: assignedTo || null,
      assignedBy: req.user.name || 'Admin',
      notes: notes || ''
    });

    return res.json({
      message: `Complaint assigned to ${department}`,
      complaint: updated
    });
  } catch (error) {
    console.error('Assign Complaint Error:', error);
    return res.status(500).json({ error: 'Failed to assign complaint: ' + error.message });
  }
};

export const checkDuplicates = async (req, res) => {
  try {
    const { latitude, longitude, issueType } = req.body;

    if (!latitude || !longitude || !issueType) {
      return res.status(400).json({ error: 'latitude, longitude, and issueType are required.' });
    }

    const allComplaints = await dbService.getAllComplaints();
    const duplicates = findDuplicateComplaints(allComplaints, { latitude, longitude, issueType });

    return res.json({
      hasDuplicates: duplicates.length > 0,
      count: duplicates.length,
      duplicates
    });
  } catch (error) {
    console.error('Duplicate Check Error:', error);
    return res.status(500).json({ error: 'Duplicate check failed: ' + error.message });
  }
};

export const getPublicStats = async (req, res) => {
  try {
    const stats = await dbService.getPublicStats();
    return res.json(stats);
  } catch (error) {
    console.error('Public Stats Error:', error);
    return res.status(500).json({ error: 'Failed to load public statistics: ' + error.message });
  }
};
