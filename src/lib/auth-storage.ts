const AUTH_TOKEN_KEY = 'b-tasting-auth-token';
const REFRESH_TOKEN_KEY = 'b-tasting-refresh-token';
const USER_DATA_KEY = 'b-tasting-user-data';
const REMEMBER_ME_KEY = 'b-tasting-remember-me';

export const authStorage = {
  // Token management
  getToken: (): string | null => {
    try {
      return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  setToken: (token: string, rememberMe: boolean = false): void => {
    try {
      if (rememberMe) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      } else {
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  },

  removeToken: (): void => {
    try {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  },

  // Refresh token management
  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  setRefreshToken: (token: string): void => {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },

  removeRefreshToken: (): void => {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing refresh token:', error);
    }
  },

  // User data management
  getUserData: (): any => {
    try {
      const userData = sessionStorage.getItem(USER_DATA_KEY) || localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  setUserData: (userData: any, rememberMe: boolean = false): void => {
    try {
      const dataString = JSON.stringify(userData);
      if (rememberMe || localStorage.getItem(REMEMBER_ME_KEY)) {
        localStorage.setItem(USER_DATA_KEY, dataString);
      } else {
        sessionStorage.setItem(USER_DATA_KEY, dataString);
      }
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  },

  removeUserData: (): void => {
    try {
      sessionStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },

  // Clear all auth data
  clearAll: (): void => {
    authStorage.removeToken();
    authStorage.removeRefreshToken();
    authStorage.removeUserData();
  },

  // Check if remember me is enabled
  isRememberMeEnabled: (): boolean => {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }
};