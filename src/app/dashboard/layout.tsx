import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-screen flex-col bg-paper lg:flex-row">
      <MobileNav />
      <Sidebar />
      {children}
    </div>
  );
}