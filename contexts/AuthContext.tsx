import { auth, db } from '@/config/firebase';
import {
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  uid: string;
  email: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  address?: string | null;
  createdAt: Date;
  lastLogin: Date;
  role?: 'user' | 'admin' | 'seller';
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  // HÀM MỚI
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string, currentUser?: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        const newUserData: UserData = {
          uid: userId,
          email: currentUser?.email || null,
          displayName: currentUser?.displayName || null,
          photoURL: currentUser?.photoURL || null,
          createdAt: new Date(),
          lastLogin: new Date(),
          role: 'user'
        };
        await setDoc(doc(db, 'users', userId), newUserData);
        setUserData(newUserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid, currentUser);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await updateDoc(doc(db, 'users', userCredential.user.uid), { lastLogin: new Date() });
    await fetchUserData(userCredential.user.uid, userCredential.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    const data: UserData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name,
      createdAt: new Date(),
      lastLogin: new Date(),
      role: 'user'
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), data);
    setUserData(data);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      // Merge: true để giữ lại các trường dữ liệu cũ không nằm trong data mới
      await setDoc(userRef, data, { merge: true });
      await fetchUserData(user.uid, user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!user) return;
    await updateProfile(user, data);
    await updateUserData(data);
  };

  // HÀM ĐỔI MẬT KHẨU MỚI
  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error("User not authenticated");

    try {
      // 1. Tạo credential từ email và mật khẩu cũ của người dùng
      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      // 2. Xác thực lại người dùng (Bắt buộc để đổi mật khẩu/email)
      await reauthenticateWithCredential(user, credential);

      // 3. Tiến hành cập nhật mật khẩu mới
      await updatePassword(user, newPassword);

      console.log("Password updated successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      login,
      register,
      logout,
      updateUserProfile,
      updateUserData,
      resetPassword,
      changePassword // Export hàm mới
    }}>
      {children}
    </AuthContext.Provider>
  );
};