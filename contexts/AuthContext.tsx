import { auth, db } from '@/app/config/firebase'; // Import từ file đã sửa
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  uid: string;
  email: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
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
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user từ Firestore
  const fetchUserData = async (userId: string, currentUser?: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        // Nếu chưa có document, tạo mới
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

  // Theo dõi trạng thái đăng nhập
  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.email);
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

  // Đăng nhập
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');

    try {
      console.log('Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Cập nhật last login
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date()
      }, { merge: true });

      await fetchUserData(userCredential.user.uid, userCredential.user);

      console.log('Login successful:', userCredential.user.email);
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Đăng nhập thất bại';

      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Email không hợp lệ';
          break;
        case 'auth/user-disabled':
          message = 'Tài khoản đã bị vô hiệu hóa';
          break;
        case 'auth/user-not-found':
          message = 'Tài khoản không tồn tại';
          break;
        case 'auth/wrong-password':
          message = 'Mật khẩu không đúng';
          break;
        case 'auth/too-many-requests':
          message = 'Quá nhiều lần thử. Vui lòng thử lại sau';
          break;
        default:
          message = error.message || 'Đăng nhập thất bại';
      }

      throw new Error(message);
    }
  };

  // Đăng ký
  const register = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    if (!db) throw new Error('Firebase firestore is not initialized');

    try {
      console.log('Attempting register for:', email);

      // Tạo user trong Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Cập nhật display name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Tạo document trong Firestore
      const userData: UserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        phoneNumber: userCredential.user.phoneNumber || null,
        photoURL: userCredential.user.photoURL || null,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: 'user'
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      setUserData(userData);
      setUser(userCredential.user);

      console.log('Register successful:', userCredential.user.email);
    } catch (error: any) {
      console.error('Register error:', error);
      let message = 'Đăng ký thất bại';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email đã được sử dụng';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ';
          break;
        case 'auth/operation-not-allowed':
          message = 'Phương thức đăng ký không được hỗ trợ';
          break;
        case 'auth/weak-password':
          message = 'Mật khẩu quá yếu (ít nhất 6 ký tự)';
          break;
        default:
          message = error.message || 'Đăng ký thất bại';
      }

      throw new Error(message);
    }
  };

  // Đăng xuất
  const logout = async () => {
    if (!auth) throw new Error('Firebase auth is not initialized');

    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Cập nhật thông tin user
  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!auth || !user) throw new Error('Chưa đăng nhập hoặc Firebase chưa khởi tạo');

    try {
      await updateProfile(user, data);

      // Cập nhật trong Firestore
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });

      // Refresh user data
      await fetchUserData(user.uid, user);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Reset mật khẩu
  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      let message = 'Gửi email reset mật khẩu thất bại';

      if (error.code === 'auth/user-not-found') {
        message = 'Email không tồn tại';
      }

      throw new Error(message);
    }
  };

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};