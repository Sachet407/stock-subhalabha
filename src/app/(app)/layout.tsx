import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "../globals.css"
import { ThemeProvider } from "@/components/theme-Provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSIdebar";

import { cookies } from "next/headers"
import { SiteHeader } from "@/components/ui/site-header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "subhalabha",
  description: "Internal function of subhalabha",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
      >

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden min-h-screen">
              <SiteHeader />
              <main className="flex-1 overflow-auto p-6 lg:p-10 bg-muted/20">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}

