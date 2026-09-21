import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 relative overflow-hidden flex flex-col bg-white dark:bg-slate-950">
        {children}
      </div>
    </div>
  );
}
