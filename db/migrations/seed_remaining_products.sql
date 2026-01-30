-- Add remaining products for companies without products (CIGNA, DIC, OQIC, OUIC, SUKOON, ORIENT, TAKAFUL, MIC, AFIC)

-- ============================================================================
-- CIGNA MIDDLE EAST - Company ID: 8
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('CIGNA-HEALTH-GLOBAL-01', 8, 'Global Health Insurance', 'التأمين الصحي العالمي', 'International health coverage with access to worldwide medical network', 'تغطية صحية دولية مع الوصول إلى شبكة طبية عالمية', 'Health Insurance', 'International', 
ARRAY['Worldwide Coverage', 'No Referral Needed', 'Direct Billing', 'Mental Health Services', 'Chronic Care Management'],
ARRAY['تغطية عالمية', 'لا حاجة للإحالة', 'الفواتير المباشرة', 'خدمات الصحة النفسية', 'إدارة الرعاية المزمنة'],
'Premium international health insurance. No territorial limits.', 'تأمين صحي دولي ممتاز. لا حدود إقليمية.', true, 1),

('CIGNA-HEALTH-CORP-01', 8, 'Corporate Wellbeing Plan', 'خطة رفاهية الشركات', 'Comprehensive employee health and wellness program', 'برنامج صحي ورفاهية شامل للموظفين', 'Health Insurance', 'Corporate', 
ARRAY['Employee Assistance Program', 'Wellness Coaching', 'Preventive Care', 'Telemedicine', 'Health Assessments'],
ARRAY['برنامج مساعدة الموظفين', 'تدريب الصحة', 'الرعاية الوقائية', 'الطب عن بعد', 'التقييمات الصحية'],
'Holistic wellness approach. Reduces absenteeism and boosts productivity.', 'نهج صحي شامل. يقلل من الغياب ويعزز الإنتاجية.', true, 2),

('CIGNA-LIFE-TERM-01', 8, 'Term Life Protection', 'حماية الحياة لأجل', 'Affordable term life insurance with flexible coverage options', 'تأمين على الحياة لأجل بأسعار معقولة مع خيارات تغطية مرنة', 'Life Insurance', 'Term', 
ARRAY['Flexible Terms', 'Conversion Options', 'Waiver of Premium', 'Accelerated Death Benefit', 'Living Benefits'],
ARRAY['شروط مرنة', 'خيارات التحويل', 'إعفاء من القسط', 'استحقاق الوفاة المعجل', 'مزايا الحياة'],
'Pure protection at affordable rates. Medical underwriting required.', 'حماية نقية بأسعار معقولة. يتطلب الاكتتاب الطبي.', true, 3),

('CIGNA-DENTAL-FAM-01', 8, 'Family Dental Care', 'رعاية الأسنان العائلية', 'Comprehensive dental coverage for the whole family', 'تغطية أسنان شاملة للعائلة بأكملها', 'Health Insurance', 'Dental', 
ARRAY['Preventive Care', 'Basic Procedures', 'Major Treatments', 'Orthodontics', 'Emergency Care'],
ARRAY['الرعاية الوقائية', 'الإجراءات الأساسية', 'العلاجات الرئيسية', 'تقويم الأسنان', 'الرعاية الطارئة'],
'Network of qualified dentists. No waiting period for accidents.', 'شبكة من أطباء الأسنان المؤهلين. لا فترة انتظار للحوادث.', true, 4),

('CIGNA-TRAVEL-ANNUAL-01', 8, 'Annual Multi-Trip Travel', 'السفر السنوي متعدد الرحلات', 'Year-round travel insurance for frequent travelers', 'تأمين سفر على مدار السنة للمسافرين الدائمين', 'Travel Insurance', 'Annual', 
ARRAY['Unlimited Trips', 'Emergency Medical', 'Trip Cancellation', 'Baggage Protection', 'Travel Assistance'],
ARRAY['رحلات غير محدودة', 'الطوارئ الطبية', 'إلغاء الرحلة', 'حماية الأمتعة', 'مساعدة السفر'],
'Cost-effective for frequent travelers. Worldwide coverage included.', 'فعال من حيث التكلفة للمسافرين الدائمين. تغطية عالمية مشمولة.', true, 5);

-- ============================================================================
-- DHOFAR INSURANCE COMPANY (DIC) - Company ID: 9
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('DIC-MOTOR-COMP-01', 9, 'Motor Comprehensive Cover', 'التغطية الشاملة للسيارات', 'Complete motor insurance with regional focus and local expertise', 'تأمين سيارات كامل مع تركيز إقليمي وخبرة محلية', 'Motor Insurance', 'Comprehensive', 
ARRAY['Local Expertise', 'Quick Claims', 'Authorized Workshops', 'Replacement Vehicle', 'Natural Disasters'],
ARRAY['خبرة محلية', 'مطالبات سريعة', 'ورش معتمدة', 'مركبة بديلة', 'الكوارث الطبيعية'],
'Specialized in Oman market. Strong local presence and service.', 'متخصص في سوق عمان. وجود وخدمة محلية قوية.', true, 1),

('DIC-HEALTH-SME-01', 9, 'SME Health Plan', 'خطة الصحة للشركات الصغيرة والمتوسطة', 'Tailored health insurance for small and medium enterprises', 'تأمين صحي مصمم خصيصاً للمشروعات الصغيرة والمتوسطة', 'Health Insurance', 'SME', 
ARRAY['Affordable Premiums', 'Flexible Plans', 'Cashless Network', 'Health Checkups', 'Add-on Covers'],
ARRAY['أقساط معقولة', 'خطط مرنة', 'شبكة بدون نقد', 'فحوصات صحية', 'أغطية إضافية'],
'Designed for SMEs with limited budgets. Scalable coverage options.', 'مصمم للشركات الصغيرة والمتوسطة ذات الميزانيات المحدودة. خيارات تغطية قابلة للتوسع.', true, 2),

('DIC-PROPERTY-HOME-01', 9, 'Home Protection Plan', 'خطة حماية المنزل', 'Comprehensive home insurance covering structure and contents', 'تأمين منزل شامل يغطي الهيكل والمحتويات', 'Property Insurance', 'Home', 
ARRAY['Building Structure', 'Contents Cover', 'Alternative Accommodation', 'Personal Liability', 'Natural Calamities'],
ARRAY['هيكل المبنى', 'تغطية المحتويات', 'الإقامة البديلة', 'المسؤولية الشخصية', 'الكوارث الطبيعية'],
'Complete home protection. Sum insured at replacement cost.', 'حماية منزل كاملة. المبلغ المؤمن عليه بتكلفة الاستبدال.', true, 3),

('DIC-MARINE-IMPORT-01', 9, 'Import Cargo Insurance', 'تأمين بضائع الاستيراد', 'Protection for imported goods during sea and land transit', 'حماية البضائع المستوردة أثناء النقل البحري والبري', 'Marine Insurance', 'Import', 
ARRAY['Port to Door Coverage', 'War & Strikes', 'Theft Protection', 'Damage Cover', 'Transit Insurance'],
ARRAY['تغطية من الميناء إلى الباب', 'الحرب والإضرابات', 'حماية السرقة', 'تغطية الأضرار', 'تأمين النقل'],
'Specialized in Oman import trade. Competitive rates for regular shipments.', 'متخصص في تجارة الاستيراد العمانية. أسعار تنافسية للشحنات المنتظمة.', true, 4),

('DIC-PA-IND-01', 9, 'Personal Accident Insurance', 'تأمين الحوادث الشخصية', 'Individual accident coverage for unforeseen injuries', 'تغطية حوادث فردية للإصابات غير المتوقعة', 'Personal Accident', 'Individual', 
ARRAY['Death Benefit', 'Permanent Disablement', 'Medical Expenses', 'Weekly Compensation', 'Worldwide Cover'],
ARRAY['استحقاق الوفاة', 'العجز الدائم', 'النفقات الطبية', 'التعويض الأسبوعي', 'تغطية عالمية'],
'24/7 worldwide accident protection. Affordable premiums.', 'حماية من الحوادث على مدار الساعة في جميع أنحاء العالم. أقساط معقولة.', true, 5);

-- ============================================================================
-- OMAN QATAR INSURANCE (OQIC) - Company ID: 10
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('OQIC-MOTOR-LUXURY-01', 10, 'Luxury Vehicle Insurance', 'تأمين المركبات الفاخرة', 'Premium coverage specialized for luxury and high-end vehicles', 'تغطية ممتازة متخصصة للمركبات الفاخرة والراقية', 'Motor Insurance', 'Luxury', 
ARRAY['Zero Depreciation', 'Agreed Value', 'Worldwide Coverage', 'Concierge Service', 'Premium Repairs'],
ARRAY['صفر استهلاك', 'القيمة المتفق عليها', 'تغطية عالمية', 'خدمة الكونسيرج', 'إصلاحات ممتازة'],
'Specialized coverage for luxury cars. Enhanced limits and services.', 'تغطية متخصصة للسيارات الفاخرة. حدود وخدمات محسنة.', true, 1),

('OQIC-HEALTH-VIP-01', 10, 'VIP Health Insurance', 'التأمين الصحي VIP', 'Premium health coverage with access to best hospitals worldwide', 'تغطية صحية ممتازة مع الوصول إلى أفضل المستشفيات في جميع أنحاء العالم', 'Health Insurance', 'VIP', 
ARRAY['Global Network', 'Private Rooms', 'Specialist Access', 'Concierge Services', 'No Sub-Limits'],
ARRAY['شبكة عالمية', 'غرف خاصة', 'الوصول إلى المتخصصين', 'خدمات الكونسيرج', 'لا حدود فرعية'],
'Ultimate health coverage with VIP services. Premium rates apply.', 'تغطية صحية نهائية مع خدمات VIP. تطبق أسعار ممتازة.', true, 2),

('OQIC-LIFE-WEALTH-01', 10, 'Wealth Builder Plan', 'خطة بناء الثروة', 'Life insurance with wealth accumulation and guaranteed returns', 'تأمين على الحياة مع تراكم الثروة وعوائد مضمونة', 'Life Insurance', 'Investment', 
ARRAY['Guaranteed Returns', 'Bonus Additions', 'Loan Facility', 'Tax Benefits', 'Wealth Transfer'],
ARRAY['عوائد مضمونة', 'إضافات المكافآت', 'تسهيل القرض', 'مزايا ضريبية', 'نقل الثروة'],
'Long-term wealth creation with life protection. Attractive bonus rates.', 'خلق ثروة طويلة الأجل مع حماية الحياة. معدلات مكافآت جذابة.', true, 3),

('OQIC-PROPERTY-VILLA-01', 10, 'Premium Villa Insurance', 'تأمين الفلل الممتازة', 'Comprehensive coverage for luxury villas and high-value homes', 'تغطية شاملة للفلل الفاخرة والمنازل ذات القيمة العالية', 'Property Insurance', 'Luxury', 
ARRAY['High Sum Insured', 'Valuable Items', 'Art & Collectibles', 'Home Staff', 'Alternative Luxury Accommodation'],
ARRAY['مبلغ مؤمن عليه مرتفع', 'العناصر الثمينة', 'الفن والمقتنيات', 'موظفو المنزل', 'الإقامة الفاخرة البديلة'],
'Tailored for luxury properties. Includes valuable items coverage.', 'مصمم للعقارات الفاخرة. يتضمن تغطية العناصر الثمينة.', true, 4),

('OQIC-YACHT-01', 10, 'Yacht Insurance', 'تأمين اليخوت', 'Specialized marine insurance for private yachts and boats', 'تأمين بحري متخصص لليخوت الخاصة والقوارب', 'Marine Insurance', 'Yacht', 
ARRAY['Hull & Machinery', 'Navigation Area', 'Water Sports Equipment', 'Crew Coverage', 'Salvage & Towing'],
ARRAY['الهيكل والآلات', 'منطقة الملاحة', 'معدات الرياضات المائية', 'تغطية الطاقم', 'الإنقاذ والقطر'],
'Premium yacht coverage. Survey and valuation required.', 'تغطية يخت ممتازة. يتطلب المسح والتقييم.', true, 5);

-- ============================================================================
-- OMAN UNITED INSURANCE (OUIC) - Company ID: 11
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('OUIC-MOTOR-VALUE-01', 11, 'Value Motor Insurance', 'تأمين السيارات ذو القيمة', 'Affordable motor insurance with essential coverage', 'تأمين سيارات بأسعار معقولة مع تغطية أساسية', 'Motor Insurance', 'Comprehensive', 
ARRAY['Competitive Pricing', 'Fast Claims', 'Network Garages', 'Road Assistance', 'Basic Coverage'],
ARRAY['أسعار تنافسية', 'مطالبات سريعة', 'ورش الشبكة', 'المساعدة على الطريق', 'التغطية الأساسية'],
'Cost-effective motor insurance. Essential protection at best rates.', 'تأمين سيارات فعال من حيث التكلفة. حماية أساسية بأفضل الأسعار.', true, 1),

('OUIC-HEALTH-BASIC-01', 11, 'Basic Health Cover', 'الغطاء الصحي الأساسي', 'Essential health insurance for individuals and families', 'تأمين صحي أساسي للأفراد والعائلات', 'Health Insurance', 'Basic', 
ARRAY['Hospital Cover', 'Emergency Services', 'Pharmacy Benefits', 'Lab Tests', 'Outpatient Care'],
ARRAY['تغطية المستشفى', 'خدمات الطوارئ', 'مزايا الصيدلية', 'اختبارات المختبر', 'رعاية المرضى الخارجيين'],
'Affordable health protection. Essential medical coverage.', 'حماية صحية بأسعار معقولة. تغطية طبية أساسية.', true, 2),

('OUIC-FIRE-SME-01', 11, 'SME Fire Insurance', 'تأمين الحريق للشركات الصغيرة', 'Fire and allied perils coverage for small businesses', 'تغطية الحريق والأخطار المرتبطة للشركات الصغيرة', 'Property Insurance', 'Fire', 
ARRAY['Fire Protection', 'Lightning', 'Explosion', 'Stock Coverage', 'Business Assets'],
ARRAY['حماية الحريق', 'البرق', 'الانفجار', 'تغطية المخزون', 'أصول الأعمال'],
'Tailored for small businesses. Affordable premiums with adequate cover.', 'مصمم للشركات الصغيرة. أقساط معقولة مع تغطية كافية.', true, 3),

('OUIC-WC-01', 11, 'Workers Compensation', 'تعويض العمال', 'Mandatory workers compensation insurance as per Oman labor law', 'تأمين تعويض العمال الإلزامي حسب قانون العمل العماني', 'Liability Insurance', 'Workers Compensation', 
ARRAY['Death Benefits', 'Disability Cover', 'Medical Expenses', 'Rehabilitation Costs', 'Legal Compliance'],
ARRAY['مزايا الوفاة', 'تغطية الإعاقة', 'النفقات الطبية', 'تكاليف إعادة التأهيل', 'الامتثال القانوني'],
'Mandatory coverage as per labor law. Protects employers and employees.', 'تغطية إلزامية حسب قانون العمل. يحمي أصحاب العمل والموظفين.', true, 4),

('OUIC-TRAVEL-GCC-01', 11, 'GCC Travel Insurance', 'تأمين السفر في مجلس التعاون', 'Regional travel coverage for GCC countries', 'تغطية سفر إقليمية لدول مجلس التعاون الخليجي', 'Travel Insurance', 'Regional', 
ARRAY['GCC Coverage', 'Medical Emergency', 'Trip Cancellation', 'Baggage Loss', 'Personal Liability'],
ARRAY['تغطية دول المجلس', 'الطوارئ الطبية', 'إلغاء الرحلة', 'فقدان الأمتعة', 'المسؤولية الشخصية'],
'Affordable regional travel insurance. Perfect for GCC trips.', 'تأمين سفر إقليمي بأسعار معقولة. مثالي لرحلات دول المجلس.', true, 5);

-- ============================================================================
-- SUKOON INSURANCE (SUKOON) - Company ID: 12
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('SUKOON-MOTOR-TAKAFUL-01', 12, 'Motor Takaful Comprehensive', 'التكافل الشامل للسيارات', 'Sharia-compliant comprehensive motor coverage with excellent service', 'تغطية تكافل شاملة للسيارات متوافقة مع الشريعة مع خدمة ممتازة', 'Motor Insurance', 'Comprehensive', 
ARRAY['Shariah Compliant', 'Halal Operations', 'Agency Repairs', 'No Interest', 'Takaful Benefits'],
ARRAY['متوافق مع الشريعة', 'عمليات حلال', 'إصلاحات الوكالة', 'بدون فوائد', 'مزايا التكافل'],
'Islamic motor insurance with transparent operations. Profit-sharing model.', 'تأمين سيارات إسلامي مع عمليات شفافة. نموذج تقاسم الأرباح.', true, 1),

('SUKOON-HEALTH-TAKAFUL-01', 12, 'Health Takaful Plan', 'خطة التكافل الصحي', 'Sharia-compliant health insurance for individuals and families', 'تأمين صحي متوافق مع الشريعة للأفراد والعائلات', 'Health Insurance', 'Takaful', 
ARRAY['Halal Healthcare', 'Shariah Board Approved', 'No Interest', 'Family Coverage', 'Islamic Principles'],
ARRAY['رعاية صحية حلال', 'معتمد من مجلس الشريعة', 'بدون فوائد', 'تغطية العائلة', 'المبادئ الإسلامية'],
'Islamic health coverage approved by Shariah board. Transparent contributions.', 'تغطية صحية إسلامية معتمدة من مجلس الشريعة. مساهمات شفافة.', true, 2),

('SUKOON-LIFE-FAMILY-01', 12, 'Family Takaful Protection', 'حماية التكافل العائلي', 'Sharia-compliant family protection with savings benefits', 'حماية عائلية متوافقة مع الشريعة مع مزايا الادخار', 'Life Insurance', 'Family Takaful', 
ARRAY['Shariah Compliant', 'Family Protection', 'Savings Pool', 'Investment Returns', 'Halal Investments'],
ARRAY['متوافق مع الشريعة', 'حماية العائلة', 'مجمع المدخرات', 'عوائد الاستثمار', 'استثمارات حلال'],
'Islamic family protection with halal investment portfolio. No riba involved.', 'حماية عائلية إسلامية مع محفظة استثمار حلال. لا ربا.', true, 3),

('SUKOON-PROPERTY-TAKAFUL-01', 12, 'Property Takaful', 'تكافل الممتلكات', 'Islamic insurance for home and commercial properties', 'تأمين إسلامي للممتلكات السكنية والتجارية', 'Property Insurance', 'Takaful', 
ARRAY['Shariah Compliant', 'Fire & Perils', 'Contents Cover', 'No Interest', 'Halal Operations'],
ARRAY['متوافق مع الشريعة', 'الحريق والأخطار', 'تغطية المحتويات', 'بدون فوائد', 'عمليات حلال'],
'Islamic property protection. Contribution-based model with profit-sharing.', 'حماية ممتلكات إسلامية. نموذج قائم على المساهمة مع تقاسم الأرباح.', true, 4);

-- ============================================================================
-- ORIENT INSURANCE (ORIENT) - Company ID: 13
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('ORIENT-MOTOR-COMP-01', 13, 'Comprehensive Motor Plan', 'خطة السيارات الشاملة', 'Complete motor insurance with regional expertise', 'تأمين سيارات كامل مع خبرة إقليمية', 'Motor Insurance', 'Comprehensive', 
ARRAY['Regional Network', 'Fast Claims', 'Replacement Car', 'Road Assistance', 'Wide Coverage'],
ARRAY['شبكة إقليمية', 'مطالبات سريعة', 'سيارة بديلة', 'المساعدة على الطريق', 'تغطية واسعة'],
'Established regional insurer with strong presence. Reliable service.', 'شركة تأمين إقليمية راسخة مع حضور قوي. خدمة موثوقة.', true, 1),

('ORIENT-HEALTH-EXP-01', 13, 'Expatriate Health Insurance', 'التأمين الصحي للوافدين', 'Health coverage designed for expatriates working in Oman', 'تغطية صحية مصممة للوافدين العاملين في عمان', 'Health Insurance', 'Expatriate', 
ARRAY['Expat Focused', 'International Network', 'Repatriation', 'Emergency Evacuation', 'Multi-Currency'],
ARRAY['تركيز على الوافدين', 'شبكة دولية', 'إعادة الوطن', 'الإخلاء الطارئ', 'متعدد العملات'],
'Specialized for expatriate community. Understands expat needs.', 'متخصص لمجتمع الوافدين. يفهم احتياجات الوافدين.', true, 2),

('ORIENT-LIABILITY-PL-01', 13, 'Public Liability Insurance', 'تأمين المسؤولية العامة', 'Protection against third party liability claims', 'الحماية من مطالبات المسؤولية تجاه الغير', 'Liability Insurance', 'Public Liability', 
ARRAY['Third Party Cover', 'Legal Defense', 'Property Damage', 'Bodily Injury', 'Court Costs'],
ARRAY['تغطية الطرف الثالث', 'الدفاع القانوني', 'أضرار الممتلكات', 'الإصابات الجسدية', 'تكاليف المحكمة'],
'Essential for businesses dealing with public. Protects against lawsuits.', 'ضروري للشركات التي تتعامل مع الجمهور. يحمي من الدعاوى القضائية.', true, 3),

('ORIENT-CARGO-LAND-01', 13, 'Land Transit Insurance', 'تأمين النقل البري', 'Coverage for goods in transit by road', 'تغطية البضائع في النقل البري', 'Marine Insurance', 'Land Transit', 
ARRAY['Door to Door', 'Theft Protection', 'Accident Damage', 'Loading/Unloading', 'Pan-GCC Coverage'],
ARRAY['من الباب إلى الباب', 'حماية السرقة', 'أضرار الحوادث', 'التحميل والتفريغ', 'تغطية دول المجلس'],
'Specialized in GCC land transport. Competitive rates for regular users.', 'متخصص في النقل البري لدول المجلس. أسعار تنافسية للمستخدمين المنتظمين.', true, 4),

('ORIENT-PROF-INDEM-01', 13, 'Professional Indemnity', 'التعويض المهني', 'Protection for professionals against negligence claims', 'حماية المهنيين ضد مطالبات الإهمال', 'Liability Insurance', 'Professional Indemnity', 
ARRAY['Errors & Omissions', 'Legal Defense', 'Settlement Costs', 'Worldwide Cover', 'Retroactive Date'],
ARRAY['الأخطاء والإغفالات', 'الدفاع القانوني', 'تكاليف التسوية', 'تغطية عالمية', 'التاريخ الرجعي'],
'Essential for consultants, doctors, lawyers. Protects professional reputation.', 'ضروري للاستشاريين والأطباء والمحامين. يحمي السمعة المهنية.', true, 5);

-- ============================================================================
-- TAKAFUL OMAN (TAKAFUL) - Company ID: 14
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('TAKAFUL-MOTOR-ISLAMIC-01', 14, 'Islamic Motor Takaful', 'التكافل الإسلامي للسيارات', 'Fully Sharia-compliant motor insurance with transparent operations', 'تأمين سيارات متوافق تماماً مع الشريعة مع عمليات شفافة', 'Motor Insurance', 'Takaful', 
ARRAY['100% Halal', 'Shariah Board Certified', 'No Riba', 'Profit Sharing', 'Transparent Fees'],
ARRAY['حلال 100%', 'معتمد من مجلس الشريعة', 'بدون ربا', 'تقاسم الأرباح', 'رسوم شفافة'],
'Pure Islamic insurance model. All operations supervised by Shariah board.', 'نموذج تأمين إسلامي نقي. جميع العمليات تحت إشراف مجلس الشريعة.', true, 1),

('TAKAFUL-HEALTH-ISLAMIC-01', 14, 'Islamic Health Takaful', 'التكافل الصحي الإسلامي', 'Sharia-compliant health coverage with comprehensive benefits', 'تغطية صحية متوافقة مع الشريعة مع مزايا شاملة', 'Health Insurance', 'Islamic', 
ARRAY['Halal Healthcare', 'No Interest', 'Mutual Support', 'Shariah Approved', 'Ethical Investments'],
ARRAY['رعاية صحية حلال', 'بدون فوائد', 'الدعم المتبادل', 'معتمد من الشريعة', 'استثمارات أخلاقية'],
'Islamic health insurance based on mutual cooperation. Ethical and transparent.', 'تأمين صحي إسلامي قائم على التعاون المتبادل. أخلاقي وشفاف.', true, 2),

('TAKAFUL-LIFE-ISLAMIC-01', 14, 'Islamic Family Takaful', 'التكافل العائلي الإسلامي', 'Sharia-compliant family protection and savings plan', 'حماية عائلية متوافقة مع الشريعة وخطة ادخار', 'Life Insurance', 'Islamic Takaful', 
ARRAY['Halal Investments', 'Wakala Model', 'Death Benefits', 'Savings Component', 'Zakat Deductible'],
ARRAY['استثمارات حلال', 'نموذج الوكالة', 'استحقاقات الوفاة', 'عنصر الادخار', 'خصم الزكاة'],
'Pure Takaful model with Wakala structure. Investments in Shariah-compliant assets.', 'نموذج تكافل نقي مع هيكل الوكالة. استثمارات في أصول متوافقة مع الشريعة.', true, 3),

('TAKAFUL-PROPERTY-ISLAMIC-01', 14, 'Property Takaful Plan', 'خطة تكافل الممتلكات', 'Islamic insurance for residential and commercial properties', 'تأمين إسلامي للممتلكات السكنية والتجارية', 'Property Insurance', 'Islamic', 
ARRAY['Shariah Compliant', 'Fire Coverage', 'Natural Disasters', 'No Interest', 'Mutual Cooperation'],
ARRAY['متوافق مع الشريعة', 'تغطية الحريق', 'الكوارث الطبيعية', 'بدون فوائد', 'التعاون المتبادل'],
'Islamic property protection based on Tabarru principle. Transparent contribution.', 'حماية ممتلكات إسلامية على أساس مبدأ التبرع. مساهمة شفافة.', true, 4),

('TAKAFUL-INVEST-ISLAMIC-01', 14, 'Islamic Investment Plan', 'خطة الاستثمار الإسلامية', 'Sharia-compliant investment with protection benefits', 'استثمار متوافق مع الشريعة مع مزايا الحماية', 'Life Insurance', 'Investment Takaful', 
ARRAY['Halal Funds', 'Shariah Supervision', 'Ethical Investments', 'Profit Sharing', 'Zakat Facilitation'],
ARRAY['صناديق حلال', 'إشراف الشريعة', 'استثمارات أخلاقية', 'تقاسم الأرباح', 'تسهيل الزكاة'],
'Investment in Shariah-compliant instruments. Returns from halal sources only.', 'استثمار في أدوات متوافقة مع الشريعة. عوائد من مصادر حلال فقط.', true, 5);

-- ============================================================================
-- MUSCAT INSURANCE (MIC) - Company ID: 15
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('MIC-MOTOR-STANDARD-01', 15, 'Standard Motor Cover', 'الغطاء القياسي للسيارات', 'Reliable motor insurance with local expertise and service', 'تأمين سيارات موثوق مع خبرة وخدمة محلية', 'Motor Insurance', 'Comprehensive', 
ARRAY['Local Knowledge', 'Wide Network', 'Quick Processing', 'Competitive Rates', 'Customer Service'],
ARRAY['المعرفة المحلية', 'شبكة واسعة', 'معالجة سريعة', 'أسعار تنافسية', 'خدمة العملاء'],
'Trusted local insurer with years of experience. Strong customer base.', 'شركة تأمين محلية موثوقة مع سنوات من الخبرة. قاعدة عملاء قوية.', true, 1),

('MIC-HEALTH-LOCAL-01', 15, 'Local Health Plan', 'الخطة الصحية المحلية', 'Health insurance with strong Oman hospital network', 'تأمين صحي مع شبكة مستشفيات عمانية قوية', 'Health Insurance', 'Local', 
ARRAY['Oman Focus', 'Local Hospitals', 'Quick Claims', 'Affordable Premiums', 'Family Cover'],
ARRAY['تركيز على عمان', 'المستشفيات المحلية', 'مطالبات سريعة', 'أقساط معقولة', 'تغطية العائلة'],
'Specialized in Oman healthcare. Strong relationships with local hospitals.', 'متخصص في الرعاية الصحية العمانية. علاقات قوية مع المستشفيات المحلية.', true, 2),

('MIC-PROPERTY-COMM-01', 15, 'Commercial Property Insurance', 'تأمين الممتلكات التجارية', 'Comprehensive coverage for commercial buildings and assets', 'تغطية شاملة للمباني والأصول التجارية', 'Property Insurance', 'Commercial', 
ARRAY['Building Cover', 'Stock Protection', 'Equipment', 'Business Interruption', 'Liability'],
ARRAY['تغطية المبنى', 'حماية المخزون', 'المعدات', 'انقطاع الأعمال', 'المسؤولية'],
'Tailored for Oman businesses. Understands local commercial environment.', 'مصمم للشركات العمانية. يفهم البيئة التجارية المحلية.', true, 3),

('MIC-ENGINEERING-PLANT-01', 15, 'Plant & Machinery Insurance', 'تأمين المصانع والآلات', 'Coverage for industrial plants and heavy machinery', 'تغطية للمصانع الصناعية والآلات الثقيلة', 'Engineering Insurance', 'Plant & Machinery', 
ARRAY['Machinery Breakdown', 'Sudden Damage', 'Repair Costs', 'Replacement', 'Business Loss'],
ARRAY['عطل الآلات', 'الضرر المفاجئ', 'تكاليف الإصلاح', 'الاستبدال', 'خسارة الأعمال'],
'Specialized in industrial insurance. Experienced in Oman industrial sector.', 'متخصص في التأمين الصناعي. خبرة في القطاع الصناعي العماني.', true, 4);

-- ============================================================================
-- ARABIA FALCON INSURANCE (AFIC) - Company ID: 16
-- ============================================================================

INSERT INTO insurance_products (code, company_id, name_en, name_ar, description_en, description_ar, category, coverage_type, features_en, features_ar, terms_en, terms_ar, is_active, display_order) VALUES

('AFIC-MOTOR-ELITE-01', 16, 'Elite Motor Insurance', 'تأمين السيارات النخبة', 'Premium motor coverage with enhanced benefits', 'تغطية سيارات ممتازة مع مزايا محسنة', 'Motor Insurance', 'Premium', 
ARRAY['Enhanced Coverage', 'Premium Service', 'Fast Track Claims', 'Roadside Premium', 'Extended Benefits'],
ARRAY['تغطية محسنة', 'خدمة مميزة', 'مطالبات مسار سريع', 'الطريق المميز', 'مزايا ممتدة'],
'Premium motor insurance with superior service standards. Elite customer treatment.', 'تأمين سيارات ممتاز مع معايير خدمة متفوقة. معاملة عملاء نخبة.', true, 1),

('AFIC-HEALTH-PLUS-01', 16, 'Health Plus Plan', 'خطة الصحة بلس', 'Enhanced health insurance with comprehensive benefits', 'تأمين صحي محسن مع مزايا شاملة', 'Health Insurance', 'Enhanced', 
ARRAY['Extended Network', 'Comprehensive Cover', 'Maternity', 'Dental & Optical', 'Preventive Care'],
ARRAY['شبكة ممتدة', 'تغطية شاملة', 'الأمومة', 'الأسنان والبصريات', 'الرعاية الوقائية'],
'Comprehensive health insurance with wide coverage. Focus on preventive care.', 'تأمين صحي شامل مع تغطية واسعة. تركيز على الرعاية الوقائية.', true, 2),

('AFIC-LIFE-SECURE-01', 16, 'Secure Life Plan', 'خطة الحياة الآمنة', 'Reliable life insurance with guaranteed benefits', 'تأمين على الحياة موثوق مع مزايا مضمونة', 'Life Insurance', 'Whole Life', 
ARRAY['Lifetime Protection', 'Guaranteed Benefits', 'Cash Value', 'Loan Facility', 'Maturity Benefit'],
ARRAY['حماية مدى الحياة', 'مزايا مضمونة', 'القيمة النقدية', 'تسهيل القرض', 'استحقاق النضج'],
'Whole life insurance with guaranteed returns. Build cash value over time.', 'تأمين على الحياة بالكامل مع عوائد مضمونة. بناء قيمة نقدية مع مرور الوقت.', true, 3),

('AFIC-FIRE-COMM-01', 16, 'Commercial Fire Insurance', 'تأمين الحريق التجاري', 'Fire protection for commercial establishments', 'حماية من الحريق للمؤسسات التجارية', 'Property Insurance', 'Fire', 
ARRAY['Fire Damage', 'Allied Perils', 'Building & Contents', 'Stock Cover', 'Loss of Profits'],
ARRAY['أضرار الحريق', 'الأخطار المرتبطة', 'المبنى والمحتويات', 'تغطية المخزون', 'خسارة الأرباح'],
'Comprehensive fire protection for businesses. Includes business interruption.', 'حماية شاملة من الحريق للشركات. يتضمن انقطاع الأعمال.', true, 4),

('AFIC-MONEY-TRANSIT-01', 16, 'Money in Transit Insurance', 'تأمين الأموال في النقل', 'Protection for cash and valuables during transportation', 'حماية النقد والأشياء الثمينة أثناء النقل', 'Liability Insurance', 'Money Insurance', 
ARRAY['Cash Transit', 'Safe Coverage', 'Robbery Protection', 'Courier Coverage', '24/7 Protection'],
ARRAY['نقل النقد', 'تغطية الخزنة', 'حماية السرقة', 'تغطية البريد السريع', 'حماية على مدار الساعة'],
'Essential for banks and cash-handling businesses. Covers transit and storage risks.', 'ضروري للبنوك والشركات التي تتعامل بالنقد. يغطي مخاطر النقل والتخزين.', true, 5);

-- Final summary comment
COMMENT ON TABLE insurance_products IS 'All 16 CMA-registered insurance companies now have comprehensive product portfolios covering major insurance categories in Oman market';
