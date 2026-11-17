const env=import.meta.env;
// Public Firebase Web app identifiers. Authorization is enforced by Firestore rules.
// Environment variables can target another project without editing source.
export const firebaseConfig={apiKey:env.VITE_FIREBASE_API_KEY??'AIzaSyDFTPcqoeCTwm7-YUJ7a_T0RekTDV0-jWI',authDomain:env.VITE_FIREBASE_AUTH_DOMAIN??'devpath-e0b3c.firebaseapp.com',projectId:env.VITE_FIREBASE_PROJECT_ID??'devpath-e0b3c',appId:env.VITE_FIREBASE_APP_ID??'1:624308802056:web:35a2cba4915f99198b37bd'};
export const firebaseConfigured=Object.values(firebaseConfig).every(value=>typeof value==='string'&&value.trim()!==''&&!value.startsWith('YOUR_'));
