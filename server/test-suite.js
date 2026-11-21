// Comprehensive E2E Test Suite for CivicEye AI Backend
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting CivicEye AI Automated Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  let citizenToken = '';
  let adminToken = '';
  let createdComplaintId = '';

  // 1. Health Check
  await test('Health check endpoint responds online', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'online') {
      throw new Error(`Expected status online, got ${JSON.stringify(data)}`);
    }
  });

  // 2. Citizen Registration
  const testEmail = `test_citizen_${Date.now()}@test.org`;
  await test('Register citizen account', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Kumar',
        email: testEmail,
        password: 'password123',
        role: 'citizen'
      })
    });
    const data = await res.json();
    if (res.status !== 201 || !data.token || data.user.role !== 'citizen') {
      throw new Error(`Registration failed: ${JSON.stringify(data)}`);
    }
    citizenToken = data.token;
  });

  // 3. Citizen Login
  await test('Citizen login and JWT token retrieval', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token) {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
    citizenToken = data.token;
  });

  // 4. Admin Login
  await test('Admin login with seeded authority credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@civiceye.org',
        password: 'admin123'
      })
    });
    const data = await res.json();
    if (res.status !== 200 || data.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(data)}`);
    }
    adminToken = data.token;
  });

  // 5. Role Authorization Gate: Citizen cannot access Admin assignment endpoint
  await test('Unauthorized role cannot access Admin assignment endpoint (403)', async () => {
    const res = await fetch(`${BASE_URL}/complaints/CE-2026-10482/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({ department: 'Sanitation Department' })
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got HTTP ${res.status}`);
    }
  });

  // 6. Submit Complaint with unique ID generation
  await test('Submit complaint and verify unique ID format (CE-YYYY-XXXXX)', async () => {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        issue_type: 'Potholes and damaged roads',
        description: 'Dangerous pothole on Ring Road near flyover junction.',
        severity: 'Critical',
        department: 'Roads and Infrastructure Department',
        image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
        latitude: 17.385044,
        longitude: 78.486671,
        address: 'Ring Road Flyover Pillar 42'
      })
    });
    const data = await res.json();
    if (res.status !== 201 || !data.complaint || !data.complaint.id.startsWith('CE-')) {
      throw new Error(`Complaint submission failed: ${JSON.stringify(data)}`);
    }
    createdComplaintId = data.complaint.id;
  });

  // 7. Duplicate Detection
  await test('Duplicate detection catches nearby complaint (< 100m, same category)', async () => {
    const res = await fetch(`${BASE_URL}/complaints/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: 17.385044,
        longitude: 78.486671,
        issueType: 'Potholes and damaged roads'
      })
    });
    const data = await res.json();
    if (res.status !== 200 || !data.hasDuplicates || data.count === 0) {
      throw new Error(`Expected duplicates to be detected: ${JSON.stringify(data)}`);
    }
  });

  // 8. Admin assignment of complaint
  await test('Admin assigns complaint to department', async () => {
    const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        department: 'Roads and Infrastructure Department',
        notes: 'Priority road repair dispatch approved.'
      })
    });
    const data = await res.json();
    if (res.status !== 200 || data.complaint.status !== 'Assigned') {
      throw new Error(`Assignment failed: ${JSON.stringify(data)}`);
    }
  });

  // 9. Department/Admin status update to In Progress
  await test('Update complaint status to In Progress', async () => {
    const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'In Progress',
        notes: 'Repair truck en route with asphalt mixture.'
      })
    });
    const data = await res.json();
    if (res.status !== 200 || data.complaint.status !== 'In Progress') {
      throw new Error(`Status update failed: ${JSON.stringify(data)}`);
    }
  });

  // 10. Department marks Resolved with proof
  await test('Mark complaint as Resolved with resolution notes and image', async () => {
    const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Resolved',
        notes: 'Pothole asphalted, leveled, and road opened to traffic.',
        resolution_image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6'
      })
    });
    const data = await res.json();
    if (res.status !== 200 || data.complaint.status !== 'Resolved' || !data.complaint.resolution_image_url) {
      throw new Error(`Resolution update failed: ${JSON.stringify(data)}`);
    }
  });

  // 11. Citizen tracks complaint with full history
  await test('Citizen tracks complaint by ID and verifies full audit timeline', async () => {
    const res = await fetch(`${BASE_URL}/complaints/${createdComplaintId}`, {
      headers: { 'Authorization': `Bearer ${citizenToken}` }
    });
    const data = await res.json();
    if (res.status !== 200 || !data.complaint || !data.complaint.history || data.complaint.history.length === 0) {
      throw new Error(`Tracking failed: ${JSON.stringify(data)}`);
    }
  });

  // 12. Public statistics
  await test('Public dashboard statistics endpoint returns aggregated metrics', async () => {
    const res = await fetch(`${BASE_URL}/complaints/public-stats`);
    const data = await res.json();
    if (res.status !== 200 || typeof data.total !== 'number' || typeof data.resolved !== 'number') {
      throw new Error(`Stats endpoint failed: ${JSON.stringify(data)}`);
    }
  });

  // 13. Invalid Image Format Rejection
  await test('Invalid image file format is rejected safely', async () => {
    // Create a temporary text file
    const textFilePath = path.join(__dirname, 'test_dummy.txt');
    fs.writeFileSync(textFilePath, 'This is not an image');

    const formData = new FormData();
    const blob = new Blob(['Not an image'], { type: 'text/plain' });
    formData.append('image', blob, 'test.txt');

    const res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      body: formData
    });

    if (fs.existsSync(textFilePath)) fs.unlinkSync(textFilePath);

    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for text upload, got HTTP ${res.status}`);
    }
  });

  console.log('\n====================================================');
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
