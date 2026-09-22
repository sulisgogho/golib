import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full bg-surface-50 dark:bg-surface-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative overflow-hidden flex flex-col bg-surface-50 dark:bg-surface-950">
        {children}
      </div>
    </div>
  );
}
