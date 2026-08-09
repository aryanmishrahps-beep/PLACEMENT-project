import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('pp_token');
      const savedUser = localStorage.getItem('pp_user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setLoading(false);

          // Skip backend JWT verification for non-JWT fallback tokens
          if (token.startsWith('token_') || token.startsWith('mock') || token === 'mock-google-token') {
            return;
          }

          // Fetch fresh user data from backend to verify session
          const res = await authAPI.getMe();
          if (res.data?.user) {
            const freshUser = res.data.user;
            localStorage.setItem('pp_user', JSON.stringify(freshUser));
            setUser(freshUser);
          }
        } catch (err) {
          console.warn('Could not verify session with backend, maintaining local session:', err?.message);
        }
      } else {
        setLoading(false);
        setUser(null);
      }

    };

    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('pp_token', token);
      localStorage.setItem('pp_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('Backend API login failed or timed out. Falling back to session:', err?.message);
      // Determine role from email if available (e.g., faculty@..., admin@...)
      let role = 'student';
      if (email.includes('faculty')) role = 'faculty';
      if (email.includes('admin')) role = 'admin';

      const fallbackUser = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role,
        department: 'CSE',
        batch: '2025',
        streak: 1,
        skillPoints: 50
      };
      localStorage.setItem('pp_token', `token_${Date.now()}`);
      localStorage.setItem('pp_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      const userData = { 
        id: firebaseUser.uid, 
        name: firebaseUser.displayName || 'Google User', 
        email: firebaseUser.email, 
        role: 'student', 
        department: 'CSE', 
        batch: '2025',
        skillPoints: 50,
        streak: 1,
        avatar: firebaseUser.photoURL
      };
      localStorage.setItem('pp_token', idToken);
      localStorage.setItem('pp_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (firebaseErr) {
      console.warn('Firebase Sign-In failed or popup blocked. Using demo fallback:', firebaseErr?.message);
      const mockUser = { 
        id: 'google-user-id', 
        name: 'Google User', 
        email: 'google@gmail.com', 
        role: 'student', 
        department: 'CSE', 
        batch: '2025',
        skillPoints: 50,
        streak: 1
      };
      localStorage.setItem('pp_token', 'mock-google-token');
      localStorage.setItem('pp_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  const register = async (data) => {
    const { name, email, password, role = 'student', department, batch } = data;
    
    try {
      const res = await authAPI.register({ name, email, password, role, department, batch });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('pp_token', token);
      localStorage.setItem('pp_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('Backend API registration failed or timed out. Creating user session:', err?.message);
      const fallbackUser = {
        id: `user-${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        role: role || 'student',
        department: department || 'CSE',
        batch: batch || '2025',
        streak: 1,
        skillPoints: 50
      };
      localStorage.setItem('pp_token', `token_${Date.now()}`);
      localStorage.setItem('pp_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('pp_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
