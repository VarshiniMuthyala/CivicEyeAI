/**
 * Haversine distance calculator between two lat/lng coordinates in meters
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Checks existing complaints to find potential duplicates within radius (default 100m)
 * and within recent time window (default 14 days)
 */
export const findDuplicateComplaints = (existingComplaints, newIssue) => {
  const { latitude, longitude, issueType } = newIssue;
  if (!latitude || !longitude || !issueType) return [];

  const THRESHOLD_METERS = 100; // 100 meters
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return existingComplaints.filter((comp) => {
    // Only compare complaints that are not yet Resolved or Rejected
    if (['Resolved', 'Rejected'].includes(comp.status)) return false;

    // Check time window
    const compTime = new Date(comp.created_at).getTime();
    if (now - compTime > FOURTEEN_DAYS_MS) return false;

    // Check category similarity
    const catMatch =
      comp.issue_type.toLowerCase() === issueType.toLowerCase() ||
      comp.issue_type.toLowerCase().includes(issueType.toLowerCase()) ||
      issueType.toLowerCase().includes(comp.issue_type.toLowerCase());

    if (!catMatch) return false;

    // Check geographic distance
    const distance = calculateDistanceMeters(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(comp.latitude),
      parseFloat(comp.longitude)
    );

    return distance <= THRESHOLD_METERS;
  }).map(comp => ({
    id: comp.id,
    issueType: comp.issue_type,
    status: comp.status,
    severity: comp.severity,
    address: comp.address,
    created_at: comp.created_at,
    distanceMeters: Math.round(
      calculateDistanceMeters(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(comp.latitude),
        parseFloat(comp.longitude)
      )
    )
  }));
};
