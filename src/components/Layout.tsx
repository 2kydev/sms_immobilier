
import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppSidebar } from './AppSidebar';
import { useAuth } from './auth/AuthProvider';
import { LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Layout = ({ children, activeSection, onSectionChange }: LayoutProps) => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

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
            <div className="flex items-center gap-4">
              {profile && (
                <>
                  <div className="text-right">
                    <span className="text-sm font-medium">{profile.prenom} {profile.nom}</span>
                    <div className="text-xs text-gray-500 capitalize">{profile.role}</div>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {profile.prenom?.[0]}{profile.nom?.[0]}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-red-600 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="ml-2">Déconnexion</span>
                  </Button>
                </>
              )}
            </div>
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
