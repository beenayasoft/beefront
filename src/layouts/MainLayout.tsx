import { Outlet } from "react-router-dom";
import { SimpleSidebar } from "@/components/navigation/SimpleSidebar";
import { SimpleHeader } from "@/components/navigation/SimpleHeader";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  className?: string;
}

export function MainLayout({ className }: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-white dark:bg-neutral-950", className)}>
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <SimpleSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <SimpleHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
