-- Insurance Companies and Products Module
-- This file creates the structure for managing insurance companies and their products

-- Create insurance companies table
CREATE TABLE IF NOT EXISTS insurance_companies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    category VARCHAR(100),
    cr_number VARCHAR(100),
    license_number VARCHAR(100),
    address_en TEXT,
    address_ar TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Create insurance products table
CREATE TABLE IF NOT EXISTS insurance_products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    company_id INTEGER NOT NULL REFERENCES insurance_companies(id) ON DELETE CASCADE,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    category VARCHAR(100),
    coverage_type VARCHAR(100),
    features_en TEXT[],
    features_ar TEXT[],
    terms_en TEXT,
    terms_ar TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurance_companies_code ON insurance_companies(code);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_active ON insurance_companies(is_active);
CREATE INDEX IF NOT EXISTS idx_insurance_products_code ON insurance_products(code);
CREATE INDEX IF NOT EXISTS idx_insurance_products_company ON insurance_products(company_id);
CREATE INDEX IF NOT EXISTS idx_insurance_products_active ON insurance_products(is_active);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_insurance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_insurance_companies_updated_at ON insurance_companies;
CREATE TRIGGER trigger_insurance_companies_updated_at
    BEFORE UPDATE ON insurance_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_updated_at();

DROP TRIGGER IF EXISTS trigger_insurance_products_updated_at ON insurance_products;
CREATE TRIGGER trigger_insurance_products_updated_at
    BEFORE UPDATE ON insurance_products
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_updated_at();

-- Insert seed data for insurance companies from CMA list
INSERT INTO insurance_companies (code, name_en, name_ar, category, cr_number, license_number, address_en, address_ar, website, email, phone, display_order) VALUES
('NIA', 'The New India Assurance Company LTD', 'شركة نيو إنديا للتأمين المحدودة', 'Insurance Company', '1128256', 'FI/9', 'Building No.931, Way No.4911, Al Nahdha Street, Next to German Embassy, Hamriyah, P.O.Box No.2907', 'المبنى رقم 931، الطريق رقم 4911، شارع النهضة، بجوار السفارة الألمانية، الحمرية، ص.ب 2907', 'www.newindiaoman.com', 'niamct@omantel.net.om', '24838800', 1),
('AMI', 'Al Madina Insurance', 'المدينة للتأمين التكافلي', 'Insurance Company', '1815008', 'NI/34', 'Building No. 6, Office No. 301, Muscat Grand Mall, P.O. Box 80', 'المبنى رقم 6، المكتب رقم 301، مسقط جراند مول، ص.ب 80', 'www.almadinatakaful.com', 'reachus@almadinatakaful.com', '22033888', 2),
('GIG', 'Gulf Insurance Group (Gulf) B.S.C(C)', 'مجموعة الخليج للتأمين', 'Insurance Company', '1112244', 'FI/6', 'Muscat Governorate/Bowsher/North AlKhuwair, P.O.Box: 1276', 'محافظة مسقط/بوشر/الخوير الشمالية، ص.ب: 1276', 'www.gig-gulf.com', 'hassan.abdulali@gig-gulf.com', '24400100', 3),
('SAIC', 'Saudi Arabian Insurance Company B.S.C.(C)', 'الشركة السعودية للتأمين (ضمانة)', 'Insurance Company', '1051781', 'FI/35', 'Al Rajhi Building No. 1/332, 2nd Floor, Way No.53, Block 237 South Al Ghubrah, P.O Box 839 Jibroo, PC 114', 'مبنى الراجحي رقم 1/332، الطابق الثاني، الطريق رقم 53، البلوك 237 الغبرة الجنوبية، ص.ب 839 جبرو، الرمز البريدي 114', 'www.damana.com', 'salhajri@damana.com', '24863100', 4),
('IIC', 'Iran Insurance Company', 'شركة إيران للتأمين', 'Insurance Company', '1112210', 'FI/18', 'Wattaya, P.O.Box 417', 'وطية، ص.ب 417', 'www.iraninsurance.ir', 'bimehiro@bimehir.com.om', '24568506', 5),
('LIVA', 'Liva Insurance CO.', 'ليفا للتأمين', 'Insurance Company', '1754807', 'NI/31', 'P.O. Box: 1463 PC 112 Ruwi', 'ص.ب: 1463 الرمز البريدي 112 روي', 'https://livainsurance.om', 'liva@livainsurance.com', '24766800', 6),
('METLIFE', 'American Life Insurance Company (MetLife)', 'ميت لايف للتأمين على الحياة', 'Insurance Company', '1122495', 'FI/15', 'Dar Al Noor Building, Block No.233, Way No. 403, Building No.52, Office 405 & 406, P.O. Box: 894, PC114', 'مبنى دار النور، البلوك رقم 233، الطريق رقم 403، المبنى رقم 52، المكتب 405 و 406، ص.ب: 894، الرمز البريدي 114', 'www.metlife.com.om', 'ahmed.b.lawati@metlife.com.om', '24770998', 7),
('CIGNA', 'Cigna Middle East Insurance Company S.A.L', 'سيجنا الشرق الأوسط للتأمين', 'Insurance Company', '1002811', 'FI/33', 'AlFardan Heights, 7th floor, Gala, Muscat', 'الفردان هايتس، الطابق السابع، غلا، مسقط', 'www.cigna.com', 'abdullah.alhatmi@cigna.com', '22496962', 8),
('DIC', 'Dhofar Insurance Company', 'ظفار للتأمين', 'Insurance Company', '1318977', 'NI/21', 'Dhofar Insurance Bldg next to CBO, MBD Area, P. O. Box: 1002 Ruwi', 'مبنى ظفار للتأمين بجوار البنك المركزي، منطقة MBD، ص.ب: 1002 روي', 'www.dhofarinsurance.com', 'Dhofar@dhofarinsurance.com', '24705305', 9),
('OQIC', 'Oman Qatar Insurance Co.', 'عمان قطر للتأمين', 'Insurance Company', '1760882', 'NI/32', '4th Floor, Al Nawras Commercial Center, Al Khuwair, PC 112, P.O.Box.3660', 'الطابق الرابع، مركز النورس التجاري، الخوير، الرمز البريدي 112، ص.ب 3660', 'www.oqic.com', 'hasan.allawati@oqic.com', '24765222', 10),
('OUIC', 'Oman United Insurance Company', 'عمان المتحدة للتأمين', 'Insurance Company', '1237250', 'NI/20', 'Al-Khuwair, P. O. Box: 1522', 'الخوير، ص.ب: 1522', 'www.omanutd.com', 'info@omanutd.com', '24477300', 11),
('SUKOON', 'Sukoon Insurance', 'سكون للتأمين التكافلي', 'Insurance Company', '1028010', 'FI/32', 'Al Qurum Beside Mercedes agency (Al Zawawi), Building No.108/1, Plot No.110, Block No.206', 'القرم بجوار وكالة مرسيدس (الزواوي)، المبنى رقم 108/1، القطعة رقم 110، البلوك رقم 206', 'www.sukoon.om', 'murtadha.awadh@sukoon.om', '24562256', 12),
('ORIENT', 'Orient Insurance Company', 'أورينت للتأمين', 'Insurance Company', '1046697', 'FI/34', 'Office No. 100, 1st Floor, Nawras Commercial Center, Al Khuwair Service Road, Al Khuwair', 'المكتب رقم 100، الطابق الأول، مركز النورس التجاري، طريق الخدمة الخوير', 'www.insuranceuae.com', 'orient@alfuttaim.com', '24475410', 13),
('TAKAFUL', 'Takaful Oman Insurance CO.', 'عمان للتأمين التكافلي', 'Insurance Company', '1190750', 'NI/37', 'Ground Floor and Sixth Floor, Taminat Complex, Bousher, P.O.BOX 207, P.C134', 'الطابق الأرضي والطابق السادس، مجمع تأمينات، بوشر، ص.ب 207، الرمز البريدي 134', 'www.takafuloman.om', 'info@takafuloman.om', '22303000', 14),
('MIC', 'Muscat Insurance Company (S.A.O.G)', 'مسقط للتأمين', 'Insurance Company', '1452916', 'NI/38', 'South Al Khuwair, Building No 233, Street 281, Way 3501, next to Majan House Building', 'الخوير الجنوبية، المبنى رقم 233، الشارع 281، الطريق 3501، بجوار مبنى ماجان هاوس', 'www.muscatinsurance.com', 'info@muscatinsurance.com', '22364400', 15),
('AFIC', 'Arabia Falcon Insurance', 'الصقر العربي للتأمين', 'Insurance Company', '1791494', 'NI/33', 'Al Kuwair (South)/Bousher/Muscat, P.O.Box: 2279', 'الخوير (الجنوبية)/بوشر/مسقط، ص.ب: 2279', 'www.afic.om', 'malawaisi@afic.om', '24660900', 16)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE insurance_companies IS 'Insurance companies registered with Capital Market Authority (CMA)';
COMMENT ON TABLE insurance_products IS 'Insurance products offered by registered companies';
COMMENT ON COLUMN insurance_companies.code IS 'Unique company code (e.g., NIA, GIG, METLIFE)';
COMMENT ON COLUMN insurance_companies.license_number IS 'CMA license number (e.g., FI/9, NI/34)';
COMMENT ON COLUMN insurance_products.coverage_type IS 'Type of insurance coverage (e.g., Motor, Health, Life, Property)';
