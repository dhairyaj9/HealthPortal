import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedBulk } from './seed-bulk'

const prisma = new PrismaClient()

async function main() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 12)

  // Hidden test account
  await prisma.user.upsert({
    where: { email: 'abacus-c7ee4b5b@example.com' },
    update: {},
    create: {
      email: 'abacus-c7ee4b5b@example.com',
      passwordHash: hash('0s*OwAeNYf'),
      name: 'Test Admin',
      role: 'patient',
    },
  })

  // --- DOCTORS ---
  const drSarah = await prisma.user.upsert({
    where: { email: 'sarah.mitchell@healthportal.com' },
    update: {},
    create: {
      email: 'sarah.mitchell@healthportal.com',
      passwordHash: hash('Doctor@123'),
      name: 'Dr. Sarah Mitchell',
      role: 'doctor',
    },
  })

  const drSarahProfile = await prisma.doctorProfile.upsert({
    where: { userId: drSarah.id },
    update: {},
    create: {
      userId: drSarah.id,
      specialty: 'Cardiologist',
      licenseNumber: 'MD-2015-CA-11234',
      phone: '(555) 201-3344',
      bio: 'Board-certified cardiologist with over 12 years of experience in cardiovascular disease management, preventive cardiology, and cardiac imaging.',
    },
  })

  const drJames = await prisma.user.upsert({
    where: { email: 'james.okonkwo@healthportal.com' },
    update: {},
    create: {
      email: 'james.okonkwo@healthportal.com',
      passwordHash: hash('Doctor@123'),
      name: 'Dr. James Okonkwo',
      role: 'doctor',
    },
  })

  const drJamesProfile = await prisma.doctorProfile.upsert({
    where: { userId: drJames.id },
    update: {},
    create: {
      userId: drJames.id,
      specialty: 'General Practitioner',
      licenseNumber: 'MD-2012-NY-78456',
      phone: '(555) 302-4567',
      bio: 'Experienced family medicine physician dedicated to comprehensive primary care, chronic disease management, and preventive health.',
    },
  })

  // --- PATIENTS ---
  // Alice Johnson
  const alice = await prisma.user.upsert({
    where: { email: 'alice.johnson@healthportal.com' },
    update: {},
    create: {
      email: 'alice.johnson@healthportal.com',
      passwordHash: hash('Patient@123'),
      name: 'Alice Johnson',
      role: 'patient',
    },
  })
  const aliceProfile = await prisma.patientProfile.upsert({
    where: { userId: alice.id },
    update: {},
    create: {
      userId: alice.id,
      dob: new Date('1985-03-12'),
      gender: 'Female',
      bloodType: 'A+',
      phone: '(555) 100-2001',
      address: '142 Maple Street, Springfield, IL 62701',
      emergencyContactName: 'Robert Johnson',
      emergencyContactPhone: '(555) 100-2002',
      insuranceProvider: 'Blue Cross Blue Shield',
      insurancePolicyNumber: 'BCBS-2024-AJ-8821',
      insuranceGroupNumber: 'GRP-44521',
    },
  })

  // Bob Martinez
  const bob = await prisma.user.upsert({
    where: { email: 'bob.martinez@healthportal.com' },
    update: {},
    create: {
      email: 'bob.martinez@healthportal.com',
      passwordHash: hash('Patient@123'),
      name: 'Bob Martinez',
      role: 'patient',
    },
  })
  const bobProfile = await prisma.patientProfile.upsert({
    where: { userId: bob.id },
    update: {},
    create: {
      userId: bob.id,
      dob: new Date('1972-07-28'),
      gender: 'Male',
      bloodType: 'O+',
      phone: '(555) 200-3001',
      address: '88 Oak Avenue, Austin, TX 73301',
      emergencyContactName: 'Maria Martinez',
      emergencyContactPhone: '(555) 200-3002',
      insuranceProvider: 'Aetna',
      insurancePolicyNumber: 'AETNA-2023-BM-5547',
      insuranceGroupNumber: 'GRP-98712',
    },
  })

  // Carol Williams
  const carol = await prisma.user.upsert({
    where: { email: 'carol.williams@healthportal.com' },
    update: {},
    create: {
      email: 'carol.williams@healthportal.com',
      passwordHash: hash('Patient@123'),
      name: 'Carol Williams',
      role: 'patient',
    },
  })
  const carolProfile = await prisma.patientProfile.upsert({
    where: { userId: carol.id },
    update: {},
    create: {
      userId: carol.id,
      dob: new Date('1990-11-05'),
      gender: 'Female',
      bloodType: 'B-',
      phone: '(555) 300-4001',
      address: '215 Pine Road, Portland, OR 97201',
      emergencyContactName: 'James Williams',
      emergencyContactPhone: '(555) 300-4002',
      insuranceProvider: 'UnitedHealthcare',
      insurancePolicyNumber: 'UHC-2024-CW-3321',
      insuranceGroupNumber: 'GRP-55089',
    },
  })

  // David Chen
  const david = await prisma.user.upsert({
    where: { email: 'david.chen@healthportal.com' },
    update: {},
    create: {
      email: 'david.chen@healthportal.com',
      passwordHash: hash('Patient@123'),
      name: 'David Chen',
      role: 'patient',
    },
  })
  const davidProfile = await prisma.patientProfile.upsert({
    where: { userId: david.id },
    update: {},
    create: {
      userId: david.id,
      dob: new Date('1965-09-18'),
      gender: 'Male',
      bloodType: 'AB+',
      phone: '(555) 400-5001',
      address: '52 Cherry Lane, San Francisco, CA 94102',
      emergencyContactName: 'Linda Chen',
      emergencyContactPhone: '(555) 400-5002',
      insuranceProvider: 'Kaiser Permanente',
      insurancePolicyNumber: 'KP-2024-DC-7712',
      insuranceGroupNumber: 'GRP-33210',
    },
  })

  // --- MEDICAL HISTORY ---
  // Alice
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-alice-1' },
    update: {},
    create: { id: 'mh-alice-1', patientId: aliceProfile.id, condition: 'Hypertension', diagnosedDate: new Date('2018-06-15'), status: 'active', notes: 'Stage 1 hypertension, well-controlled with current medication regimen', doctorId: drSarahProfile.id },
  })
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-alice-2' },
    update: {},
    create: { id: 'mh-alice-2', patientId: aliceProfile.id, condition: 'Mild Anemia', diagnosedDate: new Date('2020-03-20'), status: 'resolved', notes: 'Iron-deficiency anemia resolved with supplementation', doctorId: drSarahProfile.id },
  })
  // Bob
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-bob-1' },
    update: {},
    create: { id: 'mh-bob-1', patientId: bobProfile.id, condition: 'Type 2 Diabetes', diagnosedDate: new Date('2015-01-10'), status: 'active', notes: 'HbA1c consistently around 7.2%, on Metformin', doctorId: drJamesProfile.id },
  })
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-bob-2' },
    update: {},
    create: { id: 'mh-bob-2', patientId: bobProfile.id, condition: 'Hyperlipidemia', diagnosedDate: new Date('2017-04-22'), status: 'active', notes: 'Managed with Atorvastatin, LDL within target', doctorId: drJamesProfile.id },
  })
  // Carol
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-carol-1' },
    update: {},
    create: { id: 'mh-carol-1', patientId: carolProfile.id, condition: 'Asthma', diagnosedDate: new Date('2010-09-01'), status: 'active', notes: 'Intermittent asthma, uses rescue inhaler PRN', doctorId: drJamesProfile.id },
  })
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-carol-2' },
    update: {},
    create: { id: 'mh-carol-2', patientId: carolProfile.id, condition: 'GERD', diagnosedDate: new Date('2019-05-12'), status: 'active', notes: 'Gastroesophageal reflux managed with Omeprazole', doctorId: drJamesProfile.id },
  })
  // David
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-david-1' },
    update: {},
    create: { id: 'mh-david-1', patientId: davidProfile.id, condition: 'Atrial Fibrillation', diagnosedDate: new Date('2016-11-03'), status: 'active', notes: 'Persistent AFib, on Warfarin anticoagulation', doctorId: drSarahProfile.id },
  })
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-david-2' },
    update: {},
    create: { id: 'mh-david-2', patientId: davidProfile.id, condition: 'Hypothyroidism', diagnosedDate: new Date('2019-02-14'), status: 'active', notes: 'On Levothyroxine, TSH levels stable', doctorId: drJamesProfile.id },
  })
  await prisma.medicalHistory.upsert({
    where: { id: 'mh-david-3' },
    update: {},
    create: { id: 'mh-david-3', patientId: davidProfile.id, condition: 'Osteoarthritis', diagnosedDate: new Date('2021-07-30'), status: 'active', notes: 'Bilateral knee OA, managing with PT and acetaminophen', doctorId: drJamesProfile.id },
  })

  // --- MEDICATIONS ---
  await prisma.medication.upsert({ where: { id: 'med-alice-1' }, update: {}, create: { id: 'med-alice-1', patientId: aliceProfile.id, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: new Date('2018-07-01'), status: 'active', prescribingDoctorId: drSarahProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-alice-2' }, update: {}, create: { id: 'med-alice-2', patientId: aliceProfile.id, name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: new Date('2019-01-15'), status: 'active', prescribingDoctorId: drSarahProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-bob-1' }, update: {}, create: { id: 'med-bob-1', patientId: bobProfile.id, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', startDate: new Date('2015-02-01'), status: 'active', prescribingDoctorId: drJamesProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-bob-2' }, update: {}, create: { id: 'med-bob-2', patientId: bobProfile.id, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once nightly', startDate: new Date('2017-05-10'), status: 'active', prescribingDoctorId: drJamesProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-carol-1' }, update: {}, create: { id: 'med-carol-1', patientId: carolProfile.id, name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'PRN', startDate: new Date('2010-10-01'), status: 'active', prescribingDoctorId: drJamesProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-carol-2' }, update: {}, create: { id: 'med-carol-2', patientId: carolProfile.id, name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', startDate: new Date('2019-06-01'), status: 'active', prescribingDoctorId: drJamesProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-david-1' }, update: {}, create: { id: 'med-david-1', patientId: davidProfile.id, name: 'Warfarin', dosage: '5mg', frequency: 'Once daily', startDate: new Date('2016-12-01'), status: 'active', prescribingDoctorId: drSarahProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-david-2' }, update: {}, create: { id: 'med-david-2', patientId: davidProfile.id, name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily (morning)', startDate: new Date('2019-03-01'), status: 'active', prescribingDoctorId: drJamesProfile.id } })

  // --- ALLERGIES ---
  await prisma.allergy.upsert({ where: { id: 'al-alice-1' }, update: {}, create: { id: 'al-alice-1', patientId: aliceProfile.id, allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' } })
  await prisma.allergy.upsert({ where: { id: 'al-alice-2' }, update: {}, create: { id: 'al-alice-2', patientId: aliceProfile.id, allergen: 'Shellfish', reaction: 'Hives', severity: 'moderate' } })
  await prisma.allergy.upsert({ where: { id: 'al-bob-1' }, update: {}, create: { id: 'al-bob-1', patientId: bobProfile.id, allergen: 'Sulfa drugs', reaction: 'Rash', severity: 'moderate' } })
  await prisma.allergy.upsert({ where: { id: 'al-bob-2' }, update: {}, create: { id: 'al-bob-2', patientId: bobProfile.id, allergen: 'Latex', reaction: 'Contact dermatitis', severity: 'mild' } })
  await prisma.allergy.upsert({ where: { id: 'al-carol-1' }, update: {}, create: { id: 'al-carol-1', patientId: carolProfile.id, allergen: 'Aspirin', reaction: 'Bronchospasm', severity: 'severe' } })
  await prisma.allergy.upsert({ where: { id: 'al-carol-2' }, update: {}, create: { id: 'al-carol-2', patientId: carolProfile.id, allergen: 'Dust mites', reaction: 'Rhinitis', severity: 'mild' } })
  await prisma.allergy.upsert({ where: { id: 'al-david-1' }, update: {}, create: { id: 'al-david-1', patientId: davidProfile.id, allergen: 'Ibuprofen', reaction: 'GI bleeding', severity: 'severe' } })
  await prisma.allergy.upsert({ where: { id: 'al-david-2' }, update: {}, create: { id: 'al-david-2', patientId: davidProfile.id, allergen: 'Codeine', reaction: 'Nausea', severity: 'moderate' } })

  // --- APPOINTMENTS ---
  const now = new Date()
  const daysFromNow = (d: number) => { const dt = new Date(now); dt.setDate(dt.getDate() + d); dt.setHours(10, 0, 0, 0); return dt }
  const daysAgo = (d: number) => { const dt = new Date(now); dt.setDate(dt.getDate() - d); dt.setHours(10, 0, 0, 0); return dt }

  // Alice
  const apt1 = await prisma.appointment.upsert({ where: { id: 'apt-alice-1' }, update: {}, create: { id: 'apt-alice-1', patientId: aliceProfile.id, doctorId: drSarahProfile.id, dateTime: daysAgo(60), durationMinutes: 30, type: 'in-person', status: 'completed', reason: 'Quarterly BP check', notes: 'BP 128/82, stable. Continue current meds.' } })
  const apt2 = await prisma.appointment.upsert({ where: { id: 'apt-alice-2' }, update: {}, create: { id: 'apt-alice-2', patientId: aliceProfile.id, doctorId: drSarahProfile.id, dateTime: daysAgo(15), durationMinutes: 45, type: 'in-person', status: 'completed', reason: 'Annual cardiac review', notes: 'ECG normal. Lipid panel ordered.' } })
  await prisma.appointment.upsert({ where: { id: 'apt-alice-3' }, update: {}, create: { id: 'apt-alice-3', patientId: aliceProfile.id, doctorId: drSarahProfile.id, dateTime: daysFromNow(14), durationMinutes: 30, type: 'telehealth', status: 'scheduled', reason: 'Follow-up: Lipid panel results' } })
  await prisma.appointment.upsert({ where: { id: 'apt-alice-4' }, update: {}, create: { id: 'apt-alice-4', patientId: aliceProfile.id, doctorId: drSarahProfile.id, dateTime: daysFromNow(45), durationMinutes: 30, type: 'in-person', status: 'scheduled', reason: 'Quarterly BP check' } })

  // Bob
  const apt5 = await prisma.appointment.upsert({ where: { id: 'apt-bob-1' }, update: {}, create: { id: 'apt-bob-1', patientId: bobProfile.id, doctorId: drJamesProfile.id, dateTime: daysAgo(30), durationMinutes: 30, type: 'in-person', status: 'completed', reason: 'Diabetes management review', notes: 'HbA1c 7.1%, improving. Maintain Metformin.' } })
  await prisma.appointment.upsert({ where: { id: 'apt-bob-2' }, update: {}, create: { id: 'apt-bob-2', patientId: bobProfile.id, doctorId: drJamesProfile.id, dateTime: daysFromNow(7), durationMinutes: 30, type: 'telehealth', status: 'scheduled', reason: 'Fasting glucose follow-up' } })
  await prisma.appointment.upsert({ where: { id: 'apt-bob-3' }, update: {}, create: { id: 'apt-bob-3', patientId: bobProfile.id, doctorId: drJamesProfile.id, dateTime: daysFromNow(35), durationMinutes: 45, type: 'in-person', status: 'scheduled', reason: 'Comprehensive metabolic panel review' } })

  // Carol
  await prisma.appointment.upsert({ where: { id: 'apt-carol-1' }, update: {}, create: { id: 'apt-carol-1', patientId: carolProfile.id, doctorId: drJamesProfile.id, dateTime: daysFromNow(10), durationMinutes: 30, type: 'in-person', status: 'scheduled', reason: 'Annual checkup and asthma review' } })

  // David
  const apt8 = await prisma.appointment.upsert({ where: { id: 'apt-david-1' }, update: {}, create: { id: 'apt-david-1', patientId: davidProfile.id, doctorId: drSarahProfile.id, dateTime: daysAgo(20), durationMinutes: 45, type: 'in-person', status: 'completed', reason: 'AFib evaluation and INR check', notes: 'INR 2.3, within range. Continue Warfarin 5mg.' } })
  await prisma.appointment.upsert({ where: { id: 'apt-david-2' }, update: {}, create: { id: 'apt-david-2', patientId: davidProfile.id, doctorId: drSarahProfile.id, dateTime: daysFromNow(5), durationMinutes: 30, type: 'telehealth', status: 'scheduled', reason: 'INR follow-up' } })
  await prisma.appointment.upsert({ where: { id: 'apt-david-3' }, update: {}, create: { id: 'apt-david-3', patientId: davidProfile.id, doctorId: drJamesProfile.id, dateTime: daysFromNow(21), durationMinutes: 30, type: 'in-person', status: 'scheduled', reason: 'Thyroid function follow-up' } })
  await prisma.appointment.upsert({ where: { id: 'apt-david-4' }, update: {}, create: { id: 'apt-david-4', patientId: davidProfile.id, doctorId: drJamesProfile.id, dateTime: daysFromNow(50), durationMinutes: 45, type: 'in-person', status: 'scheduled', reason: 'Osteoarthritis management review' } })

  // --- LAB RESULTS ---
  // Alice
  await prisma.labResult.upsert({ where: { id: 'lab-alice-1' }, update: {}, create: { id: 'lab-alice-1', patientId: aliceProfile.id, doctorId: drSarahProfile.id, testName: 'CBC Panel', resultValue: 'WBC: 6.8, RBC: 4.2, Hgb: 13.1, Plt: 245', unit: 'varies', referenceRange: 'WBC: 4.5-11.0, RBC: 3.8-5.1, Hgb: 12-16, Plt: 150-400', status: 'normal', orderedDate: daysAgo(20), resultDate: daysAgo(18), notes: 'All values within normal limits' } })
  await prisma.labResult.upsert({ where: { id: 'lab-alice-2' }, update: {}, create: { id: 'lab-alice-2', patientId: aliceProfile.id, doctorId: drSarahProfile.id, testName: 'Lipid Panel', resultValue: 'TC: 242, LDL: 158, HDL: 48, TG: 180', unit: 'mg/dL', referenceRange: 'TC: <200, LDL: <100, HDL: >60, TG: <150', status: 'abnormal', orderedDate: daysAgo(15), resultDate: daysAgo(13), notes: 'Elevated LDL and total cholesterol. Consider statin therapy.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-alice-3' }, update: {}, create: { id: 'lab-alice-3', patientId: aliceProfile.id, doctorId: drSarahProfile.id, testName: 'BMP (Basic Metabolic Panel)', resultValue: 'Na: 140, K: 4.1, Cl: 102, BUN: 15, Cr: 0.9, Glucose: 95', unit: 'varies', referenceRange: 'Na: 136-145, K: 3.5-5.0, Cl: 98-106, BUN: 7-20, Cr: 0.6-1.2, Glu: 70-100', status: 'normal', orderedDate: daysAgo(15), resultDate: daysAgo(13), notes: 'All within normal range' } })

  // Bob
  await prisma.labResult.upsert({ where: { id: 'lab-bob-1' }, update: {}, create: { id: 'lab-bob-1', patientId: bobProfile.id, doctorId: drJamesProfile.id, testName: 'HbA1c', resultValue: '7.1', unit: '%', referenceRange: '<5.7 normal, 5.7-6.4 prediabetes, >6.5 diabetes', status: 'abnormal', orderedDate: daysAgo(30), resultDate: daysAgo(28), notes: 'Improving from previous 7.4%. Continue current management.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-bob-2' }, update: {}, create: { id: 'lab-bob-2', patientId: bobProfile.id, doctorId: drJamesProfile.id, testName: 'Fasting Glucose', resultValue: '138', unit: 'mg/dL', referenceRange: '70-100 mg/dL', status: 'abnormal', orderedDate: daysAgo(30), resultDate: daysAgo(28), notes: 'Elevated fasting glucose. Monitor closely.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-bob-3' }, update: {}, create: { id: 'lab-bob-3', patientId: bobProfile.id, doctorId: drJamesProfile.id, testName: 'Comprehensive Metabolic Panel', resultValue: 'Na: 141, K: 4.3, BUN: 18, Cr: 1.0, ALT: 28, AST: 24', unit: 'varies', referenceRange: 'Na: 136-145, K: 3.5-5.0, BUN: 7-20, Cr: 0.6-1.2, ALT: 7-56, AST: 10-40', status: 'normal', orderedDate: daysAgo(30), resultDate: daysAgo(27), notes: 'Renal and liver function normal' } })

  // Carol
  await prisma.labResult.upsert({ where: { id: 'lab-carol-1' }, update: {}, create: { id: 'lab-carol-1', patientId: carolProfile.id, doctorId: drJamesProfile.id, testName: 'Spirometry', resultValue: 'FEV1: 82%, FVC: 90%, FEV1/FVC: 0.91', unit: '% predicted', referenceRange: 'FEV1: >80%, FVC: >80%, FEV1/FVC: >0.70', status: 'normal', orderedDate: daysAgo(45), resultDate: daysAgo(42), notes: 'Lung function within normal limits. Intermittent asthma stable.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-carol-2' }, update: {}, create: { id: 'lab-carol-2', patientId: carolProfile.id, doctorId: drJamesProfile.id, testName: 'H. pylori Antibody Test', resultValue: 'Negative', unit: '', referenceRange: 'Negative', status: 'normal', orderedDate: daysAgo(45), resultDate: daysAgo(43), notes: 'No H. pylori infection detected. GERD likely not H. pylori related.' } })

  // David
  await prisma.labResult.upsert({ where: { id: 'lab-david-1' }, update: {}, create: { id: 'lab-david-1', patientId: davidProfile.id, doctorId: drSarahProfile.id, testName: 'INR/PT', resultValue: 'INR: 2.3, PT: 26.5s', unit: 'INR ratio / seconds', referenceRange: 'INR: 2.0-3.0 (target for AFib), PT: 11-13.5s', status: 'normal', orderedDate: daysAgo(20), resultDate: daysAgo(19), notes: 'INR within therapeutic range for atrial fibrillation' } })
  await prisma.labResult.upsert({ where: { id: 'lab-david-2' }, update: {}, create: { id: 'lab-david-2', patientId: davidProfile.id, doctorId: drJamesProfile.id, testName: 'TSH', resultValue: '3.8', unit: 'mIU/L', referenceRange: '0.4-4.0 mIU/L', status: 'normal', orderedDate: daysAgo(25), resultDate: daysAgo(23), notes: 'TSH within normal range on current Levothyroxine dose' } })
  await prisma.labResult.upsert({ where: { id: 'lab-david-3' }, update: {}, create: { id: 'lab-david-3', patientId: davidProfile.id, doctorId: drJamesProfile.id, testName: 'Liver Function Test', resultValue: 'ALT: 42, AST: 38, ALP: 95, Bilirubin: 1.1', unit: 'U/L and mg/dL', referenceRange: 'ALT: 7-56, AST: 10-40, ALP: 44-147, Bili: 0.1-1.2', status: 'normal', orderedDate: daysAgo(25), resultDate: daysAgo(22), notes: 'Liver function normal. Safe to continue Warfarin.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-david-4' }, update: {}, create: { id: 'lab-david-4', patientId: davidProfile.id, doctorId: drSarahProfile.id, testName: 'ECG Report', resultValue: 'Atrial fibrillation with controlled ventricular rate (72 bpm)', unit: 'bpm', referenceRange: '60-100 bpm', status: 'abnormal', orderedDate: daysAgo(20), resultDate: daysAgo(19), notes: 'Persistent AFib noted. Ventricular rate well-controlled.' } })

  // --- PRESCRIPTIONS ---
  await prisma.prescription.upsert({ where: { id: 'rx-alice-1' }, update: {}, create: { id: 'rx-alice-1', patientId: aliceProfile.id, doctorId: drSarahProfile.id, medicationName: 'Lisinopril 10mg', dosage: '10mg once daily', instructions: 'Take in the morning with water. Monitor blood pressure weekly.', issuedDate: daysAgo(90), expiryDate: daysFromNow(275), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-alice-2' }, update: {}, create: { id: 'rx-alice-2', patientId: aliceProfile.id, doctorId: drSarahProfile.id, medicationName: 'Amlodipine 5mg', dosage: '5mg once daily', instructions: 'Take at the same time each day. Report any ankle swelling.', issuedDate: daysAgo(90), expiryDate: daysFromNow(275), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-bob-1' }, update: {}, create: { id: 'rx-bob-1', patientId: bobProfile.id, doctorId: drJamesProfile.id, medicationName: 'Metformin 500mg', dosage: '500mg twice daily', instructions: 'Take with meals. Report any GI discomfort.', issuedDate: daysAgo(60), expiryDate: daysFromNow(305), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-bob-2' }, update: {}, create: { id: 'rx-bob-2', patientId: bobProfile.id, doctorId: drJamesProfile.id, medicationName: 'Atorvastatin 20mg', dosage: '20mg once nightly', instructions: 'Take at bedtime. Avoid grapefruit juice.', issuedDate: daysAgo(60), expiryDate: daysFromNow(305), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-carol-1' }, update: {}, create: { id: 'rx-carol-1', patientId: carolProfile.id, doctorId: drJamesProfile.id, medicationName: 'Omeprazole 20mg', dosage: '20mg once daily', instructions: 'Take 30 minutes before breakfast.', issuedDate: daysAgo(30), expiryDate: daysFromNow(335), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-david-1' }, update: {}, create: { id: 'rx-david-1', patientId: davidProfile.id, doctorId: drSarahProfile.id, medicationName: 'Warfarin 5mg', dosage: '5mg once daily', instructions: 'Take at the same time daily. Maintain consistent vitamin K intake. Report any unusual bleeding.', issuedDate: daysAgo(45), expiryDate: daysFromNow(320), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-david-2' }, update: {}, create: { id: 'rx-david-2', patientId: davidProfile.id, doctorId: drJamesProfile.id, medicationName: 'Levothyroxine 75mcg', dosage: '75mcg once daily', instructions: 'Take in the morning on empty stomach, 30-60 min before food.', issuedDate: daysAgo(45), expiryDate: daysFromNow(320), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-david-3' }, update: {}, create: { id: 'rx-david-3', patientId: davidProfile.id, doctorId: drJamesProfile.id, medicationName: 'Acetaminophen 500mg', dosage: '500mg up to 4 times daily PRN', instructions: 'For joint pain as needed. Do not exceed 3000mg per day.', issuedDate: daysAgo(30), expiryDate: daysFromNow(335), status: 'active' } })

  // --- BILLING ---
  await prisma.billing.upsert({ where: { id: 'bill-alice-1' }, update: {}, create: { id: 'bill-alice-1', patientId: aliceProfile.id, doctorId: drSarahProfile.id, appointmentId: apt1.id, description: 'Office visit - Quarterly BP check', amount: 150.00, status: 'paid', dueDate: daysAgo(30), paidDate: daysAgo(25) } })
  await prisma.billing.upsert({ where: { id: 'bill-alice-2' }, update: {}, create: { id: 'bill-alice-2', patientId: aliceProfile.id, doctorId: drSarahProfile.id, appointmentId: apt2.id, description: 'Comprehensive cardiac review + ECG', amount: 350.00, status: 'paid', dueDate: daysAgo(5), paidDate: daysAgo(3) } })
  await prisma.billing.upsert({ where: { id: 'bill-alice-3' }, update: {}, create: { id: 'bill-alice-3', patientId: aliceProfile.id, doctorId: drSarahProfile.id, description: 'Lab work - Lipid Panel + BMP', amount: 220.00, status: 'pending', dueDate: daysFromNow(15) } })

  await prisma.billing.upsert({ where: { id: 'bill-bob-1' }, update: {}, create: { id: 'bill-bob-1', patientId: bobProfile.id, doctorId: drJamesProfile.id, appointmentId: apt5.id, description: 'Office visit - Diabetes management', amount: 175.00, status: 'paid', dueDate: daysAgo(10), paidDate: daysAgo(8) } })
  await prisma.billing.upsert({ where: { id: 'bill-bob-2' }, update: {}, create: { id: 'bill-bob-2', patientId: bobProfile.id, doctorId: drJamesProfile.id, description: 'Lab work - HbA1c + Fasting Glucose + CMP', amount: 280.00, status: 'paid', dueDate: daysAgo(15), paidDate: daysAgo(10) } })
  await prisma.billing.upsert({ where: { id: 'bill-bob-3' }, update: {}, create: { id: 'bill-bob-3', patientId: bobProfile.id, doctorId: drJamesProfile.id, description: 'Annual wellness exam copay', amount: 50.00, status: 'paid', dueDate: daysAgo(45), paidDate: daysAgo(45) } })

  await prisma.billing.upsert({ where: { id: 'bill-david-1' }, update: {}, create: { id: 'bill-david-1', patientId: davidProfile.id, doctorId: drSarahProfile.id, appointmentId: apt8.id, description: 'Office visit - AFib evaluation + INR check', amount: 275.00, status: 'paid', dueDate: daysAgo(5), paidDate: daysAgo(2) } })
  await prisma.billing.upsert({ where: { id: 'bill-david-2' }, update: {}, create: { id: 'bill-david-2', patientId: davidProfile.id, doctorId: drSarahProfile.id, description: 'Lab work - INR/PT + ECG', amount: 310.00, status: 'pending', dueDate: daysFromNow(20) } })
  await prisma.billing.upsert({ where: { id: 'bill-david-3' }, update: {}, create: { id: 'bill-david-3', patientId: davidProfile.id, doctorId: drJamesProfile.id, description: 'Lab work - TSH + LFT', amount: 195.00, status: 'pending', dueDate: daysFromNow(25) } })

  // --- MESSAGES ---
  await prisma.message.upsert({ where: { id: 'msg-1' }, update: {}, create: { id: 'msg-1', senderId: alice.id, receiverId: drSarah.id, subject: 'Question about Lipid Panel results', body: 'Dr. Mitchell, I received my lipid panel results and noticed my LDL is elevated. Should I be concerned? Are there dietary changes I should make before our follow-up?', isRead: true, createdAt: daysAgo(12) } })
  await prisma.message.upsert({ where: { id: 'msg-2' }, update: {}, create: { id: 'msg-2', senderId: drSarah.id, receiverId: alice.id, subject: 'Re: Question about Lipid Panel results', body: 'Alice, yes your LDL is above optimal. I recommend reducing saturated fats and increasing fiber intake. We will discuss statin therapy during our upcoming telehealth appointment. In the meantime, try walking 30 minutes daily.', isRead: true, createdAt: daysAgo(11), parentId: 'msg-1' } })
  await prisma.message.upsert({ where: { id: 'msg-3' }, update: {}, create: { id: 'msg-3', senderId: bob.id, receiverId: drJames.id, subject: 'Metformin side effects', body: 'Dr. Okonkwo, I have been experiencing some GI discomfort after taking Metformin. Is this normal? Should I adjust when I take it?', isRead: true, createdAt: daysAgo(8) } })
  await prisma.message.upsert({ where: { id: 'msg-4' }, update: {}, create: { id: 'msg-4', senderId: drJames.id, receiverId: bob.id, subject: 'Re: Metformin side effects', body: 'Bob, GI discomfort is a common side effect. Try taking it in the middle of your meal rather than before. If symptoms persist for more than 2 weeks, we can discuss switching to extended-release Metformin.', isRead: false, createdAt: daysAgo(7), parentId: 'msg-3' } })
  await prisma.message.upsert({ where: { id: 'msg-5' }, update: {}, create: { id: 'msg-5', senderId: david.id, receiverId: drSarah.id, subject: 'INR home testing', body: 'Dr. Mitchell, I was wondering if home INR testing kits are reliable. It would save me trips to the lab. What do you recommend?', isRead: false, createdAt: daysAgo(3) } })

  // --- NOTIFICATIONS ---
  await prisma.notification.upsert({ where: { id: 'notif-1' }, update: {}, create: { id: 'notif-1', userId: alice.id, title: 'Upcoming Appointment', message: 'You have a telehealth appointment with Dr. Mitchell in 2 weeks.', type: 'appointment', isRead: false, link: '/patient/appointments' } })
  await prisma.notification.upsert({ where: { id: 'notif-2' }, update: {}, create: { id: 'notif-2', userId: alice.id, title: 'Lab Results Available', message: 'Your Lipid Panel results are now available.', type: 'lab', isRead: true, link: '/patient/lab-results' } })
  await prisma.notification.upsert({ where: { id: 'notif-3' }, update: {}, create: { id: 'notif-3', userId: bob.id, title: 'New Message', message: 'Dr. Okonkwo replied to your message about Metformin.', type: 'message', isRead: false, link: '/patient/messages' } })
  await prisma.notification.upsert({ where: { id: 'notif-4' }, update: {}, create: { id: 'notif-4', userId: david.id, title: 'Upcoming Appointment', message: 'You have an INR follow-up with Dr. Mitchell in 5 days.', type: 'appointment', isRead: false, link: '/patient/appointments' } })
  await prisma.notification.upsert({ where: { id: 'notif-5' }, update: {}, create: { id: 'notif-5', userId: david.id, title: 'Pending Bill', message: 'You have 2 pending bills totaling $505.00.', type: 'billing', isRead: false, link: '/patient/billing' } })
  await prisma.notification.upsert({ where: { id: 'notif-6' }, update: {}, create: { id: 'notif-6', userId: drSarah.id, title: 'New Message', message: 'David Chen sent you a message about INR home testing.', type: 'message', isRead: false, link: '/doctor/messages' } })
  await prisma.notification.upsert({ where: { id: 'notif-7' }, update: {}, create: { id: 'notif-7', userId: drSarah.id, title: 'Appointment Today', message: 'You have 2 appointments scheduled today.', type: 'appointment', isRead: false, link: '/doctor/appointments' } })

  // =====================================================
  // ADDITIONAL REALISTIC DATA (idempotent via upsert)
  // =====================================================

  // --- ADDITIONAL / PAST MEDICATIONS ---
  await prisma.medication.upsert({ where: { id: 'med-alice-3' }, update: {}, create: { id: 'med-alice-3', patientId: aliceProfile.id, name: 'Ferrous Sulfate', dosage: '325mg', frequency: 'Once daily', startDate: new Date('2020-03-25'), endDate: new Date('2020-09-25'), status: 'discontinued', prescribingDoctorId: drSarahProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-alice-4' }, update: {}, create: { id: 'med-alice-4', patientId: aliceProfile.id, name: 'Atorvastatin', dosage: '10mg', frequency: 'Once nightly', startDate: daysAgo(10), status: 'active', prescribingDoctorId: drSarahProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-bob-3' }, update: {}, create: { id: 'med-bob-3', patientId: bobProfile.id, name: 'Glipizide', dosage: '5mg', frequency: 'Once daily', startDate: new Date('2014-06-01'), endDate: new Date('2015-02-01'), status: 'discontinued', prescribingDoctorId: drJamesProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-bob-4' }, update: {}, create: { id: 'med-bob-4', patientId: bobProfile.id, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: new Date('2018-03-15'), status: 'active', prescribingDoctorId: drJamesProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-carol-3' }, update: {}, create: { id: 'med-carol-3', patientId: carolProfile.id, name: 'Fluticasone Inhaler', dosage: '110mcg', frequency: 'Twice daily', startDate: new Date('2021-04-01'), status: 'active', prescribingDoctorId: drJamesProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-carol-4' }, update: {}, create: { id: 'med-carol-4', patientId: carolProfile.id, name: 'Loratadine', dosage: '10mg', frequency: 'Once daily (seasonal)', startDate: new Date('2022-03-01'), status: 'active', prescribingDoctorId: drJamesProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-david-3' }, update: {}, create: { id: 'med-david-3', patientId: davidProfile.id, name: 'Digoxin', dosage: '0.125mg', frequency: 'Once daily', startDate: new Date('2016-11-10'), endDate: new Date('2018-05-01'), status: 'discontinued', prescribingDoctorId: drSarahProfile.id } })
  await prisma.medication.upsert({ where: { id: 'med-david-4' }, update: {}, create: { id: 'med-david-4', patientId: davidProfile.id, name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', startDate: new Date('2017-01-15'), status: 'active', prescribingDoctorId: drSarahProfile.id } })

  // --- ADDITIONAL ALLERGIES ---
  await prisma.allergy.upsert({ where: { id: 'al-bob-3' }, update: {}, create: { id: 'al-bob-3', patientId: bobProfile.id, allergen: 'Peanuts', reaction: 'Mild oral itching', severity: 'mild' } })
  await prisma.allergy.upsert({ where: { id: 'al-carol-3' }, update: {}, create: { id: 'al-carol-3', patientId: carolProfile.id, allergen: 'Pollen', reaction: 'Seasonal rhinitis, watery eyes', severity: 'moderate' } })
  await prisma.allergy.upsert({ where: { id: 'al-david-3' }, update: {}, create: { id: 'al-david-3', patientId: davidProfile.id, allergen: 'Contrast dye (iodinated)', reaction: 'Itching and flushing', severity: 'moderate' } })

  // --- ADDITIONAL MEDICAL HISTORY ---
  await prisma.medicalHistory.upsert({ where: { id: 'mh-alice-3' }, update: {}, create: { id: 'mh-alice-3', patientId: aliceProfile.id, condition: 'Seasonal Allergic Rhinitis', diagnosedDate: new Date('2016-04-10'), status: 'active', notes: 'Mild seasonal symptoms, managed conservatively', doctorId: drSarahProfile.id } })
  await prisma.medicalHistory.upsert({ where: { id: 'mh-bob-3' }, update: {}, create: { id: 'mh-bob-3', patientId: bobProfile.id, condition: 'Obesity (Class I)', diagnosedDate: new Date('2016-02-20'), status: 'active', notes: 'BMI 31.4. Enrolled in lifestyle and nutrition program.', doctorId: drJamesProfile.id } })
  await prisma.medicalHistory.upsert({ where: { id: 'mh-carol-3' }, update: {}, create: { id: 'mh-carol-3', patientId: carolProfile.id, condition: 'Iron-deficiency Anemia', diagnosedDate: new Date('2021-08-15'), status: 'resolved', notes: 'Resolved after 3 months of supplementation', doctorId: drJamesProfile.id } })
  await prisma.medicalHistory.upsert({ where: { id: 'mh-david-4' }, update: {}, create: { id: 'mh-david-4', patientId: davidProfile.id, condition: 'Benign Prostatic Hyperplasia', diagnosedDate: new Date('2020-10-05'), status: 'active', notes: 'Mild LUTS, monitored annually', doctorId: drJamesProfile.id } })

  // --- ADDITIONAL PAST APPOINTMENTS ---
  const apt9 = await prisma.appointment.upsert({ where: { id: 'apt-alice-5' }, update: {}, create: { id: 'apt-alice-5', patientId: aliceProfile.id, doctorId: drSarahProfile.id, dateTime: daysAgo(180), durationMinutes: 30, type: 'in-person', status: 'completed', reason: 'Initial hypertension consultation', notes: 'BP 142/90. Started Lisinopril. Lifestyle counseling provided.' } })
  await prisma.appointment.upsert({ where: { id: 'apt-alice-6' }, update: {}, create: { id: 'apt-alice-6', patientId: aliceProfile.id, doctorId: drSarahProfile.id, dateTime: daysAgo(120), durationMinutes: 30, type: 'telehealth', status: 'cancelled', reason: 'Medication review', notes: 'Patient rescheduled due to travel.' } })
  const apt10 = await prisma.appointment.upsert({ where: { id: 'apt-bob-4' }, update: {}, create: { id: 'apt-bob-4', patientId: bobProfile.id, doctorId: drJamesProfile.id, dateTime: daysAgo(90), durationMinutes: 45, type: 'in-person', status: 'completed', reason: 'Annual wellness exam', notes: 'Full physical. Weight 212 lbs. Referred to nutritionist.' } })
  const apt11 = await prisma.appointment.upsert({ where: { id: 'apt-carol-2' }, update: {}, create: { id: 'apt-carol-2', patientId: carolProfile.id, doctorId: drJamesProfile.id, dateTime: daysAgo(55), durationMinutes: 30, type: 'in-person', status: 'completed', reason: 'Asthma and reflux review', notes: 'Spirometry stable. Added Fluticasone for better control.' } })
  await prisma.appointment.upsert({ where: { id: 'apt-carol-3' }, update: {}, create: { id: 'apt-carol-3', patientId: carolProfile.id, doctorId: drJamesProfile.id, dateTime: daysFromNow(40), durationMinutes: 30, type: 'telehealth', status: 'scheduled', reason: 'Seasonal allergy follow-up' } })
  await prisma.appointment.upsert({ where: { id: 'apt-david-5' }, update: {}, create: { id: 'apt-david-5', patientId: davidProfile.id, doctorId: drSarahProfile.id, dateTime: daysAgo(100), durationMinutes: 45, type: 'in-person', status: 'completed', reason: 'Cardiology review', notes: 'Rate control optimized. Metoprolol continued.' } })

  // --- ADDITIONAL LAB RESULTS ---
  await prisma.labResult.upsert({ where: { id: 'lab-alice-4' }, update: {}, create: { id: 'lab-alice-4', patientId: aliceProfile.id, doctorId: drSarahProfile.id, testName: 'HbA1c', resultValue: '5.4', unit: '%', referenceRange: '<5.7', status: 'normal', orderedDate: daysAgo(15), resultDate: daysAgo(13), notes: 'No evidence of diabetes.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-alice-5' }, update: {}, create: { id: 'lab-alice-5', patientId: aliceProfile.id, doctorId: drSarahProfile.id, testName: 'TSH', resultValue: '2.1', unit: 'mIU/L', referenceRange: '0.4-4.0', status: 'normal', orderedDate: daysAgo(15), resultDate: daysAgo(13), notes: 'Thyroid function normal.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-bob-4' }, update: {}, create: { id: 'lab-bob-4', patientId: bobProfile.id, doctorId: drJamesProfile.id, testName: 'Lipid Panel', resultValue: 'TC: 198, LDL: 112, HDL: 41, TG: 225', unit: 'mg/dL', referenceRange: 'TC: <200, LDL: <100, HDL: >40, TG: <150', status: 'abnormal', orderedDate: daysAgo(30), resultDate: daysAgo(28), notes: 'Elevated triglycerides. Reinforce diet and continue statin.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-bob-5' }, update: {}, create: { id: 'lab-bob-5', patientId: bobProfile.id, doctorId: drJamesProfile.id, testName: 'Urine Microalbumin', resultValue: '18', unit: 'mg/g', referenceRange: '<30', status: 'normal', orderedDate: daysAgo(30), resultDate: daysAgo(27), notes: 'No diabetic nephropathy. Normal renal screening.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-carol-3' }, update: {}, create: { id: 'lab-carol-3', patientId: carolProfile.id, doctorId: drJamesProfile.id, testName: 'CBC Panel', resultValue: 'WBC: 7.2, RBC: 4.5, Hgb: 13.6, Plt: 268', unit: 'varies', referenceRange: 'WBC: 4.5-11.0, Hgb: 12-16, Plt: 150-400', status: 'normal', orderedDate: daysAgo(55), resultDate: daysAgo(53), notes: 'Hemoglobin normalized after iron therapy.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-carol-4' }, update: {}, create: { id: 'lab-carol-4', patientId: carolProfile.id, doctorId: drJamesProfile.id, testName: 'Vitamin D, 25-Hydroxy', resultValue: '22', unit: 'ng/mL', referenceRange: '30-100', status: 'abnormal', orderedDate: daysAgo(55), resultDate: daysAgo(52), notes: 'Vitamin D insufficiency. Supplementation recommended.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-carol-5' }, update: {}, create: { id: 'lab-carol-5', patientId: carolProfile.id, doctorId: drJamesProfile.id, testName: 'IgE Allergy Panel', resultValue: 'Elevated to dust mites and pollen', unit: 'kU/L', referenceRange: '<0.35 per allergen', status: 'abnormal', orderedDate: daysAgo(55), resultDate: daysAgo(50), notes: 'Confirms environmental allergen sensitivity.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-david-5' }, update: {}, create: { id: 'lab-david-5', patientId: davidProfile.id, doctorId: drJamesProfile.id, testName: 'CBC Panel', resultValue: 'WBC: 5.9, RBC: 4.4, Hgb: 14.2, Plt: 210', unit: 'varies', referenceRange: 'WBC: 4.5-11.0, Hgb: 13-17, Plt: 150-400', status: 'normal', orderedDate: daysAgo(25), resultDate: daysAgo(23), notes: 'No anemia or bleeding complications on Warfarin.' } })
  await prisma.labResult.upsert({ where: { id: 'lab-david-6' }, update: {}, create: { id: 'lab-david-6', patientId: davidProfile.id, doctorId: drSarahProfile.id, testName: 'INR/PT', resultValue: 'INR: 3.4, PT: 34.0s', unit: 'INR ratio / seconds', referenceRange: 'INR: 2.0-3.0 (target)', status: 'critical', orderedDate: daysAgo(40), resultDate: daysAgo(40), notes: 'INR above therapeutic range. Warfarin dose temporarily reduced and rechecked.' } })

  // --- ADDITIONAL PRESCRIPTIONS (incl. expired) ---
  await prisma.prescription.upsert({ where: { id: 'rx-alice-3' }, update: {}, create: { id: 'rx-alice-3', patientId: aliceProfile.id, doctorId: drSarahProfile.id, medicationName: 'Ferrous Sulfate 325mg', dosage: '325mg once daily', instructions: 'Take with vitamin C. Course completed.', issuedDate: new Date('2020-03-25'), expiryDate: new Date('2020-09-25'), status: 'expired' } })
  await prisma.prescription.upsert({ where: { id: 'rx-alice-4' }, update: {}, create: { id: 'rx-alice-4', patientId: aliceProfile.id, doctorId: drSarahProfile.id, medicationName: 'Atorvastatin 10mg', dosage: '10mg once nightly', instructions: 'Newly started for elevated LDL. Take at bedtime.', issuedDate: daysAgo(10), expiryDate: daysFromNow(355), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-bob-3' }, update: {}, create: { id: 'rx-bob-3', patientId: bobProfile.id, doctorId: drJamesProfile.id, medicationName: 'Lisinopril 10mg', dosage: '10mg once daily', instructions: 'For blood pressure. Take in the morning.', issuedDate: daysAgo(60), expiryDate: daysFromNow(305), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-carol-2' }, update: {}, create: { id: 'rx-carol-2', patientId: carolProfile.id, doctorId: drJamesProfile.id, medicationName: 'Albuterol Inhaler 90mcg', dosage: '2 puffs as needed', instructions: 'Use for acute shortness of breath. Rinse mouth after use.', issuedDate: daysAgo(55), expiryDate: daysFromNow(310), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-carol-3' }, update: {}, create: { id: 'rx-carol-3', patientId: carolProfile.id, doctorId: drJamesProfile.id, medicationName: 'Fluticasone Inhaler 110mcg', dosage: '1 puff twice daily', instructions: 'Daily controller. Do not stop abruptly.', issuedDate: daysAgo(55), expiryDate: daysFromNow(310), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-carol-4' }, update: {}, create: { id: 'rx-carol-4', patientId: carolProfile.id, doctorId: drJamesProfile.id, medicationName: 'Vitamin D3 2000 IU', dosage: '2000 IU once daily', instructions: 'For vitamin D insufficiency. Take with a meal.', issuedDate: daysAgo(50), expiryDate: daysFromNow(315), status: 'active' } })
  await prisma.prescription.upsert({ where: { id: 'rx-david-4' }, update: {}, create: { id: 'rx-david-4', patientId: davidProfile.id, doctorId: drSarahProfile.id, medicationName: 'Metoprolol 50mg', dosage: '50mg twice daily', instructions: 'For heart rate control. Do not skip doses.', issuedDate: daysAgo(45), expiryDate: daysFromNow(320), status: 'active' } })

  // --- MEDICAL DOCUMENTS ---
  await prisma.medicalDocument.upsert({ where: { id: 'doc-alice-1' }, update: {}, create: { id: 'doc-alice-1', patientId: aliceProfile.id, doctorId: drSarahProfile.id, title: 'Echocardiogram Summary', type: 'imaging', uploadedAt: daysAgo(15), notes: 'Normal left ventricular function, ejection fraction 60%.' } })
  await prisma.medicalDocument.upsert({ where: { id: 'doc-alice-2' }, update: {}, create: { id: 'doc-alice-2', patientId: aliceProfile.id, doctorId: drSarahProfile.id, title: '12-Lead ECG Report', type: 'report', uploadedAt: daysAgo(15), notes: 'Normal sinus rhythm.' } })
  await prisma.medicalDocument.upsert({ where: { id: 'doc-bob-1' }, update: {}, create: { id: 'doc-bob-1', patientId: bobProfile.id, doctorId: drJamesProfile.id, title: 'Diabetic Retinopathy Screening', type: 'report', uploadedAt: daysAgo(90), notes: 'No retinopathy detected. Repeat in 12 months.' } })
  await prisma.medicalDocument.upsert({ where: { id: 'doc-bob-2' }, update: {}, create: { id: 'doc-bob-2', patientId: bobProfile.id, doctorId: drJamesProfile.id, title: 'Diabetic Foot Examination', type: 'report', uploadedAt: daysAgo(90), notes: 'Normal sensation and pulses. Low risk.' } })
  await prisma.medicalDocument.upsert({ where: { id: 'doc-carol-1' }, update: {}, create: { id: 'doc-carol-1', patientId: carolProfile.id, doctorId: drJamesProfile.id, title: 'Chest X-Ray Report', type: 'imaging', uploadedAt: daysAgo(55), notes: 'Clear lung fields. No acute findings.' } })
  await prisma.medicalDocument.upsert({ where: { id: 'doc-david-1' }, update: {}, create: { id: 'doc-david-1', patientId: davidProfile.id, doctorId: drSarahProfile.id, title: 'Holter Monitor Report (24h)', type: 'report', uploadedAt: daysAgo(20), notes: 'Atrial fibrillation with controlled rate. No pauses.' } })
  await prisma.medicalDocument.upsert({ where: { id: 'doc-david-2' }, update: {}, create: { id: 'doc-david-2', patientId: davidProfile.id, doctorId: drJamesProfile.id, title: 'Bilateral Knee X-Ray', type: 'imaging', uploadedAt: daysAgo(100), notes: 'Moderate osteoarthritic changes, medial compartment.' } })

  // --- ADDITIONAL BILLING (incl. overdue) ---
  await prisma.billing.upsert({ where: { id: 'bill-alice-4' }, update: {}, create: { id: 'bill-alice-4', patientId: aliceProfile.id, doctorId: drSarahProfile.id, appointmentId: apt9.id, description: 'Initial hypertension consultation', amount: 200.00, status: 'paid', dueDate: daysAgo(150), paidDate: daysAgo(145) } })
  await prisma.billing.upsert({ where: { id: 'bill-bob-4' }, update: {}, create: { id: 'bill-bob-4', patientId: bobProfile.id, doctorId: drJamesProfile.id, appointmentId: apt10.id, description: 'Annual wellness exam', amount: 225.00, status: 'overdue', dueDate: daysAgo(20) } })
  await prisma.billing.upsert({ where: { id: 'bill-carol-1' }, update: {}, create: { id: 'bill-carol-1', patientId: carolProfile.id, doctorId: drJamesProfile.id, appointmentId: apt11.id, description: 'Office visit - Asthma and reflux review', amount: 165.00, status: 'paid', dueDate: daysAgo(40), paidDate: daysAgo(38) } })
  await prisma.billing.upsert({ where: { id: 'bill-carol-2' }, update: {}, create: { id: 'bill-carol-2', patientId: carolProfile.id, doctorId: drJamesProfile.id, description: 'Lab work - CBC + Vitamin D + IgE Allergy Panel', amount: 240.00, status: 'pending', dueDate: daysFromNow(12) } })
  await prisma.billing.upsert({ where: { id: 'bill-carol-3' }, update: {}, create: { id: 'bill-carol-3', patientId: carolProfile.id, doctorId: drJamesProfile.id, description: 'Spirometry test', amount: 110.00, status: 'overdue', dueDate: daysAgo(10) } })

  // --- ADDITIONAL MESSAGE THREADS ---
  await prisma.message.upsert({ where: { id: 'msg-6' }, update: {}, create: { id: 'msg-6', senderId: carol.id, receiverId: drJames.id, subject: 'Allergy symptoms worsening', body: 'Dr. Okonkwo, my seasonal allergies have been worse this spring. The Loratadine helps a little but I still have congestion. Is there anything stronger I can try?', isRead: true, createdAt: daysAgo(6) } })
  await prisma.message.upsert({ where: { id: 'msg-7' }, update: {}, create: { id: 'msg-7', senderId: drJames.id, receiverId: carol.id, subject: 'Re: Allergy symptoms worsening', body: 'Carol, you can add a saline nasal rinse and we can try a nasal steroid spray. I will send a prescription if the congestion persists. Let us review at your follow-up.', isRead: false, createdAt: daysAgo(5), parentId: 'msg-6' } })
  await prisma.message.upsert({ where: { id: 'msg-8' }, update: {}, create: { id: 'msg-8', senderId: alice.id, receiverId: drSarah.id, subject: 'Statin side effects', body: 'Dr. Mitchell, since starting Atorvastatin I have had some mild muscle aches. Should I be worried?', isRead: false, createdAt: daysAgo(2) } })
  await prisma.message.upsert({ where: { id: 'msg-9' }, update: {}, create: { id: 'msg-9', senderId: david.id, receiverId: drJames.id, subject: 'Thyroid medication timing', body: 'Dr. Okonkwo, can I take my Levothyroxine with coffee, or does it need to be plain water only?', isRead: true, createdAt: daysAgo(9) } })

  // --- ADDITIONAL NOTIFICATIONS ---
  await prisma.notification.upsert({ where: { id: 'notif-8' }, update: {}, create: { id: 'notif-8', userId: carol.id, title: 'New Prescription', message: 'Dr. Okonkwo issued a new prescription: Vitamin D3 2000 IU.', type: 'prescription', isRead: false, link: '/patient/prescriptions' } })
  await prisma.notification.upsert({ where: { id: 'notif-9' }, update: {}, create: { id: 'notif-9', userId: carol.id, title: 'Overdue Bill', message: 'Your spirometry test bill of $110.00 is overdue.', type: 'billing', isRead: false, link: '/patient/billing' } })
  await prisma.notification.upsert({ where: { id: 'notif-10' }, update: {}, create: { id: 'notif-10', userId: carol.id, title: 'Upcoming Appointment', message: 'Annual checkup with Dr. Okonkwo in 10 days.', type: 'appointment', isRead: true, link: '/patient/appointments' } })
  await prisma.notification.upsert({ where: { id: 'notif-11' }, update: {}, create: { id: 'notif-11', userId: alice.id, title: 'New Prescription', message: 'Dr. Mitchell issued a new prescription: Atorvastatin 10mg.', type: 'prescription', isRead: false, link: '/patient/prescriptions' } })
  await prisma.notification.upsert({ where: { id: 'notif-12' }, update: {}, create: { id: 'notif-12', userId: bob.id, title: 'Overdue Bill', message: 'Your annual wellness exam bill of $225.00 is overdue.', type: 'billing', isRead: false, link: '/patient/billing' } })
  await prisma.notification.upsert({ where: { id: 'notif-13' }, update: {}, create: { id: 'notif-13', userId: drJames.id, title: 'New Message', message: 'Carol Williams sent you a message about allergy symptoms.', type: 'message', isRead: false, link: '/doctor/messages' } })
  await prisma.notification.upsert({ where: { id: 'notif-14' }, update: {}, create: { id: 'notif-14', userId: drSarah.id, title: 'Critical Lab Flag', message: 'David Chen had an elevated INR (3.4) flagged as critical.', type: 'lab', isRead: false, link: '/doctor/lab-results' } })

  // --- BULK SYNTHETIC DATA: 5 specialist doctors + 20 patients ---
  await seedBulk(
    prisma,
    { doctor: hash('Doctor@123'), patient: hash('Patient@123') },
    { sarah: { userId: drSarah.id, profileId: drSarahProfile.id }, james: { userId: drJames.id, profileId: drJamesProfile.id } },
  )

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
