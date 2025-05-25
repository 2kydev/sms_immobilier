
import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import UserMenu from './UserMenu';

interface LayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Layout = ({ children, activeSection, onSectionChange }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar activeSection={activeSection} onSectionChange={onSectionChange} />
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-primary">CRM Immobilier</h1>
            </div>
            <UserMenu />
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
