"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Store,
  QrCode,
  Tags,
  Users,
} from "lucide-react"

import { SearchForm } from "@/components/search-form"
import { supabase } from "@/lib/supabase"
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
    title: "ຈັດການຮ້ານອາຫານ",
    items: [
      {
        title: "ເມນູອາຫານ",
        url: "/dashboard/products",
        icon: UtensilsCrossed,
      },
      {
        title: "ຈັດການປະເພດອາຫານ",
        url: "/dashboard/categories",
        icon: Tags,
      },
      {
        title: "ຈັດການອໍເດີ້",
        url: "/dashboard/orders",
        icon: ClipboardList,
      },
      {
        title: "ຈັດການໂຕະ & QR Code",
        url: "/dashboard/tables",
        icon: QrCode,
      },
      {
        title: "ຈັດການພະນັກງານ",
        url: "/dashboard/staff",
        icon: Users,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setRole(session.user.user_metadata?.role || "STAFF");
      }
    };
    fetchUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setRole(session.user.user_metadata?.role || "STAFF");
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const filteredNavMain = React.useMemo(() => {
    if (role === "STAFF") {
      return [
        {
          title: "ຈັດການຮ້ານອາຫານ",
          items: [
            {
              title: "ຈັດການອໍເດີ້",
              url: "/dashboard/orders",
              icon: ClipboardList,
            },
          ],
        },
      ];
    }
    return navMain;
  }, [role]);

  return (
    <Sidebar {...props}>
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">ລະບົບສັ່ງອາຫານ Pro</span>
            <span className="text-xs text-muted-foreground">v2.0.0</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        {filteredNavMain.map((group) => (
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
            <SidebarMenuButton
              onClick={() => supabase.auth.signOut()}
              className="text-destructive hover:text-destructive cursor-pointer w-full"
            >
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
