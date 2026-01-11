"use client"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "../ModeToggle"
import { usePathname } from "next/navigation"

const routeTitles: Record<
    string,
    { parent?: string; title: string }
> = {
    "/dashboard": { title: "Dashboard" },

    "/yarn-stock": {
        parent: "Stock",
        title: "Yarn Stock",
    },
    "/unfinished-goods": {
        parent: "Stock",
        title: "Unfinished Goods",
    },
    "/biratnagar-production": {
        parent: "Stock",
        title: "Biratnagar Production",
    },
    "/birgunj-godown": {
        parent: "Stock",
        title: "Birgunj Godown",
    },
    "/production": {
        parent: "Production",
        title: "Production Data",
    },
    "/settings": { title: "Settings" },
}

export function SiteHeader() {
    const pathname = usePathname()
    const route = routeTitles[pathname] || { title: "Dashboard" }

    return (
        <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-6 transition-all duration-300">
            <SidebarTrigger className="-ml-1 text-sidebar-foreground/60 hover:text-primary transition-colors" />
            <Separator
                orientation="vertical"
                className="h-6 mx-2 opacity-20"
            />
            <div className="flex-1">
                <h1 className="text-lg font-medium tracking-tight text-foreground/90">
                    {route.parent ? (
                        <>
                            <span className="">
                                {route.parent}
                            </span>
                            <span className="mx-2">›</span>
                            <span>{route.title}</span>
                        </>
                    ) : (
                        route.title
                    )}
                </h1>
            </div>
            <div className="flex items-center gap-4 mr-6">
                <ModeToggle />
            </div>
        </header>
    )
}
