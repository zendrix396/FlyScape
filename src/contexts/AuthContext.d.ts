declare module '../contexts/AuthContext' {
  export interface UserProfile {
    uid?: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    walletBalance?: number;
    wallet?: number;
    [key: string]: any;
  }

  export interface AuthContextType {
    currentUser: any | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
    updateUserWallet: (amount: number) => Promise<void>;
  }

  export function useAuth(): AuthContextType;
  
  export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element;
} 