import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, get } from 'firebase/database';
import { database } from '../firebase';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Sign up function
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Login function
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout function
  function logout() {
    return signOut(auth);
  }

  // Reset password function
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Check if user is an admin
  const checkAdminStatus = async (userId) => {
    try {
      const adminRef = dbRef(database, `admins/${userId}`);
      const snapshot = await get(adminRef);
      return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if the user is an admin
        const adminStatus = await checkAdminStatus(user.uid);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Function to update user profile picture
  async function updateProfilePicture(file) {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      // Create a reference to the file location in Firebase Storage
      const fileRef = storageRef(storage, `profile-pictures/${currentUser.uid}/${file.name}`);
      
      // Upload the file
      await uploadBytes(fileRef, file);
      
      // Get the download URL
      const photoURL = await getDownloadURL(fileRef);
      
      // Update the user's profile
      await updateProfile(currentUser, { photoURL });
      
      // Update the local user object
      setCurrentUser({ ...currentUser, photoURL });
      
      return photoURL;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }

  // Context value
  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateProfilePicture,
    isAdmin,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
