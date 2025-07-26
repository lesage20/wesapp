import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, WeSappCode } from '~/hooks/types';

// Type guards pour vérifier les types de données
export function isWeSappCode(data: any): data is WeSappCode {
  return data && 
         typeof data.id === 'string' &&
         typeof data.code === 'string' &&
         typeof data.bio === 'string' &&
         typeof data.username === 'string' &&
         data.user !== undefined;
}

export function isUser(data: any): data is User {
  return data && 
         typeof data.id === 'string' &&
         typeof data.phoneNumber === 'string' &&
         typeof data.username === 'string' &&
         !('code' in data); // User n'a pas de propriété 'code'
}

export interface AuthState {
  isAuthenticated: boolean;
  user: WeSappCode | null;          // Profile complet (WeSappCode)
  userData: User | null;            // Données utilisateur basiques
  login: (data: WeSappCode | User) => void;  // Fonction polymorphe
  logout: () => void;
  updateProfile: (updates: Partial<WeSappCode>) => void;
  updateUserData: (updates: Partial<User>) => void;
}

export interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      userData: null,
      login: (data) => {
        if (isWeSappCode(data)) {
          set({ isAuthenticated: true, user: data });
          console.log('Profile WeSappCode sauvegardé:', data);
        } else if (isUser(data)) {
          set({ isAuthenticated: true, userData: data });
          console.log('Données User sauvegardées:', data);
        } else {
          console.error('Type de données non reconnu pour login:', data);
        }
      },
      logout: () => set({ isAuthenticated: false, user: null, userData: null }),
      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      updateUserData: (updates) =>
        set((state) => ({
          userData: state.userData ? { ...state.userData, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));
