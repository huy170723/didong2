import { auth, db } from '@/app/config/firebase';
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
    register: async (email: string, password: string, name: string): Promise<User> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName: name });

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
    },

    login: async (email: string, password: string): Promise<User> => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        return {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || 'User',
            createdAt: new Date()
        };
    },

    logout: async (): Promise<void> => {
        await signOut(auth);
    },

    forgotPassword: async (email: string): Promise<void> => {
        await sendPasswordResetEmail(auth, email);
    }
};
