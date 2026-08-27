'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const publicRoutes = ['/auth/signin', '/auth/signup'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0">
        <div className="lg:p-6 p-4 pt-20 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}