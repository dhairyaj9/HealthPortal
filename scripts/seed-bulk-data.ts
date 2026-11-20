// Static reference data for the bulk synthetic seed (scripts/seed-bulk.ts).

export type Rng = () => number
export const pick = <T,>(r: Rng, arr: T[]): T => arr[Math.floor(r() * arr.length)]
export const between = (r: Rng, min: number, max: number, dp = 0) => {
  const v = min + r() * (max - min)
  return Number(v.toFixed(dp))
}

export const BULK_DOCTORS = [
  { key: 'raman', email: 'priya.raman@healthportal.com', name: 'Dr. Priya Raman', specialty: 'Endocrinologist', license: 'MD-2011-IL-50213', phone: '(555) 410-2290', bio: 'Endocrinologist focused on diabetes, thyroid disorders and metabolic health, with 14 years of clinical practice.' },
  { key: 'torres', email: 'michael.torres@healthportal.com', name: 'Dr. Michael Torres', specialty: 'Pulmonologist', license: 'MD-2009-TX-33871', phone: '(555) 410-3381', bio: 'Pulmonologist specialising in asthma, COPD and sleep-disordered breathing.' },
  { key: 'novak', email: 'emily.novak@healthportal.com', name: 'Dr. Emily Novak', specialty: 'Dermatologist', license: 'MD-2016-OR-72045', phone: '(555) 410-4472', bio: 'Board-certified dermatologist treating eczema, psoriasis and skin cancer screening.' },
  { key: 'kim', email: 'daniel.kim@healthportal.com', name: 'Dr. Daniel Kim', specialty: 'Neurologist', license: 'MD-2013-CA-61198', phone: '(555) 410-5563', bio: 'Neurologist with a special interest in migraine, epilepsy and peripheral neuropathy.' },
  { key: 'adeyemi', email: 'rachel.adeyemi@healthportal.com', name: 'Dr. Rachel Adeyemi', specialty: 'Rheumatologist', license: 'MD-2014-NY-48820', phone: '(555) 410-6654', bio: 'Rheumatologist managing inflammatory arthritis, gout and autoimmune conditions.' },
]

// doctor keys: 'sarah' (cardiology), 'james' (GP) come from the base seed
export type Lab = { testName: string; value: string; unit: string; ref: string; status: string; notes: string }
export type Condition = {
  name: string; doctor: string; notes: string
  med?: { name: string; dosage: string; frequency: string; instructions: string }
  lab?: (r: Rng) => Lab
  doc?: { title: string; type: string; notes: string }
  question?: [string, string, string] // subject, patient body, doctor reply
}

const flag = (abn: boolean) => (abn ? 'abnormal' : 'normal')

export const CONDITIONS: Condition[] = [
  { name: 'Hypertension', doctor: 'sarah', notes: 'Essential hypertension, home BP monitoring advised.',
    med: { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', instructions: 'Take in the morning. Check BP at home twice weekly.' },
    lab: (r) => { const k = between(r, 3.6, 5.4, 1); const cr = between(r, 0.7, 1.4, 1); const abn = k > 5.0 || cr > 1.2; return { testName: 'Basic Metabolic Panel', value: `Na: ${between(r, 136, 144)}, K: ${k}, Cr: ${cr}, Glucose: ${between(r, 80, 110)}`, unit: 'varies', ref: 'Na: 136-145, K: 3.5-5.0, Cr: 0.6-1.2, Glu: 70-100', status: flag(abn), notes: abn ? 'Mild electrolyte/renal deviation on ARB therapy. Repeat in 4 weeks.' : 'Electrolytes and renal function normal on ARB.' } },
    question: ['Home blood pressure readings', 'My home readings have been around 138/88 in the mornings. Is that acceptable or should we adjust my Losartan?', 'Those readings are slightly above target. Please keep a 2-week log, reduce sodium, and we will review at your next visit before changing the dose.'] },
  { name: 'Type 2 Diabetes Mellitus', doctor: 'raman', notes: 'Diet and metformin therapy; annual eye and foot exams.',
    med: { name: 'Metformin XR', dosage: '1000mg', frequency: 'Once daily with dinner', instructions: 'Take with evening meal. Report persistent GI upset.' },
    lab: (r) => { const a = between(r, 6.1, 8.9, 1); return { testName: 'HbA1c', value: String(a), unit: '%', ref: '<5.7 normal; <7.0 diabetic target', status: a >= 8.5 ? 'critical' : flag(a >= 7.0), notes: a >= 7.0 ? 'Above glycaemic target. Reinforce diet; consider therapy intensification.' : 'At glycaemic target. Continue current regimen.' } },
    doc: { title: 'Diabetic Retinal Screening', type: 'imaging', notes: 'No diabetic retinopathy. Repeat annually.' },
    question: ['Low sugar episodes', 'I felt shaky and sweaty twice this week before lunch. My meter read 68. What should I do?', 'Treat with 15g fast sugar and recheck in 15 minutes. Avoid skipping breakfast. If it happens again this week, call the clinic so we can review your medication.'] },
  { name: 'Hyperlipidemia', doctor: 'sarah', notes: 'Statin therapy with lifestyle modification.',
    med: { name: 'Rosuvastatin', dosage: '10mg', frequency: 'Once nightly', instructions: 'Take at bedtime. Report unexplained muscle pain.' },
    lab: (r) => { const ldl = between(r, 70, 175); const hdl = between(r, 35, 70); const tg = between(r, 90, 260); const abn = ldl > 130 || tg > 150 || hdl < 40; return { testName: 'Lipid Panel', value: `TC: ${ldl + hdl + Math.round(tg / 5)}, LDL: ${ldl}, HDL: ${hdl}, TG: ${tg}`, unit: 'mg/dL', ref: 'TC: <200, LDL: <100, HDL: >40, TG: <150', status: flag(abn), notes: abn ? 'Lipids above goal. Dietary review and adherence check.' : 'Lipids at goal on statin.' } } },
  { name: 'Hypothyroidism', doctor: 'raman', notes: 'Primary hypothyroidism on replacement therapy.',
    med: { name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily (morning)', instructions: 'Take on an empty stomach 30-60 minutes before breakfast.' },
    lab: (r) => { const t = between(r, 0.6, 7.8, 2); return { testName: 'TSH', value: String(t), unit: 'mIU/L', ref: '0.4-4.0', status: flag(t > 4.0), notes: t > 4.0 ? 'TSH elevated - dose increase to be considered.' : 'TSH within range on current dose.' } },
    question: ['Levothyroxine and supplements', 'Can I take my calcium supplement at the same time as Levothyroxine?', 'Please separate them by at least 4 hours - calcium reduces absorption of Levothyroxine. Take calcium with lunch or dinner instead.'] },
  { name: 'Persistent Asthma', doctor: 'torres', notes: 'Moderate persistent asthma on controller inhaler.',
    med: { name: 'Budesonide/Formoterol Inhaler', dosage: '160/4.5mcg', frequency: '2 puffs twice daily', instructions: 'Rinse mouth after each use. Use spacer.' },
    lab: (r) => { const f = between(r, 64, 98); return { testName: 'Spirometry', value: `FEV1: ${f}%, FVC: ${between(r, 82, 101)}%, FEV1/FVC: ${between(r, 0.66, 0.86, 2)}`, unit: '% predicted', ref: 'FEV1: >80%, FEV1/FVC: >0.70', status: flag(f < 80), notes: f < 80 ? 'Mild obstruction with partial bronchodilator reversibility.' : 'Lung function within normal limits.' } },
    question: ['Inhaler use at night', 'I have been using my rescue inhaler 2-3 nights a week because of coughing. Is that normal?', 'Night symptoms more than once a week suggest your asthma is not well controlled. Please book a review; we may step up your controller therapy.'] },
  { name: 'COPD (GOLD 2)', doctor: 'torres', notes: 'Former smoker, 30 pack-years. Pulmonary rehab completed.',
    med: { name: 'Tiotropium Inhaler', dosage: '18mcg', frequency: 'Once daily', instructions: 'Inhale contents of one capsule daily. Do not swallow capsules.' },
    lab: (r) => { const f = between(r, 52, 72); return { testName: 'Spirometry (post-bronchodilator)', value: `FEV1: ${f}%, FEV1/FVC: ${between(r, 0.55, 0.68, 2)}`, unit: '% predicted', ref: 'FEV1/FVC: >0.70', status: 'abnormal', notes: 'Fixed airflow obstruction consistent with moderate COPD.' } },
    doc: { title: 'Chest X-Ray (PA & Lateral)', type: 'imaging', notes: 'Hyperinflated lungs. No focal consolidation.' } },
  { name: 'Obstructive Sleep Apnea', doctor: 'torres', notes: 'AHI 22 on sleep study; CPAP nightly.',
    doc: { title: 'Polysomnography Report', type: 'report', notes: 'Moderate OSA, AHI 22/h. CPAP titrated to 9 cmH2O.' } },
  { name: 'Atopic Dermatitis', doctor: 'novak', notes: 'Chronic flexural eczema with seasonal flares.',
    med: { name: 'Triamcinolone 0.1% Cream', dosage: 'Thin layer', frequency: 'Twice daily during flares', instructions: 'Apply to affected areas only, max 2 weeks continuously. Moisturise daily.' },
    question: ['Eczema flare', 'My eczema has flared on both elbows despite the cream. Can I use it for longer than 2 weeks?', 'Please do not exceed 2 weeks continuously. Use a fragrance-free emollient several times daily and upload a photo; we can consider a non-steroid option.'] },
  { name: 'Plaque Psoriasis', doctor: 'novak', notes: 'Mild-moderate plaque psoriasis, ~5% BSA.',
    med: { name: 'Clobetasol 0.05% Ointment', dosage: 'Thin layer', frequency: 'Twice daily', instructions: 'Scalp and elbow plaques only. Do not apply to face.' },
    doc: { title: 'Dermatology Skin Check Summary', type: 'report', notes: 'Full skin exam. No suspicious pigmented lesions.' } },
  { name: 'Migraine without Aura', doctor: 'kim', notes: 'Episodic migraine, 3-5 days/month.',
    med: { name: 'Sumatriptan', dosage: '50mg', frequency: 'At onset, may repeat after 2h (max 200mg/day)', instructions: 'Take at headache onset. Do not use more than 9 days per month.' },
    question: ['Headache frequency', 'My migraines have increased to about 8 days this month. Should I take Sumatriptan every time?', 'Using it on more than 9 days a month risks medication-overuse headache. Keep a headache diary; with this frequency we should discuss a preventive medication.'] },
  { name: 'Epilepsy (Focal Seizures)', doctor: 'kim', notes: 'Seizure-free for 18 months on monotherapy.',
    med: { name: 'Levetiracetam', dosage: '500mg', frequency: 'Twice daily', instructions: 'Do not stop abruptly. Report mood changes.' },
    doc: { title: 'EEG Report', type: 'report', notes: 'Intermittent left temporal slowing. No epileptiform discharges captured.' } },
  { name: 'Rheumatoid Arthritis', doctor: 'adeyemi', notes: 'Seropositive RA, low disease activity.',
    med: { name: 'Methotrexate', dosage: '15mg', frequency: 'Once weekly (Mondays)', instructions: 'Take ONCE weekly only. Take folic acid daily except methotrexate day. Avoid alcohol.' },
    lab: (r) => { const crp = between(r, 1, 24, 1); const esr = between(r, 8, 42); const abn = crp > 10 || esr > 30; return { testName: 'Inflammatory Markers (CRP/ESR)', value: `CRP: ${crp} mg/L, ESR: ${esr} mm/hr`, unit: 'mg/L, mm/hr', ref: 'CRP: <10, ESR: <30', status: flag(abn), notes: abn ? 'Raised inflammatory markers - possible flare.' : 'Inflammatory markers controlled.' } } },
  { name: 'Gout', doctor: 'adeyemi', notes: 'Recurrent podagra; urate-lowering therapy.',
    med: { name: 'Allopurinol', dosage: '200mg', frequency: 'Once daily', instructions: 'Drink plenty of fluids. Continue during flares.' },
    lab: (r) => { const u = between(r, 4.8, 9.6, 1); return { testName: 'Serum Uric Acid', value: String(u), unit: 'mg/dL', ref: 'Target <6.0', status: flag(u >= 6.0), notes: u >= 6.0 ? 'Above urate target. Titrate allopurinol.' : 'At urate target.' } } },
  { name: 'Osteoarthritis of Knee', doctor: 'adeyemi', notes: 'Bilateral knee OA, physiotherapy and weight management.',
    med: { name: 'Acetaminophen', dosage: '650mg', frequency: 'Up to 3 times daily as needed', instructions: 'Do not exceed 3000mg per day.' },
    doc: { title: 'Knee X-Ray (Weight-bearing)', type: 'imaging', notes: 'Medial joint space narrowing and osteophytes.' } },
  { name: 'GERD', doctor: 'james', notes: 'Reflux symptoms, lifestyle advice given.',
    med: { name: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily before breakfast', instructions: 'Take 30 minutes before the first meal of the day.' } },
  { name: 'Generalized Anxiety Disorder', doctor: 'james', notes: 'GAD-7 score 12; CBT referral made.',
    med: { name: 'Escitalopram', dosage: '10mg', frequency: 'Once daily', instructions: 'May take 4-6 weeks for full effect. Do not stop abruptly.' } },
  { name: 'Major Depressive Disorder (mild)', doctor: 'james', notes: 'PHQ-9 of 11, improving with therapy.',
    med: { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', instructions: 'Take in the morning. Report any worsening mood immediately.' } },
  { name: 'Vitamin D Deficiency', doctor: 'james', notes: 'Low 25-OH vitamin D on screening.',
    med: { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', instructions: 'Take with a meal containing fat.' },
    lab: (r) => { const d = between(r, 12, 38); return { testName: 'Vitamin D, 25-Hydroxy', value: String(d), unit: 'ng/mL', ref: '30-100', status: flag(d < 30), notes: d < 30 ? 'Insufficient. Continue supplementation.' : 'Replete. Continue maintenance dose.' } } },
  { name: 'Chronic Kidney Disease Stage 2', doctor: 'james', notes: 'Mildly reduced eGFR; BP and glucose control emphasised.',
    lab: (r) => { const g = between(r, 58, 84); return { testName: 'Renal Panel (eGFR)', value: `eGFR: ${g}, Cr: ${between(r, 1.0, 1.4, 2)}, BUN: ${between(r, 14, 26)}`, unit: 'mL/min/1.73m², mg/dL', ref: 'eGFR: >90, Cr: 0.6-1.2, BUN: 7-20', status: g < 60 ? 'critical' : 'abnormal', notes: 'Stable mildly reduced kidney function. Avoid NSAIDs.' } } },
  { name: 'Iron-deficiency Anemia', doctor: 'james', notes: 'Resolved after oral iron course.',
    lab: (r) => { const h = between(r, 10.8, 14.6, 1); return { testName: 'CBC Panel', value: `WBC: ${between(r, 4.6, 9.8, 1)}, Hgb: ${h}, MCV: ${between(r, 76, 94)}, Plt: ${between(r, 170, 380)}`, unit: 'varies', ref: 'WBC: 4.5-11.0, Hgb: 12-17, MCV: 80-100, Plt: 150-400', status: flag(h < 12), notes: h < 12 ? 'Mild anemia persists - check ferritin.' : 'Hemoglobin normalised.' } } },
]

export const ALLERGENS: [string, string, string][] = [
  ['Penicillin', 'Hives and facial swelling', 'severe'], ['Amoxicillin', 'Rash', 'moderate'], ['Sulfonamides', 'Rash', 'moderate'],
  ['Aspirin', 'Bronchospasm', 'severe'], ['Ibuprofen', 'Stomach upset', 'mild'], ['Codeine', 'Nausea and vomiting', 'moderate'],
  ['Morphine', 'Itching', 'mild'], ['Latex', 'Contact dermatitis', 'mild'], ['Peanuts', 'Anaphylaxis', 'severe'],
  ['Tree nuts', 'Throat tightness', 'severe'], ['Shellfish', 'Hives', 'moderate'], ['Eggs', 'Abdominal cramps', 'mild'],
  ['Bee stings', 'Large local swelling', 'moderate'], ['Pollen', 'Seasonal rhinitis', 'mild'], ['Cat dander', 'Sneezing, itchy eyes', 'mild'],
  ['Iodinated contrast', 'Flushing and itching', 'moderate'], ['Cephalexin', 'Rash', 'moderate'], ['Nickel', 'Contact dermatitis', 'mild'],
]

export const INSURERS = ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Kaiser Permanente', 'Anthem', 'Medicare Part B', 'Oscar Health', 'Molina Healthcare']
export const BLOOD = ['O+', 'O+', 'O+', 'A+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-']
export const STREETS = ['Willow Way', 'Cedar Court', 'Birch Boulevard', 'Elm Street', 'Lakeview Drive', 'Sunset Avenue', 'Highland Road', 'River Bend Lane', 'Park Place', 'Meadow Lane', 'Harbor View', 'Chestnut Street']
export const CITIES = ['Chicago, IL 60614', 'Denver, CO 80203', 'Seattle, WA 98101', 'Boston, MA 02116', 'Atlanta, GA 30303', 'Phoenix, AZ 85004', 'Nashville, TN 37203', 'Minneapolis, MN 55401', 'Columbus, OH 43215', 'Raleigh, NC 27601', 'San Diego, CA 92101', 'Miami, FL 33130']

// [first, last, gender, dob, emergency contact first name]
export const BULK_PATIENTS: [string, string, string, string, string][] = [
  ['Emma', 'Thompson', 'Female', '1988-02-14', 'Mark'], ['Liam', 'O\'Connor', 'Male', '1979-06-03', 'Siobhan'],
  ['Sophia', 'Patel', 'Female', '1993-09-21', 'Raj'], ['Noah', 'Garcia', 'Male', '1958-12-30', 'Elena'],
  ['Olivia', 'Nguyen', 'Female', '1975-04-17', 'Tuan'], ['Ethan', 'Brooks', 'Male', '2001-08-09', 'Karen'],
  ['Ava', 'Rossi', 'Female', '1968-01-25', 'Marco'], ['Mason', 'Wright', 'Male', '1983-11-12', 'Jenna'],
  ['Isabella', 'Kowalski', 'Female', '1952-07-07', 'Piotr'], ['Lucas', 'Okafor', 'Male', '1990-03-28', 'Ngozi'],
  ['Mia', 'Fischer', 'Female', '1986-10-02', 'Jonas'], ['James', 'Sullivan', 'Male', '1961-05-19', 'Margaret'],
  ['Charlotte', 'Haddad', 'Female', '1997-12-11', 'Omar'], ['Benjamin', 'Reyes', 'Male', '1970-02-06', 'Lucia'],
  ['Amelia', 'Lindqvist', 'Female', '1981-08-23', 'Erik'], ['Henry', 'Watanabe', 'Male', '1955-09-14', 'Yuki'],
  ['Harper', 'Dubois', 'Female', '1999-06-30', 'Claire'], ['Samuel', 'Mensah', 'Male', '1974-01-08', 'Abena'],
  ['Grace', 'Murphy', 'Female', '1964-03-04', 'Sean'], ['Daniel', 'Ivanov', 'Male', '1987-07-27', 'Natalia'],
]

export const VISIT_REASONS = ['Routine follow-up', 'Medication review', 'Lab results discussion', 'New symptom evaluation', 'Annual physical', 'Chronic disease review', 'Post-treatment check']
export const VISIT_NOTES = [
  'Patient stable. Continue current management.', 'Symptoms improved since last visit. Labs ordered.',
  'Discussed lifestyle changes: diet, exercise and sleep.', 'Dose adjusted; recheck in 6 weeks.',
  'Vitals within normal limits. No new concerns.', 'Reviewed results with patient; questions answered.',
]
