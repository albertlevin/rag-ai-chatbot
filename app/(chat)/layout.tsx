// this is a shared chat layout for all routes in this segment
import { cookies } from "next/headers";
import Script from "next/script";
import { AppSidebar } from "@/components/app-sidebar";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "../(auth)/auth";

export const experimental_ppr = true;

// pyodide allows us to run Python code in browser (like a mini-runtime)
export default async function Layout({
    children, }: { children: React.ReactNode }) {
    const [session, cookieStore] = await Promise.all([auth(), cookies()]);
    const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

    return (
        <>
            <Script
                src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
                strategy="beforeInteractive"
            />
            <DataStreamProvider>
                <SidebarProvider defaultOpen={!isCollapsed}>
                    <AppSidebar user={session?.user} />
                    <SidebarInset>{children}</SidebarInset>
                </SidebarProvider>
            </DataStreamProvider>
        </>
    )
}

