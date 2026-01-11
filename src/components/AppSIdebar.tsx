"use client"
import {
  LayoutDashboard,
  Package,
  Construction,
  Factory,
  Warehouse,
  BarChart3,
  Settings,
  X,
  DatabaseBackup
} from "lucide-react"

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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Menu items.
const Stockitems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Yarn Stock",
    url: "/yarn-stock",
    icon: Package,
  },
  {
    title: "Unfinished Goods",
    url: "/unfinished-goods",
    icon: Construction,
  },
  {
    title: "Biratnagar Production",
    url: "/biratnagar-production",
    icon: Factory,
  },
  {
    title: "Birgunj Godown",
    url: "/birgunj-godown",
    icon: Warehouse,
  },
]
const proditems = [
  {
    title: "Add Production",
    url: "/production/add",
    icon: Factory,
  },
  {
    title: "Preview Data",
    url: "/production/preview",
    icon: DatabaseBackup,
  },
  {
    title: "Analysis",
    url: "/production/analysis",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar className="font-sans border-r-0">
      <SidebarHeader className="h-auto flex items-center justify-between px-6 pb-4 pt-8 border-b border-sidebar-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
              S
            </div>
            <span className="font-bold text-xl tracking-tight">Subhalabha</span>

            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full hover:bg-sidebar-accent/80 active:scale-95 transition-all"
                onClick={() => setOpenMobile(false)}
              >
                <X className="size-6 text-sidebar-foreground/60" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            )}
          </div>
        </div>

      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 mb-4 text-sidebar-foreground/80 uppercase tracking-widest text-[12px] font-bold">

            Stock Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {Stockitems.map((stockitem) => {
                const isActive = pathname === stockitem.url
                return (
                  <SidebarMenuItem key={stockitem.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-11 px-4 text-[15px] rounded-xl transition-all duration-300 relative group",
                        isActive
                          ? "bg-sidebar-accent/80 text-sidebar-foreground font-semibold"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <Link href={stockitem.url}>
                        <stockitem.icon className={cn("size-[18px] transition-colors", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                        <span>{stockitem.title}</span>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 mb-4 text-sidebar-foreground/80 uppercase tracking-widest text-[12px] font-bold">
            Production Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {proditems.map((proditem) => {
                const isActive = pathname === proditem.url
                return (
                  <SidebarMenuItem key={proditem.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-11 px-4 text-[15px] rounded-xl transition-all duration-300 relative group",
                        isActive
                          ? "bg-sidebar-accent/80 text-sidebar-foreground font-semibold"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <Link href={proditem.url}>
                        <proditem.icon className={cn("size-[18px] transition-colors", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                        <span>{proditem.title}</span>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "h-11 px-4 text-[15px] rounded-xl transition-all duration-300 relative group",
                pathname === "/settings"
                  ? "bg-sidebar-accent/80 text-sidebar-foreground font-semibold"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              )}
            >
              <Link href="/settings">
                <Settings className={cn("size-[18px] transition-colors", pathname === "/settings" ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                <span>Settings</span>
                {pathname === "/settings" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
