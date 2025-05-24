
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  ChartBar,
  Users,
  Image,
  Calendar,
  Folder,
  Settings
} from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

const menuItems = [
  {
    title: 'Tableau de Bord',
    icon: ChartBar,
    id: 'dashboard',
    allowedRoles: ['admin', 'directeur']
  },
  {
    title: 'Clients',
    icon: Users,
    id: 'clients',
    allowedRoles: ['admin', 'commercial', 'agent']
  },
  {
    title: 'Propriétés',
    icon: Image,
    id: 'properties',
    allowedRoles: ['admin', 'agent']
  },
  {
    title: 'Visites',
    icon: Calendar,
    id: 'visits',
    allowedRoles: ['admin', 'agent', 'commercial']
  },
  {
    title: 'Pipeline',
    icon: Folder,
    id: 'pipeline',
    allowedRoles: ['admin', 'directeur', 'commercial']
  },
  {
    title: 'Utilisateurs',
    icon: Settings,
    id: 'users',
    allowedRoles: ['admin']
  }
];

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function AppSidebar({ activeSection = 'dashboard', onSectionChange }: AppSidebarProps) {
  const { profile } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    !item.allowedRoles || !profile || item.allowedRoles.includes(profile.role)
  );

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent className="bg-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 real-estate-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RE</span>
            </div>
            <div>
              <h2 className="font-bold text-primary">Real Estate</h2>
              <p className="text-xs text-gray-500">CRM Pro</p>
            </div>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-gray-500 uppercase text-xs font-semibold">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    className={`w-full justify-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      activeSection === item.id 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => onSectionChange?.(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
