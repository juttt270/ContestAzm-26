import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-ink">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onLogoutClick={() => setLogoutConfirmOpen(true)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,0,0,0.035),transparent)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.05),transparent)]"
        />
        <Topbar onMenuClick={() => setSidebarOpen(true)} onLogoutClick={() => setLogoutConfirmOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-6 lg:py-6">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={logout}
        title="Log out?"
        description="You'll need to sign in again to access your dashboard."
        confirmLabel="Log out"
        variant="danger"
      />
    </div>
  );
}
