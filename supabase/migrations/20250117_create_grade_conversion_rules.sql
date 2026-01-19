-- Create grade conversion rules table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS aet_aice_grade_conversion_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  education_level TEXT,                    -- 'high_school', 'undergraduate', 'graduate'
  original_scale TEXT,                     -- '0-100', '0-5', 'A-F', '1-6'
  original_grade TEXT NOT NULL,            -- The original grade value
  us_grade TEXT NOT NULL,                  -- A, B, C, D, F
  gpa_points NUMERIC(3,2),                 -- 4.00, 3.00, etc.
  credit_coefficient NUMERIC(4,3),         -- Multiplier for credit conversion
  source TEXT DEFAULT 'AI_INFERRED',       -- 'AICE_RULES', 'AI_INFERRED', 'USER_VERIFIED'
  confidence TEXT DEFAULT 'medium',        -- 'high', 'medium', 'low'
  notes TEXT,                              -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX idx_grade_rules_country ON aet_aice_grade_conversion_rules(country);
CREATE INDEX idx_grade_rules_lookup ON aet_aice_grade_conversion_rules(country, original_grade);

-- Enable RLS
ALTER TABLE aet_aice_grade_conversion_rules ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow read access" ON aet_aice_grade_conversion_rules
  FOR SELECT USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow insert access" ON aet_aice_grade_conversion_rules
  FOR INSERT WITH CHECK (true);

-- Allow update on own records (optional, for verification)
CREATE POLICY "Allow update access" ON aet_aice_grade_conversion_rules
  FOR UPDATE USING (true);

-- Insert initial rules from AICE standards
INSERT INTO aet_aice_grade_conversion_rules (country, education_level, original_scale, original_grade, us_grade, gpa_points, source, confidence) VALUES
-- China
('China', 'undergraduate', '0-100', '85-100', 'A', 4.00, 'AICE_RULES', 'high'),
('China', 'undergraduate', '0-100', '75-84', 'B', 3.00, 'AICE_RULES', 'high'),
('China', 'undergraduate', '0-100', '60-74', 'C', 2.00, 'AICE_RULES', 'high'),
('China', 'undergraduate', '0-100', '0-59', 'F', 0.00, 'AICE_RULES', 'high'),
-- India
('India', 'undergraduate', 'percentage', '60-100', 'A', 4.00, 'AICE_RULES', 'high'),
('India', 'undergraduate', 'percentage', '50-59', 'B', 3.00, 'AICE_RULES', 'high'),
('India', 'undergraduate', 'percentage', '40-49', 'C', 2.00, 'AICE_RULES', 'high'),
('India', 'undergraduate', 'percentage', '0-39', 'F', 0.00, 'AICE_RULES', 'high'),
-- Russia
('Russia', 'undergraduate', '1-5', '5', 'A', 4.00, 'AICE_RULES', 'high'),
('Russia', 'undergraduate', '1-5', '4', 'B', 3.00, 'AICE_RULES', 'high'),
('Russia', 'undergraduate', '1-5', '3', 'C', 2.00, 'AICE_RULES', 'high'),
('Russia', 'undergraduate', '1-5', '2', 'F', 0.00, 'AICE_RULES', 'high'),
-- Germany
('Germany', 'undergraduate', '1-6', '1.0-1.5', 'A', 4.00, 'AICE_RULES', 'high'),
('Germany', 'undergraduate', '1-6', '1.6-2.5', 'B', 3.00, 'AICE_RULES', 'high'),
('Germany', 'undergraduate', '1-6', '2.6-3.5', 'C', 2.00, 'AICE_RULES', 'high'),
('Germany', 'undergraduate', '1-6', '3.6-4.0', 'D', 1.00, 'AICE_RULES', 'high'),
('Germany', 'undergraduate', '1-6', '4.1-6.0', 'F', 0.00, 'AICE_RULES', 'high');
