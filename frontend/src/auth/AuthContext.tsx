import {
  createContext,
  useState,
  useEffect,
} from "react";

import * as authApi from "../api/authApi";
import { tokenStorage } from "./token";

export interface User {
  id: number;
  email: string;
  nickname: string;
  gender: number;
  birth: string;
  height: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user:User | null;
  login: (data:authApi.LoginRequest)=> Promise<void>;

  logout: () => Promise<void>;
  signup: (data:authApi.SignupRequest) => Promise<void>
  refreshUser: () => Promise<void>
}


export const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] =useState(false);
    const [isLoading, setIsLoading] =useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function initialize() {

            if (!tokenStorage.isAuthenticated()) {
                setIsLoading(false);
            return;
            }

            try {
                setIsLoading(true);
                const me = await authApi.getMe();
                setUser(me);
                setIsAuthenticated(true);
            } catch {
                tokenStorage.clear();
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        }

        initialize();

        }, []);

    const login = async(data: authApi.LoginRequest) => {
            try {
                setIsLoading(true);
                const response = await authApi.login(data);
                
                tokenStorage.setTokens(response.access_token, response.refresh_token);

                const me = await authApi.getMe();
                setUser(me);
                setIsAuthenticated(true);

            } finally {
                setIsLoading(false);
            }
        };

    const logout = async () => {
        try {
            setIsLoading(true);
            const refresh =
            tokenStorage.getRefreshToken();

            if (refresh) {
                await authApi.logout(refresh);
            }

        } finally {
            tokenStorage.clear();
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };
    const signup = async(data:authApi.SignupRequest) => {
            try{
            setIsLoading(true);
            await authApi.signup(data);
            } finally {
                    setIsLoading(false);
                }
            }
    const refreshUser = async () => {
        const me = await authApi.getMe();
        setUser(me);
    }
    return (
    <AuthContext.Provider
        value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        signup,
        refreshUser
        }}
    >
        {children}
    </AuthContext.Provider>
    );
}