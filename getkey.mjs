import { readFileSync } from 'fs';
const s = JSON.parse(readFileSync('./pyap-7cb31-firebase-adminsdk-fbsvc-cdc1a0a912.json', 'utf8'));
console.log('FIREBASE_PRIVATE_KEY="' + s.private_key.replace(/\n/g, '\\n') + '"');