'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { 
  LayoutDashboard, Home, DollarSign, Users, 
  AlertCircle, TrendingUp, TrendingDown, Calendar,
  Loader2
} from 'lucide-react';
import RouteGuard from '@/app/components/auth/RouteGuard';

function DashboardContent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  const stats = [
    { title: 'Total Unidades', value: '18', icon: Home, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { title: 'Propietarios', value: '18', icon: Users, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { title: 'Ingresos del Mes', value: '$8,500', icon: TrendingUp, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { title: 'Pagos Pendientes', value: '$4,400', icon: DollarSign, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    { title: 'Incidencias Activas', value: '3', icon: AlertCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    { title: 'Ocupación', value: '75%', icon: TrendingDown, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Bienvenido, {session.user?.name || 'Usuario'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actividad reciente */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🕐 Actividad Reciente</h2>
        <div className="space-y-3">
          {[
            { action: 'Pago registrado', detail: 'Lote 001 - $2,200', time: 'Hace 2 horas' },
            { action: 'Nueva incidencia', detail: 'Fuga de agua en Torre A', time: 'Hace 5 horas' },
            { action: 'Reserva de área', detail: 'Salón de eventos - 15/09/2026', time: 'Hace 1 día' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.action}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.detail}</p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER']}>
      <DashboardContent />
    </RouteGuard>
  );
}