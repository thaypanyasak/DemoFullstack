"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Store,
} from "lucide-react"

import { SearchForm } from "@/components/search-form"
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
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navMain = [
  {
    title: "ພາບລວມ",
    items: [
      {
        title: "ໜ້າຫຼັກ",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "ຈັດການສາງ",
    items: [
      {
        title: "ສິນຄ້າ",
        url: "/dashboard/products",
        icon: Package,
      },
      {
        title: "ຄໍາສັ່ງຊື້",
        url: "#",
        icon: ShoppingCart,
      },
      {
        title: "ລູກຄ້າ",
        url: "#",
        icon: Users,
      },
    ],
  },
  {
    title: "ລາຍງານ",
    items: [
      {
        title: "ສະຖິຕິ",
        url: "#",
        icon: BarChart3,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">ສາງສິນຄ້າ Pro</span>
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </div>
        <SearchForm className="mt-1" />
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<a href={item.url} />}>
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="#" />}>
              <Settings className="h-4 w-4" />
              ການຕັ້ງຄ່າ
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="#" />} className="text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              ອອກຈາກລະບົບ
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
