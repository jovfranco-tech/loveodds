import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const apiKey = process.env.VITE_FIREBASE_API_KEY || (import.meta as any).env?.VITE_FIREBASE_API_KEY;
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || (import.meta as any).env?.VITE_FIREBASE_APP_ID
};

console.log("Firebase config loaded for project ID:", firebaseConfig.projectId);

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Error: Missing Firebase credentials. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment or .env.local file.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const baselineCalibrations = {
  basePopulations: {
    CDMX: { Mujer: 3980000, Hombre: 3420000, Persona: 7400000 },
    ZMVM: { Mujer: 9400000, Hombre: 8750000, Persona: 18150000 },
    Nacional: { Mujer: 51200000, Hombre: 47800000, Persona: 99000000 }
  },
  maritalStatus: {
    "Soltero": 0.36,
    "Soltera": 0.36,
    "Divorciado": 0.06,
    "Divorciada": 0.06,
    "Soltero+Divorciado": 0.42,
    "Soltera+Divorciada": 0.42
  },
  children: {
    "Sin hijos": 0.42,
    "Con hijos": 0.58
  },
  nationality: {
    "EEUU": 0.008,
    "Colombia": 0.004,
    "Argentina": 0.003,
    "Venezuela": 0.005,
    "México": 0.985,
    "default": 0.004
  },
  income: [
    { limit: 15000, ratio: 0.55 },
    { limit: 30000, ratio: 0.28 },
    { limit: 50000, ratio: 0.12 },
    { limit: 80000, ratio: 0.045 },
    { limit: 100000, ratio: 0.022 },
    { limit: 150000, ratio: 0.009 },
    { limit: null, ratio: 0.004 }
  ],
  height: {
    "Mujer": { mean: 157, stdDev: 6 },
    "Hombre": { mean: 169, stdDev: 7 },
    "Persona": { mean: 163, stdDev: 8 }
  },
  education: {
    "Licenciatura+": 0.34,
    "Posgrado+": 0.06,
    "Bachillerato+": 0.70
  },
  lifestyle: {
    "Fitness": 0.25,
    "Deportista": 0.08
  },
  complexion: {
    "Delgada/Normal": 0.25,
    "Atlética": 0.15,
    "Robusta": 0.75
  },
  updatedAt: new Date().toISOString()
};

async function sync() {
  try {
    console.log("Uploading baseline calibrations to Firestore at 'calibrations/mx_v1'...");
    await setDoc(doc(db, "calibrations", "mx_v1"), baselineCalibrations);
    console.log("Success! Baseline calibrations successfully synced to Firestore.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to sync calibrations:", error);
    process.exit(1);
  }
}

sync();
