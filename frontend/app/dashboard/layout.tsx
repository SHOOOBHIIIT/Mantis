import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Mantis',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}
