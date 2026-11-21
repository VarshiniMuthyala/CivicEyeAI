export const CIVIC_CATEGORIES = [
  'Potholes and damaged roads',
  'Garbage accumulation',
  'Water leakage',
  'Drainage overflow',
  'Broken streetlights',
  'Public infrastructure damage',
  'Pollution',
  'Other civic issues'
];

export const DEPARTMENTS = [
  'Roads and Infrastructure Department',
  'Sanitation Department',
  'Water Supply Department',
  'Drainage Department',
  'Electrical Department',
  'Environmental Department',
  'Public Works Department',
  'General Administration'
];

export const SEVERITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

export const COMPLAINT_STATUSES = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected'
];

export const CATEGORY_DEPARTMENT_MAP = {
  'Potholes and damaged roads': 'Roads and Infrastructure Department',
  'Potholes': 'Roads and Infrastructure Department',
  'Garbage accumulation': 'Sanitation Department',
  'Garbage': 'Sanitation Department',
  'Water leakage': 'Water Supply Department',
  'Water': 'Water Supply Department',
  'Drainage overflow': 'Drainage Department',
  'Drainage': 'Drainage Department',
  'Broken streetlights': 'Electrical Department',
  'Streetlights': 'Electrical Department',
  'Public infrastructure damage': 'Public Works Department',
  'Infrastructure': 'Public Works Department',
  'Pollution': 'Environmental Department',
  'Other civic issues': 'General Administration',
  'Other': 'General Administration'
};
