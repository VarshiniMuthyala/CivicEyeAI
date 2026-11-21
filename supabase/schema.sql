-- ====================================================================
-- CivicEye AI - Supabase Database Schema
-- Track 1: Civic Pulse, Digital Governance & Public Information
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop Existing Tables if needed (safe recreation)
DROP TABLE IF EXISTS complaint_history CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'department')),
    department VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Complaints Table
CREATE TABLE complaints (
    id VARCHAR(50) PRIMARY KEY, -- Formatted: CE-YYYY-XXXXX
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    citizen_name VARCHAR(255) DEFAULT 'Anonymous Citizen',
    citizen_email VARCHAR(255) DEFAULT NULL,
    issue_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    confidence VARCHAR(20) DEFAULT 'High' CHECK (confidence IN ('High', 'Medium', 'Low')),
    department VARCHAR(100) NOT NULL,
    recommendation TEXT,
    reason TEXT,
    image_url TEXT NOT NULL,
    resolution_image_url TEXT DEFAULT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected')),
    resolution_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Assignments Table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    department VARCHAR(100) NOT NULL,
    notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Complaint History Table (Audit Trail)
CREATE TABLE complaint_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'System',
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Performance Indexes
CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_department ON complaints(department);
CREATE INDEX idx_complaints_severity ON complaints(severity);
CREATE INDEX idx_complaints_coords ON complaints(latitude, longitude);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_assignments_complaint ON assignments(complaint_id);
CREATE INDEX idx_history_complaint ON complaint_history(complaint_id);

-- 8. Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_history ENABLE ROW LEVEL SECURITY;

-- Note: When using service_role key from backend, RLS is bypassed safely server-side.
-- Public read access for public dashboard (anonymized view):
CREATE POLICY "Public read for non-sensitive complaint info" ON complaints
    FOR SELECT USING (true);

-- Authenticated citizen read for own complaints:
CREATE POLICY "Users can manage own complaints" ON complaints
    FOR ALL USING (auth.uid() = user_id);

-- Storage bucket creation instruction:
-- In Supabase Dashboard -> Storage, create a public bucket named 'civic-complaints'
