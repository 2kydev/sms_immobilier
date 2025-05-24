
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
  chart-bar,
  users,
  image,
  calendar,
  folder
} from 'lucide-react';

const menuItems = [
  {
    title: 'Tableau de Bord',
    icon: chart-bar,
    id: 'dashboard'
  },
  {
    title: 'Clients',
    icon: users,
    id: 'clients'
  },
  {
    title: 'Propriétés',
    icon: image,
    id: 'properties'
  },
  {
    title: 'Visites',
    icon: calendar,
    id: 'visits'
  },
  {
    title: 'Pipeline',
    icon: folder,
    id: 'pipeline'
  }
];

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function AppSidebar({ activeSection = 'dashboard', onSectionChange }: AppSidebarProps) {
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
              {menuItems.map((item) => (
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
