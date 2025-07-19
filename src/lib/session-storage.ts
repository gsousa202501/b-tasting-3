import { SessionFormData } from '@/types';

const SESSION_FORM_KEY = 'b-tasting-session-form';
const SIDEBAR_STATE_KEY = 'b-tasting-sidebar-state';

export const sessionStorage = {
  saveSessionForm: (data: Partial<SessionFormData>) => {
    try {
      const existing = sessionStorage.getSessionForm();
      const merged = { ...existing, ...data };
      window.sessionStorage.setItem(SESSION_FORM_KEY, JSON.stringify(merged));
    } catch (error) {
      console.error('Error saving session form data:', error);
    }
  },

  getSessionForm: (): Partial<SessionFormData> => {
    try {
      const data = window.sessionStorage.getItem(SESSION_FORM_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting session form data:', error);
      return {};
    }
  },

  clearSessionForm: () => {
    try {
      window.sessionStorage.removeItem(SESSION_FORM_KEY);
    } catch (error) {
      console.error('Error clearing session form data:', error);
    }
  },

  saveSidebarState: (isOpen: boolean) => {
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isOpen));
    } catch (error) {
      console.error('Error saving sidebar state:', error);
    }
  },

  getSidebarState: (): boolean => {
    try {
      const data = window.localStorage.getItem(SIDEBAR_STATE_KEY);
      return data ? JSON.parse(data) : true;
    } catch (error) {
      console.error('Error getting sidebar state:', error);
      return true;
    }
  },
};