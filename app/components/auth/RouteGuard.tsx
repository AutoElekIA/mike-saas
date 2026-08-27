'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'BOARD_MEMBER' | 'RESIDENT' | 'GUEST';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

// Configuración de permisos por ruta
const routePermissions: Record<string, UserRole[]> = {
  '/directorio': ['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT', 'GUEST'],
  '/propietarios': ['SUPER_ADMIN', 'ADMIN'],
  '/propietarios/': ['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT'],
  '/unidades': ['SUPER_ADMIN', 'ADMIN'],
  '/cobranza': ['SUPER_ADMIN', 'ADMIN'],
  '/finanzas': ['SUPER_ADMIN', 'ADMIN'],
  '/minutas': ['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT'],
  '/administracion': ['SUPER_ADMIN', 'ADMIN'],
  '/incidencias': ['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT'],
  '/areas-comunes': ['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT'],
  '/dashboard': ['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER'],
};

export default function RouteGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth/signin' 
}: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si la sesión está cargando, esperar
    if (status === 'loading') return;

    // Si no hay sesión, redirigir al login
    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Determinar roles permitidos para la ruta actual
    let roles = allowedRoles;
    if (!roles) {
      // Buscar en la configuración de permisos
      const matchingRoute = Object.keys(routePermissions).find(route => 
        pathname === route || pathname?.startsWith(route + '/')
      );
      roles = matchingRoute ? routePermissions[matchingRoute] : ['SUPER_ADMIN', 'ADMIN'];
    }

    // Verificar si el usuario tiene rol permitido
    const userRole = session.user?.role as UserRole;
    if (roles && !roles.includes(userRole)) {
      // Redirigir a página de acceso denegado o al dashboard
      router.push('/dashboard');
    }
  }, [session, status, router, pathname, allowedRoles, redirectTo]);

  // Mostrar loading mientras se verifica
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay sesión o no tiene permisos, no renderizar
  if (!session) return null;

  const userRole = session.user?.role as UserRole;
  let roles = allowedRoles;
  if (!roles) {
    const matchingRoute = Object.keys(routePermissions).find(route => 
      pathname === route || pathname?.startsWith(route + '/')
    );
    roles = matchingRoute ? routePermissions[matchingRoute] : ['SUPER_ADMIN', 'ADMIN'];
  }

  if (roles && !roles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}