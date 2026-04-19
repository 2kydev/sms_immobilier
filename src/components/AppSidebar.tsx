
import React from 'react';
import { Calendar, Home, Users, Building2, UserPlus, Settings, LogOut, ClipboardList } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

const items = [
  {
    title: "Tableau de bord",
    url: "/",
    icon: Home,
  },
  {
    title: "Propriétés",
    url: "#",
    icon: Building2,
    subItems: [
      { title: "Gestion de bien", url: "/property-management" },
      { title: "Biens à vendre", url: "/properties-for-sale" },
    ]
  },
  {
    title: "Clients",
    url: "/?tab=clients",
    icon: Users,
  },
  {
    title: "Visites",
    url: "/?tab=visits",
    icon: Calendar,
  },
  {
    title: "Agents",
    url: "/?tab=agents",
    icon: UserPlus,
  },
  {
    title: "Journal",
    url: "/?tab=audit",
    icon: ClipboardList,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin, canAccessDashboard, role } = useRole();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !"
      });
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return '';
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'dg':
        return 'Directeur Général';
      case 'commercial':
        return 'Commercial';
      case 'agent':
        return 'Agent Immobilier';
      default:
        return role;
    }
  };

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/" && (!location.search || location.search === "");
    }
    return location.pathname === url || location.pathname + location.search === url;
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-3 py-4 px-4">
        <img
          src="/lovable-uploads/2f182060-60bf-4ab5-a6b2-e6092170b088.png"
          alt="SMS Immobilier"
          className="h-9 w-9 object-contain"
        />
        <span className="font-bold text-primary text-base leading-tight">SMS Immobilier</span>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Vérifier les permissions pour chaque élément
                const tabName = item.url.includes('tab=') ? item.url.split('tab=')[1] : (item.url === '/' ? 'dashboard' : '');
                
                if (tabName === 'dashboard' && !canAccessDashboard()) {
                  return null;
                }
                if (tabName === 'agents' && !isAdmin()) {
                  return null;
                }
                if (tabName === 'audit' && !canAccessDashboard()) {
                  return null;
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.subItems ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700">
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </div>
                        <div className="ml-6 space-y-1">
                          {item.subItems.map((subItem) => (
                            <SidebarMenuButton key={subItem.url} asChild isActive={isActive(subItem.url)}>
                              <Link to={subItem.url} className="text-sm">
                                {subItem.title}
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="flex items-center gap-3 p-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.email?.split('@')[0] || 'Admin'}
            </p>
            {role && (
              <p className="text-xs text-muted-foreground">
                {getRoleLabel(role)}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
