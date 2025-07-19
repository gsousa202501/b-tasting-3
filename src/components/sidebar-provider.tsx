import React, { createContext, useContext, useEffect, useState } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  setIsOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpenState] = useState(() => {
    // Always start closed on mobile, use localStorage for desktop persistence
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile) return false;
      
      const saved = localStorage.getItem('b-tasting-sidebar-state');
      return saved ? JSON.parse(saved) : true;
    }
    return false;
  });

  const [isCollapsed, setIsCollapsedState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('b-tasting-sidebar-collapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const setIsOpen = (open: boolean) => {
    setIsOpenState(open);
    // Only persist state on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      localStorage.setItem('b-tasting-sidebar-state', JSON.stringify(open));
    }
  };

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('b-tasting-sidebar-collapsed', JSON.stringify(collapsed));
    }
  };

  const toggle = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Handle window resize - close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isOpen) {
        setIsOpenState(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeof window !== 'undefined' && window.innerWidth < 768 && isOpen) {
        const sidebar = document.querySelector('[data-sidebar]');
        const target = event.target as Node;
        if (sidebar && !sidebar.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  return (
    <SidebarContext.Provider value={{ 
      isOpen, 
      isCollapsed, 
      setIsOpen, 
      setIsCollapsed, 
      toggle, 
      toggleCollapse 
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}