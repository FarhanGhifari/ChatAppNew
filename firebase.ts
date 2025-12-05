import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase Configuration
// Firebase sudah otomatis terinisialisasi melalui google-services.json (Android)
// dan GoogleService-Info.plist (iOS)
export const firebaseConfig = {
  apiKey: "AIzaSyDZl3-DtPy6RyDHLE-VsMTimNQjG95V7tc",
  authDomain: "chatappnew-581a3.firebaseapp.com",
  projectId: "chatappnew-581a3",
  storageBucket: "chatappnew-581a3.firebasestorage.app",
  messagingSenderId: "874368505292",
  appId: "1:874368505292:web:caff4f9cdd523c381f3969",
  measurementId: "G-LF355DCZGN"
};

export { auth, firestore };

// Firestore Collections
export const messagesCollection = firestore().collection('messages');
export const usersCollection = firestore().collection('users');

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

export const signUp = async (email: string, password: string, username: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Save username to Firestore
    await usersCollection.doc(user.uid).set({
      username: username,
      email: email,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Helper to get username by uid
export const getUsernameByUid = async (uid: string): Promise<string> => {
  try {
    const doc = await usersCollection.doc(uid).get();
    if (doc.exists) {
      return doc.data()?.username || 'Unknown';
    }
    return 'Unknown';
  } catch (error) {
    console.error('Error getting username:', error);
    return 'Unknown';
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
