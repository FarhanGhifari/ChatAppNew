import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase Configuration
// Firebase sudah otomatis terinisialisasi melalui google-services.json (Android)
// dan GoogleService-Info.plist (iOS)
export const firebaseConfig = {
  apiKey: "AIzaSyBCxyIXnmLVwN2vmVcwa8KgaMnJ5r249Ao",
  authDomain: "chatappnew-96231.firebaseapp.com",
  projectId: "chatappnew-96231",
  storageBucket: "chatappnew-96231.firebasestorage.app",
  messagingSenderId: "434945617744",
  appId: "1:434945617744:web:f9f429c469d98f5b894655",
  measurementId: "G-6VS5XT0WKV"
};

export { auth, firestore };

// Firestore Collections
export const messagesCollection = firestore().collection('messages');

// Helper functions untuk authentication
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Helper functions untuk Firestore
export const addDocument = async (collection: string, data: any) => {
  try {
    const docRef = await firestore().collection(collection).add(data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const getDocuments = async (collection: string) => {
  try {
    const snapshot = await firestore().collection(collection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};
