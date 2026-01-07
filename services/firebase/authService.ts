import { db } from '@/app/config/firebase';
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { User } from '../../types/firebase';

export const authService = {
    // Đăng ký
    register: async (email: string, password: string, name: string): Promise<User> => {
        try {
            // Tạo user trong Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update profile
            await updateProfile(firebaseUser, { displayName: name });

            // Tạo user document trong Firestore
            const userData: Omit<User, 'id'> = {
                email,
                name,
                createdAt: new Date()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), userData);

            return {
                id: firebaseUser.uid,
                ...userData
            };
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    },

    // Đăng nhập
    login: async (email: string, password: string): Promise<User> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Trả về user data (trong thực tế cần lấy từ Firestore)
            return {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || 'User',
                createdAt: new Date()
            };
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    // Đăng xuất
    logout: async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },

    // Quên mật khẩu
    forgotPassword: async (email: string): Promise<void> => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Error sending reset email:', error);
            throw error;
        }
    }
};