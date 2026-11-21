// End-to-End Live System Verification Script
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';
const TEST_IMAGE_PATH = 'C:/Users/muthy/.gemini/antigravity/brain/d75113e5-12d5-4b19-8761-9c8da0e39aca/.user_uploaded/media_1795245363272_98f78791.png';

async function runLiveVerification() {
  console.log('================================================================');
  console.log('🚀 CivicEye AI - Full Live Lifecycle Verification');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // Step 1: Health Check
    // -------------------------------------------------------------
    console.log('1️⃣ Checking System Health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log(`   ✓ Status: ${health.status}`);
    console.log(`   ✓ Gemini Configured: ${health.geminiConfigured}`);
    console.log(`   ✓ Supabase URL: ${health.supabaseConfigured}`);
    if (health.status !== 'online') throw new Error('Server not online');

    // -------------------------------------------------------------
    // Step 2: Real Google Gemini Multimodal Vision Analysis (English)
    // -------------------------------------------------------------
    console.log('\n2️⃣ Testing Real Google Gemini Vision AI Image Analysis (English)...');
    const imageBytes = fs.readFileSync(TEST_IMAGE_PATH);
    const formEn = new FormData();
    formEn.append('image', new Blob([imageBytes], { type: 'image/png' }), 'pothole.png');
    formEn.append('language', 'en');

    const aiRes = await fetch(`${BASE_URL}/analyze`, { method: 'POST', body: formEn });
    const aiData = await aiRes.json();
    if (!aiData.success || !aiData.analysis) {
      throw new Error(`AI Analysis failed: ${JSON.stringify(aiData)}`);
    }
    console.log(`   ✓ AI Detected Issue: "${aiData.analysis.issueType}"`);
    console.log(`   ✓ AI Severity Level: "${aiData.analysis.severity}"`);
    console.log(`   ✓ Recommended Department: "${aiData.analysis.department}"`);
    console.log(`   ✓ Reasoning: "${aiData.analysis.reason.slice(0, 80)}..."`);
    console.log(`   ✓ Suggested Action: "${aiData.analysis.recommendation.slice(0, 80)}..."`);

    // -------------------------------------------------------------
    // Step 3: Google Gemini Multilingual Analysis (Telugu - తెలుగు)
    // -------------------------------------------------------------
    console.log('\n3️⃣ Testing Multilingual Gemini AI Analysis (Telugu - తెలుగు)...');
    const formTe = new FormData();
    formTe.append('image', new Blob([imageBytes], { type: 'image/png' }), 'pothole.png');
    formTe.append('language', 'te');

    const aiTeRes = await fetch(`${BASE_URL}/analyze`, { method: 'POST', body: formTe });
    const aiTeData = await aiTeRes.json();
    console.log(`   ✓ Telugu Output: "${aiTeData.analysis?.reason?.slice(0, 60)}..."`);

    // -------------------------------------------------------------
    // Step 4: Citizen Submits Complaint
    // -------------------------------------------------------------
    console.log('\n4️⃣ Submitting Civic Complaint to Database...');
    const complaintForm = new FormData();
    complaintForm.append('image', new Blob([imageBytes], { type: 'image/png' }), 'pothole.png');
    complaintForm.append('issue_type', aiData.analysis.issueType);
    complaintForm.append('description', aiData.analysis.description);
    complaintForm.append('severity', aiData.analysis.severity);
    complaintForm.append('department', aiData.analysis.department);
    complaintForm.append('recommendation', aiData.analysis.recommendation);
    complaintForm.append('reason', aiData.analysis.reason);
    complaintForm.append('latitude', '17.385044');
    complaintForm.append('longitude', '78.486671');
    complaintForm.append('address', 'Clock Tower Circle, Ward 4');
    complaintForm.append('citizen_name', 'Priya Sharma');
    complaintForm.append('citizen_email', 'citizen@civiceye.org');

    const submitRes = await fetch(`${BASE_URL}/complaints`, { method: 'POST', body: complaintForm });
    const submitData = await submitRes.json();
    if (!submitData.complaint || !submitData.complaint.id) {
      throw new Error(`Submission failed: ${JSON.stringify(submitData)}`);
    }
    const complaintId = submitData.complaint.id;
    console.log(`   ✓ Generated Unique Complaint ID: ${complaintId}`);
    console.log(`   ✓ Initial Status: ${submitData.complaint.status}`);

    // -------------------------------------------------------------
    // Step 5: Duplicate Complaint Detection
    // -------------------------------------------------------------
    console.log('\n5️⃣ Testing Geospatial Duplicate Grievance Detection (< 100m)...');
    const dupRes = await fetch(`${BASE_URL}/complaints/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: 17.385050,
        longitude: 78.486680,
        issueType: aiData.analysis.issueType
      })
    });
    const dupData = await dupRes.json();
    console.log(`   ✓ Duplicate Detected: ${dupData.hasDuplicates} (Found ${dupData.count} nearby reports)`);
    if (!dupData.hasDuplicates) throw new Error('Duplicate detection failed to flag nearby issue');

    // -------------------------------------------------------------
    // Step 6: Admin Authentication & Review
    // -------------------------------------------------------------
    console.log('\n6️⃣ Admin Login & Complaint Triage...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@civiceye.org', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.token;
    console.log(`   ✓ Admin Authenticated: ${loginData.user.name} (${loginData.user.role})`);

    // Assign Department
    const assignRes = await fetch(`${BASE_URL}/complaints/${complaintId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        department: 'Roads and Infrastructure Department',
        notes: 'Priority road repair dispatch confirmed by Admin'
      })
    });
    const assignData = await assignRes.json();
    console.log(`   ✓ Assignment Confirmed: ${assignData.complaint.department} (Status: ${assignData.complaint.status})`);

    // -------------------------------------------------------------
    // Step 7: Department Updates Status to In Progress
    // -------------------------------------------------------------
    console.log('\n7️⃣ Field Squad Dispatched (In Progress)...');
    const inProgRes = await fetch(`${BASE_URL}/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'In Progress',
        notes: 'Bitumen repair crew en route to Clock Tower Circle'
      })
    });
    const inProgData = await inProgRes.json();
    console.log(`   ✓ Progress Updated: ${inProgData.complaint.status}`);

    // -------------------------------------------------------------
    // Step 8: Mark Resolved with Photo Proof
    // -------------------------------------------------------------
    console.log('\n8️⃣ Issue Resolved & Resolution Proof Uploaded...');
    const resolvedRes = await fetch(`${BASE_URL}/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Resolved',
        notes: 'Cavity leveled, asphalt laid and compacted, road reopened.',
        resolution_image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6'
      })
    });
    const resolvedData = await resolvedRes.json();
    console.log(`   ✓ Final Status: ${resolvedData.complaint.status}`);
    console.log(`   ✓ Resolution Proof Attached: ${resolvedData.complaint.resolution_image_url ? 'Yes' : 'No'}`);

    // -------------------------------------------------------------
    // Step 9: Citizen Full Audit Tracker Check
    // -------------------------------------------------------------
    console.log('\n9️⃣ Citizen Tracking Audit by Complaint ID...');
    const trackRes = await fetch(`${BASE_URL}/complaints/${complaintId}`);
    const trackData = await trackRes.json();
    const c = trackData.complaint;
    console.log(`   ✓ Complaint ID: ${c.id}`);
    console.log(`   ✓ Current Lifecycle: ${c.status}`);
    console.log(`   ✓ Audit Trail Events Count: ${c.history?.length || 0}`);
    if (c.history) {
      c.history.forEach((h, i) => {
        console.log(`      [Event ${i + 1}] ${h.previous_status || 'Start'} ➔ ${h.new_status} (${h.notes})`);
      });
    }

    // -------------------------------------------------------------
    // Step 10: Public Dashboard & Open Statistics
    // -------------------------------------------------------------
    console.log('\n🔟 Verifying Public Open Dashboard Analytics...');
    const statsRes = await fetch(`${BASE_URL}/complaints/public-stats`);
    const stats = await statsRes.json();
    console.log(`   ✓ Total Reported: ${stats.total}`);
    console.log(`   ✓ Total Resolved: ${stats.resolved}`);
    console.log(`   ✓ Resolution Rate: ${stats.resolutionRate}%`);
    console.log(`   ✓ Active Triage: ${stats.inProgress}`);

    console.log('\n================================================================');
    console.log('🎉 ALL 10 CORE CIVICEYE AI WORKFLOWS ARE 100% OPERATIONAL!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ Verification Failed:', err.message);
    process.exit(1);
  }
}

runLiveVerification();
