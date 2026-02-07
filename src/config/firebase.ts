
import admin from 'firebase-admin';

let initialized = false;

export const initFirebase = () => {
    if (initialized) return;

    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Vercel / Cloud Environment Variable Approach
            // The entire JSON content is stored in an env var
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('✅ Firebase Admin initialized with env var');
                initialized = true;
                return;
            } catch (e) {
                console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
            }
        }

        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Local Development / Traditional Server Approach
            // Path to JSON file
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log('✅ Firebase Admin initialized with file path');
            initialized = true;
        } else {
            console.warn('⚠️ WARNING: No Firebase credentials found (FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS). Push notifications will not work.');
        }
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error);
    }
};

export const getMessaging = () => {
    if (!initialized) initFirebase();
    return admin.messaging();
};
