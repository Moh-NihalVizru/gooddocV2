/**
 * Authentication utility for GoodDoc
 * Demo credentials handling with localStorage session management
 * 
 * SECURITY NOTE: Demo credentials (gooddoc/123456) are for development only.
 * Set VITE_AUTH_DEMO=false in production to disable.
 */

const SESSION_KEY = 'gooddoc_session';
const USERS_KEY = 'gooddoc_users';

export interface User {
  username: string;
  email?: string;
  fullName?: string;
}

export interface StoredUser extends User {
  password: string;
}

interface Session {
  user: User;
  expiresAt: number;
}

// Demo mode check - defaults to true for development
const isDemoMode = (): boolean => {
  return import.meta.env.VITE_AUTH_DEMO !== 'false';
};

// Demo credentials
const DEMO_USER: StoredUser = {
  username: 'gooddoc',
  password: '123456',
  fullName: 'GoodDoc Admin',
  email: 'admin@gooddoc.com',
};

// Get stored users from localStorage
const getStoredUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save users to localStorage
const saveStoredUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Validate login credentials
export const validateCredentials = (
  username: string,
  password: string
): { success: boolean; user?: User; error?: string } => {
  // Check demo credentials if demo mode is enabled
  if (isDemoMode() && username === DEMO_USER.username && password === DEMO_USER.password) {
    return {
      success: true,
      user: {
        username: DEMO_USER.username,
        fullName: DEMO_USER.fullName,
        email: DEMO_USER.email,
      },
    };
  }

  // Check stored users
  const users = getStoredUsers();
  const foundUser = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (foundUser) {
    return {
      success: true,
      user: {
        username: foundUser.username,
        fullName: foundUser.fullName,
        email: foundUser.email,
      },
    };
  }

  return {
    success: false,
    error: 'Invalid username or password',
  };
};

// Register a new user
export const registerUser = (
  fullName: string,
  email: string,
  password: string
): { success: boolean; user?: User; error?: string } => {
  const users = getStoredUsers();
  
  // Use email as username for simplicity
  const username = email.split('@')[0];

  // Check if user already exists
  if (users.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
    return {
      success: false,
      error: 'An account with this email already exists',
    };
  }

  // Prevent overwriting demo account
  if (isDemoMode() && username.toLowerCase() === DEMO_USER.username) {
    return {
      success: false,
      error: 'This username is reserved',
    };
  }

  const newUser: StoredUser = {
    username,
    email,
    fullName,
    password,
  };

  users.push(newUser);
  saveStoredUsers(users);

  return {
    success: true,
    user: {
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
    },
  };
};

// Create session
export const createSession = (user: User): void => {
  const session: Session = {
    user,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

// Get current session
export const getSession = (): Session | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: Session = JSON.parse(stored);
    
    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const session = getSession();
  return session?.user || null;
};

// Logout
export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

// Validation helpers
export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateFullName = (name: string): string | null => {
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return null;
};
