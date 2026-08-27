'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Calendar, Plus, Edit, Trash2, 
  UserCheck, UserX, Clock, Award, Loader2,
  Shield, Key, Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RouteGuard from '@/app/components/auth/RouteGuard';

interface Role {
  id: string;
  roleType: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  period: {
    id: string;
    semester: string;
    startDate: string;
    endDate: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

function AdministracionContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('TREASURER');
  const [periods, setPeriods] = useState<any[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, usersRes, periodsRes] = await Promise.all([
        fetch('/api/administracion'),
        fetch('/api/administracion/users'),
        fetch('/api/administracion/periods'),
      ]);
      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();
      const periodsData = await periodsRes.json();
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setPeriods(Array.isArray(periodsData) ? periodsData : []);
    } catch (error) {
      console.error('Error:', error);
      setRoles([]);
      setUsers([]);
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedPeriod || !selectedRole) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const url = editingRole 
        ? `/api/administracion/${editingRole.id}`
        : '/api/administracion';
      const method = editingRole ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          periodId: selectedPeriod,
          roleType: selectedRole,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert(editingRole ? 'Rol actualizado' : 'Rol asignado correctamente');
        setShowModal(false);
        setEditingRole(null);
        setSelectedUser('');
        setSelectedPeriod('');
        setSelectedRole('TREASURER');
        fetchData();
      } else {
        alert('Error: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al guardar');
    }
  };

  const handleToggleActive = async (roleId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/administracion/${roleId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('Error al cambiar estado');
      }
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('¿Eliminar este rol?')) return;
    try {
      const res = await fetch(`/api/administracion/${roleId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const roleLabels: Record<string, string> = {
    TREASURER: 'Tesorero',
    MAINTENANCE: 'Mantenimiento',
    SECRETARY: 'Secretario',
    PRESIDENT: 'Presidente',
  };

  const roleColors: Record<string, string> = {
    TREASURER: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    MAINTENANCE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    SECRETARY: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    PRESIDENT: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👔 Administración</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Roles rotativos por semestre</p>
        </div>
        <button
          onClick={() => {
            setEditingRole(null);
            setSelectedUser('');
            setSelectedPeriod('');
            setSelectedRole('TREASURER');
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Asignar Rol
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{roles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {roles.filter(r => r.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Semestres</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{periods.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Roles únicos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(roleLabels).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de roles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semestre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{role.user?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{role.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${roleColors[role.roleType] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                      {roleLabels[role.roleType] || role.roleType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {role.period?.semester || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      role.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {role.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setSelectedUser(role.user?.id || '');
                        setSelectedPeriod(role.period?.id || '');
                        setSelectedRole(role.roleType);
                        setShowModal(true);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <Edit className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(role.id, role.isActive)}
                      className={`${role.isActive ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300' : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'}`}
                    >
                      {role.isActive ? <UserX className="w-5 h-5 inline" /> : <UserCheck className="w-5 h-5 inline" />}
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">No hay roles asignados</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Asigna el primer rol con el botón "Asignar Rol"</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingRole ? 'Editar Rol' : 'Asignar Rol'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Seleccionar usuario...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semestre</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Seleccionar semestre...</option>
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.semester} ({format(new Date(period.startDate), 'dd/MM/yyyy')} - {format(new Date(period.endDate), 'dd/MM/yyyy')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="TREASURER">💰 Tesorero</option>
                  <option value="MAINTENANCE">🔧 Mantenimiento</option>
                  <option value="SECRETARY">📝 Secretario</option>
                  <option value="PRESIDENT">👔 Presidente</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRole(null);
                    setSelectedUser('');
                    setSelectedPeriod('');
                    setSelectedRole('TREASURER');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRole ? 'Actualizar' : 'Asignar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdministracionPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <AdministracionContent />
    </RouteGuard>
  );
}