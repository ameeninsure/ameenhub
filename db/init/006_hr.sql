-- HR Module
-- Human Resources Management System

-- HR Employee Records Table
CREATE TABLE IF NOT EXISTS hr_employees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100),
  department_ar VARCHAR(100),
  job_title VARCHAR(200),
  job_title_ar VARCHAR(200),
  employment_type VARCHAR(50) DEFAULT 'full-time', -- full-time, part-time, contract, intern
  employment_status VARCHAR(50) DEFAULT 'active', -- active, on-leave, suspended, terminated
  join_date DATE NOT NULL,
  probation_end_date DATE,
  contract_end_date DATE,
  termination_date DATE,
  termination_reason TEXT,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relation VARCHAR(100),
  national_id VARCHAR(50),
  passport_number VARCHAR(50),
  work_permit_number VARCHAR(50),
  work_permit_expiry DATE,
  bank_name VARCHAR(200),
  bank_account_number VARCHAR(100),
  iban VARCHAR(100),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR Salary Information Table
CREATE TABLE IF NOT EXISTS hr_salaries (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  housing_allowance DECIMAL(12,2) DEFAULT 0,
  transportation_allowance DECIMAL(12,2) DEFAULT 0,
  food_allowance DECIMAL(12,2) DEFAULT 0,
  other_allowances DECIMAL(12,2) DEFAULT 0,
  total_salary DECIMAL(12,2) GENERATED ALWAYS AS (
    basic_salary + housing_allowance + transportation_allowance + food_allowance + other_allowances
  ) STORED,
  currency VARCHAR(10) DEFAULT 'OMR',
  payment_frequency VARCHAR(50) DEFAULT 'monthly', -- monthly, bi-weekly, weekly
  insurance_commission_rate DECIMAL(5,2) DEFAULT 0, -- Percentage commission on insurance sales
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, effective_date)
);

-- HR Attendance Records Table
CREATE TABLE IF NOT EXISTS hr_attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  work_hours DECIMAL(5,2), -- Calculated work hours
  status VARCHAR(50) DEFAULT 'present', -- present, absent, half-day, late, early-leave
  is_overtime BOOLEAN DEFAULT FALSE,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date)
);

-- HR Leave Requests Table
CREATE TABLE IF NOT EXISTS hr_leaves (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- annual, sick, emergency, unpaid, maternity, paternity
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by INTEGER REFERENCES users(id),
  approval_date TIMESTAMP,
  approval_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR Leave Balance Table
CREATE TABLE IF NOT EXISTS hr_leave_balance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  annual_leave_total INTEGER DEFAULT 21,
  annual_leave_used INTEGER DEFAULT 0,
  annual_leave_remaining INTEGER GENERATED ALWAYS AS (annual_leave_total - annual_leave_used) STORED,
  sick_leave_total INTEGER DEFAULT 15,
  sick_leave_used INTEGER DEFAULT 0,
  sick_leave_remaining INTEGER GENERATED ALWAYS AS (sick_leave_total - sick_leave_used) STORED,
  emergency_leave_total INTEGER DEFAULT 5,
  emergency_leave_used INTEGER DEFAULT 0,
  emergency_leave_remaining INTEGER GENERATED ALWAYS AS (emergency_leave_total - emergency_leave_used) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, year)
);

-- HR Performance Reviews Table
CREATE TABLE IF NOT EXISTS hr_performance_reviews (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  reviewer_id INTEGER REFERENCES users(id),
  overall_rating DECIMAL(3,2), -- Rating out of 5
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  achievements TEXT,
  comments TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, completed, acknowledged
  acknowledged_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR Documents Table
CREATE TABLE IF NOT EXISTS hr_documents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- contract, id-copy, certificate, visa, etc
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  notes TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR Commission Tracking Table (for insurance sales)
CREATE TABLE IF NOT EXISTS hr_commissions (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  order_id INTEGER, -- Reference to insurance order if applicable
  commission_type VARCHAR(50), -- sale, renewal, bonus
  amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2),
  base_amount DECIMAL(12,2),
  payment_date DATE,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, cancelled
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hr_employees_user_id ON hr_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_hr_employees_status ON hr_employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_hr_salaries_employee_id ON hr_salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_salaries_effective_date ON hr_salaries(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_hr_attendance_employee_date ON hr_attendance(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_hr_leaves_employee_id ON hr_leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_leaves_status ON hr_leaves(status);
CREATE INDEX IF NOT EXISTS idx_hr_leave_balance_employee_year ON hr_leave_balance(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_hr_performance_employee_id ON hr_performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_documents_employee_id ON hr_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_commissions_employee_id ON hr_commissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_commissions_payment_status ON hr_commissions(payment_status);

-- Add comments
COMMENT ON TABLE hr_employees IS 'HR employee records with employment details';
COMMENT ON TABLE hr_salaries IS 'Employee salary and compensation history';
COMMENT ON TABLE hr_attendance IS 'Daily attendance and work hours tracking';
COMMENT ON TABLE hr_leaves IS 'Leave requests and approvals';
COMMENT ON TABLE hr_leave_balance IS 'Annual leave balance tracking';
COMMENT ON TABLE hr_performance_reviews IS 'Performance review records';
COMMENT ON TABLE hr_documents IS 'Employee documents and certificates';
COMMENT ON TABLE hr_commissions IS 'Commission tracking for insurance sales';
