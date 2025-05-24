
import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Layout = ({ children, activeSection, onSectionChange }: LayoutProps) => {
  const { profile, signOut } = useAuth();

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      admin: 'Administrateur',
      directeur: 'Directeur',
      agent: 'Agent',
      commercial: 'Commercial'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
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
            {profile && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {profile.prenom} {profile.nom}
                    </div>
                    <div className="text-xs text-gray-600">
                      {getRoleLabel(profile.role)}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            )}
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
