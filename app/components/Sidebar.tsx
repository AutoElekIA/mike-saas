'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  DollarSign, 
  ClipboardList, 
  Calendar, 
  Receipt,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building2,
  UserCircle,
  CreditCard,
  FolderOpen,
  Shield,
  Menu,
  X,
  Bell,
  User,
  Sun,
  Moon,
  HelpCircle,
  Mail
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Gestión',
    icon: Building2,
    subitems: [
      { name: 'Directorio', href: '/directorio', icon: Users },
      { name: 'Unidades', href: '/unidades', icon: Home },
      { name: 'Propietarios', href: '/propietarios', icon: UserCircle },
    ],
  },
  {
    name: 'Financiero',
    icon: CreditCard,
    subitems: [
      { name: 'Cobranza', href: '/cobranza', icon: DollarSign },
      { name: 'Finanzas', href: '/finanzas', icon: Receipt },
    ],
  },
  {
    name: 'Documentos',
    icon: FolderOpen,
    subitems: [
      { name: 'Minutas', href: '/minutas', icon: FileText },
    ],
  },
  {
    name: 'Servicios',
    icon: ClipboardList,
    subitems: [
      { name: 'Incidencias', href: '/incidencias', icon: ClipboardList },
      { name: 'Áreas Comunes', href: '/areas-comunes', icon: Calendar },
    ],
  },
  {
    name: 'Ayuda',
    icon: HelpCircle,
    subitems: [
      { name: 'Manual y FAQ', href: '/ayuda', icon: FileText },
      { name: 'Contacto', href: '/ayuda/contacto', icon: Mail },
    ],
  },
  {
    name: 'Mi Perfil',
    href: '/perfil',
    icon: User,
  },
  {
    name: 'Pago Rápido',
    href: '/pago-rapido',
    icon: DollarSign,
  },
  {
    name: 'Configuración',
    icon: Settings,
    subitems: [
      { name: 'Administración', href: '/administracion', icon: Shield },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Gestión', 'Financiero']);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const isSubitemActive = (subitems: any[]) => {
    return subitems.some(sub => isActive(sub.href));
  };

  const publicRoutes = ['/auth/signin', '/auth/signup'];
  if (publicRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 dark:border-gray-700 px-4 py-3"
           style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="ml-3 text-xl font-bold text-blue-600 dark:text-blue-400">Mike</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300",
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700",
        isCollapsed ? "w-20" : "w-64"
      )}
      style={{ 
        backgroundColor: 'var(--sidebar-bg)', 
        borderColor: 'var(--sidebar-border)' 
      }}>
        {/* Logo */}
        <div className={cn(
          "p-4 border-b transition-all duration-300",
          "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900",
          isCollapsed ? "px-2" : ""
        )}>
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center w-full" : ""
            )}>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">Mike</h1>
                  <p className="text-[10px] text-blue-200 leading-tight">Administración</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Usuario */}
        <div className={cn(
          "p-4 border-b transition-all duration-300",
          "bg-gray-50 dark:bg-gray-800/50",
          isCollapsed ? "px-2" : ""
        )}
        style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email || ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => {
            const hasSubitems = item.subitems && item.subitems.length > 0;
            const isExpanded = expandedItems.includes(item.name);
            const isItemActive = hasSubitems 
              ? isSubitemActive(item.subitems) 
              : isActive(item.href);

            if (!hasSubitems) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group",
                    isItemActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors flex-shrink-0",
                    isItemActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium ml-3">{item.name}</span>
                      {isItemActive && (
                        <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                      )}
                    </>
                  )}
                </Link>
              );
            }

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => !isCollapsed && toggleExpand(item.name)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group",
                    isItemActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors flex-shrink-0",
                    isItemActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium text-left ml-3">{item.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </>
                  )}
                </button>
                
                {isExpanded && !isCollapsed && item.subitems && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                    {item.subitems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 group",
                          isActive(sub.href)
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <sub.icon className={cn(
                          "w-4 h-4 mr-3 transition-colors",
                          isActive(sub.href) ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        )} />
                        <span>{sub.name}</span>
                        {isActive(sub.href) && (
                          <span className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t transition-all duration-300",
          "bg-gray-50 dark:bg-gray-800/50",
          isCollapsed ? "flex flex-col items-center space-y-2" : ""
        )}
        style={{ borderColor: 'var(--sidebar-border)' }}>
          {/* Botón de tema */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-300",
              isCollapsed ? "justify-center" : "",
              theme === 'dark' 
                ? "text-yellow-400 hover:bg-yellow-500/10" 
                : "text-gray-600 hover:bg-gray-100"
            )}
            title={isCollapsed ? "Cambiar tema" : ""}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 mr-3 text-yellow-400 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="font-medium">
                {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
              </span>
            )}
          </button>

          {/* Cerrar sesión */}
          <button
            onClick={() => signOut()}
            className={cn(
              "flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
              isCollapsed ? "justify-center" : ""
            )}
            title={isCollapsed ? "Cerrar Sesión" : ""}
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 animate-slide-in shadow-xl"
               style={{ backgroundColor: 'var(--sidebar-bg)' }}>
            <div className="h-full overflow-y-auto">
              {/* Logo móvil */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-white">Mike</h1>
                    <p className="text-[10px] text-blue-200 leading-tight">Administración</p>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="ml-auto text-white/70 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Usuario móvil */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session?.user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navegación móvil */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navigation.map((item) => {
                  const hasSubitems = item.subitems && item.subitems.length > 0;
                  const isExpanded = expandedItems.includes(item.name);
                  const isItemActive = hasSubitems 
                    ? isSubitemActive(item.subitems) 
                    : isActive(item.href);

                  if (!hasSubitems) {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group",
                          isItemActive
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 mr-3 transition-colors flex-shrink-0",
                          isItemActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        )} />
                        <span className="flex-1 font-medium">{item.name}</span>
                        {isItemActive && (
                          <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                        )}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className={cn(
                          "w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group",
                          isItemActive
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 mr-3 transition-colors flex-shrink-0",
                          isItemActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        )} />
                        <span className="flex-1 font-medium text-left">{item.name}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {isExpanded && item.subitems && (
                        <div className="ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                          {item.subitems.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 group",
                                isActive(sub.href)
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                              )}
                            >
                              <sub.icon className={cn(
                                "w-4 h-4 mr-3 transition-colors",
                                isActive(sub.href) ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                              )} />
                              <span>{sub.name}</span>
                              {isActive(sub.href) && (
                                <span className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Footer móvil */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors",
                    theme === 'dark' 
                      ? "text-yellow-400 hover:bg-yellow-500/10" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 mr-3 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 mr-3 text-gray-500" />
                  )}
                  <span className="font-medium">
                    {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
                  </span>
                </button>

                <button
                  onClick={() => signOut()}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}