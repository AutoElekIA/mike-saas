'use client';

import { useState, useEffect } from 'react';
import { 
  AlertCircle, Plus, Search, Eye, CheckCircle, 
  Clock, User, Home, Loader2, Trash2, Edit,
  AlertTriangle, Info, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RouteGuard from '@/app/components/auth/RouteGuard';

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  photoUrl: string | null;
  createdAt: string;
  reporter: {
    name: string;
  };
  condominium: {
    name: string;
  };
}

function IncidenciasContent() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidencias');
      const data = await res.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: 'Pendiente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Clock },
      IN_PROGRESS: { label: 'En Progreso', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: AlertCircle },
      RESOLVED: { label: 'Resuelto', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle },
      CLOSED: { label: 'Cerrado', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300', icon: XCircle },
    };
    return configs[status] || configs.PENDING;
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      LOW: { label: 'Baja', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' },
      MEDIUM: { label: 'Media', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
      HIGH: { label: 'Alta', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' },
      CRITICAL: { label: 'Crítica', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
    };
    return configs[priority] || configs.MEDIUM;
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(search.toLowerCase()) ||
      incident.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status === 'PENDING').length,
    inProgress: incidents.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    closed: incidents.filter(i => i.status === 'CLOSED').length,
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔧 Incidencias</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Reportes y seguimiento de incidencias</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Incidencia
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">En Progreso</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Resueltas</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Cerradas</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.closed}</p>
        </div>
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar incidencias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="RESOLVED">Resueltas</option>
          <option value="CLOSED">Cerradas</option>
        </select>
      </div>

      {/* Lista de incidencias */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => {
          const StatusIcon = getStatusConfig(incident.status).icon;
          const priorityConfig = getPriorityConfig(incident.priority);
          
          return (
            <div key={incident.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${getStatusConfig(incident.status).color}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusConfig(incident.status).color}`}>
                        {getStatusConfig(incident.status).label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{incident.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1" />
                        {incident.reporter?.name || 'Anónimo'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {format(new Date(incident.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </span>
                      {incident.photoUrl && (
                        <span className="flex items-center text-blue-600 dark:text-blue-400">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Ver foto
                        </span>
                      )}
                    </div>
                  </div>
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
            </div>
          );
        })}
      </div>

      {filteredIncidents.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">No hay incidencias registradas</p>
        </div>
      )}
    </div>
  );
}

export default function IncidenciasPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT']}>
      <IncidenciasContent />
    </RouteGuard>
  );
}