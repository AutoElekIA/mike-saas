'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Search, Clock, Users, 
  CheckCircle, XCircle, Loader2, Home,
  DollarSign, Edit, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RouteGuard from '@/app/components/auth/RouteGuard';

interface CommonArea {
  id: string;
  name: string;
  description: string | null;
  maxCapacity: number | null;
  pricePerHour: number | null;
  requiresApproval: boolean;
  reservations: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    user: { name: string };
  }[];
}

function AreasComunesContent() {
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/areas-comunes');
      const data = await res.json();
      setAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(search.toLowerCase()) ||
    area.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏊 Áreas Comunes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Reserva y gestión de áreas comunes</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Área
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar áreas comunes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Grid de áreas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAreas.map((area) => (
          <div key={area.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{area.name}</h3>
                {area.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{area.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {area.maxCapacity && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Users className="w-4 h-4 mr-2" />
                  Capacidad: {area.maxCapacity} personas
                </div>
              )}
              {area.pricePerHour && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ${area.pricePerHour}/hora
                </div>
              )}
              <div className="flex items-center text-sm">
                {area.requiresApproval ? (
                  <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <Clock className="w-4 h-4 mr-1" />
                    Requiere aprobación
                  </span>
                ) : (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprobación automática
                  </span>
                )}
              </div>
            </div>

            {/* Reservas */}
            {area.reservations && area.reservations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Reservas recientes
                </p>
                <div className="space-y-1">
                  {area.reservations.slice(0, 2).map((res) => (
                    <div key={res.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {format(new Date(res.startTime), "dd/MM HH:mm", { locale: es })}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">{res.user?.name || 'Usuario'}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        res.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        res.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {res.status === 'APPROVED' ? 'Aprobada' :
                         res.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                  {area.reservations.length > 2 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      + {area.reservations.length - 2} más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAreas.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">No hay áreas comunes registradas</p>
        </div>
      )}
    </div>
  );
}

export default function AreasComunesPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT']}>
      <AreasComunesContent />
    </RouteGuard>
  );
}