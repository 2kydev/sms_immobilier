
import React from 'react';
import { Calendar, Home, Users, Building2, UserPlus, Settings, BarChart3, ShoppingCart } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
      { title: "Gestion", url: "/?tab=properties" },
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
    title: "Utilisateurs",
    url: "/?tab=users",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/" && (!location.search || location.search === "");
    }
    return location.pathname === url || location.pathname + location.search === url;
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-primary mb-4">
            SMS Immobilier
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
