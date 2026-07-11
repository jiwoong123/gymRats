import {
  createContext,
  useState,
  useEffect,
} from "react";

import * as authApi from "../api/authApi";
import { tokenStorage } from "./token";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;

  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    nickname: string,
    gender: number,
    birth: string, // YYYY-MM-DD
    height: number,) => Promise<void>
}


export const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] =useState(false);
    const [isLoading, setIsLoading] =useState(false);

    useEffect(() => {
        setIsAuthenticated(
            tokenStorage.isAuthenticated()
        );
    }, []);

    const login = async(
        email:string,
        password: string,
        ) => {
            try {
                setIsLoading(true);
                const response = await authApi.login({email, password,});
                
                tokenStorage.setTokens(response.access_token, response.refresh_token);

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
            setIsLoading(false);
            tokenStorage.clear();

            setIsAuthenticated(false);
        }
    };
    const signup = async( 
        email: string,
        password: string,
        nickname: string,
        gender: number,
        birth: string, // YYYY-MM-DD
        height: number,
        ) => {
            try{
            setIsLoading(true);
            await authApi.signup({
                email,
                password,
                nickname,
                gender,
                birth,
                height: Number(height),
                });
            } finally {
                    setIsLoading(false);
                }
            }
    return (
    <AuthContext.Provider
        value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        signup
        }}
    >
        {children}
    </AuthContext.Provider>
    );
}